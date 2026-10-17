"""Run a reproducible forcing comparison, numerical checks, and scientific plots."""

import argparse
import csv
from dataclasses import replace
import hashlib
import json
import os
from pathlib import Path
import platform
import subprocess
import time

import numpy as np

from signals import pangram_signal, wav_signal
from solver import Config, Flow, simulate


HERE = Path(__file__).resolve().parent


def json_default(value):
    if isinstance(value, np.generic):
        return value.item()
    raise TypeError(f"Unsupported JSON value: {type(value).__name__}")


def reserve_output(out):
    """Reserve an empty artifact directory without overwriting another run."""
    out.mkdir(parents=True, exist_ok=True)
    if any(out.iterdir()):
        raise ValueError(f"Output directory is not empty: {out}; choose a new --out path")
    # Exclusive creation resolves the race between two processes seeing an empty directory.
    with (out / ".run-reservation").open("x") as stream:
        stream.write(f"pid={os.getpid()}\n")


def relative_refinement_changes(standard, spatial, fine):
    return dict(
        spatial=abs(spatial-standard)/max(abs(spatial), 1e-300),
        temporal=abs(fine-spatial)/max(abs(fine), 1e-300),
        combined=abs(fine-standard)/max(abs(fine), 1e-300))


def spectrum_comparison(original, surrogate):
    a = np.fft.rfft(original.samples, axis=0, norm="forward")
    b = np.fft.rfft(surrogate.samples, axis=0, norm="forward")
    return {
        "max_channel_magnitude_error": float(np.max(np.abs(np.abs(a)-np.abs(b)))),
        "max_cross_spectrum_error": float(np.max(np.abs(a[:, 0]*a[:, 1].conj()
                                                       - b[:, 0]*b[:, 1].conj()))),
        "rms": np.sqrt(np.mean(surrogate.samples**2, axis=0)).tolist(),
    }


def coefficient_supremum(signal):
    # Triangle inequality for the continuous Fourier interpolant, not just samples.
    coefficients = np.fft.rfft(signal.samples, axis=0, norm="forward")
    return np.abs(coefficients[0])+2*np.abs(coefficients[1:]).sum(axis=0)


def run_case(label, config, signal, keep_snapshots=False):
    start = time.monotonic()
    result = simulate(config, signal)
    flow = Flow(config)
    maxima = coefficient_supremum(signal)
    force_bound = config.amplitude*float(np.linalg.norm(maxima))
    curl_bound = config.amplitude*float(np.sqrt(maxima[0]**2+2*maxima[1]**2))
    initial = result["rows"][0]
    initial_w, initial_u = np.sqrt(2*initial["enstrophy"]), np.sqrt(2*initial["energy"])
    ratios = []
    for row in result["rows"]:
        decay = np.exp(-result["alpha"]*row["time"])
        row["vorticity_bound"] = float(decay*initial_w+curl_bound/result["alpha"]*(1-decay))
        row["velocity_bound"] = float(decay*initial_u+force_bound/result["alpha"]*(1-decay))
        ratios.append(np.sqrt(2*row["enstrophy"])/max(row["vorticity_bound"], 1e-300))
    result["label"] = label
    result["continuous_forcing_sup_bounds"] = dict(velocity=force_bound, curl=curl_bound)
    result["max_vorticity_to_bound_ratio"] = float(max(ratios))
    result["wall_seconds"] = time.monotonic()-start
    if not keep_snapshots:
        result.pop("final_vorticity")
    print(f"{label}: J={result['mean_palinstrophy']:.8g}, "
          f"budget error={result['max_enstrophy_balance_error']:.2g}, "
          f"{result['wall_seconds']:.1f}s", flush=True)
    return result


def make_plot(out, signal, cases, summary):
    os.environ.setdefault("MPLCONFIGDIR", str(out / ".matplotlib"))
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plt.rcParams.update({"font.size": 10, "axes.spines.top": False,
                         "axes.spines.right": False, "svg.fonttype": "none"})
    fig, axes = plt.subplots(2, 2, figsize=(11, 7.3), constrained_layout=True)
    original = next(c for c in cases if c["label"] == "original_open")
    controlled = next(c for c in cases if c["label"] == "original_feedback")
    surrogate = next(c for c in cases if c["label"].startswith("surrogate_")
                     and c["label"].endswith("_open"))
    t = np.arange(len(signal.samples))*signal.period/len(signal.samples)
    axes[0, 0].plot(t, signal.samples[:, 0], color="#315f91", lw=1.4, label="Input channel 1")
    axes[0, 0].plot(t, signal.samples[:, 1], color="#aa7547", lw=1.1, label="Input channel 2")
    source_title = ("Claude's verified pangram" if signal.metadata["source"] == "repository_prime_pangram"
                    else "local audio features")
    axes[0, 0].set(xlabel="Nondimensional time", ylabel="Unit-RMS coefficient",
                   title=f"A  Reproducible input: {source_title}")
    axes[0, 0].legend(frameon=False, fontsize=8)
    for result, color, title in [(original, "#315f91", "Original / open loop"),
                                  (controlled, "#b4573c", "Original / feedback"),
                                  (surrogate, "#879391", "One phase surrogate / open loop")]:
        axes[0, 1].plot([r["time"] for r in result["rows"]],
                        [r["enstrophy"] for r in result["rows"]],
                        color=color, lw=1.5, label=title)
    axes[0, 1].set(xlabel="Nondimensional time", ylabel="Enstrophy = mean(vorticity²) / 2",
                   title="B  Flow response; all models here are 2-D")
    axes[0, 1].legend(frameon=False, fontsize=8)
    colors = ["#315f91", "#b4573c"]
    for j, condition in enumerate(["open", "feedback"]):
        values = [c["mean_palinstrophy"] for c in cases
                  if c["label"].startswith("surrogate_") and c["label"].endswith(condition)]
        offsets = np.linspace(-0.14, 0.14, len(values))
        axes[1, 0].scatter(j+offsets, values, s=22, alpha=0.7, color=colors[j], label=None)
        point = original if condition == "open" else controlled
        axes[1, 0].scatter(j, point["mean_palinstrophy"], marker="D", s=75,
                          facecolor="white", edgecolor=colors[j], linewidth=2,
                          label="Original input" if j == 0 else None, zorder=5)
    axes[1, 0].set(xticks=[0, 1], xticklabels=["Open loop", "Low-mode feedback"],
                   ylabel="J = time-mean palinstrophy",
                   title="C  Matched spectra, different temporal phases")
    axes[1, 0].legend(frameon=False, fontsize=8)
    refinement_text = (f"{100*summary['max_refinement_change']:.3g}%"
                       if summary['max_refinement_change'] is not None else "not run")
    text = (f"Spectrum mismatch: {summary['max_spectrum_error']:.1e}\n"
            f"Largest enstrophy budget error: {summary['max_enstrophy_balance_error']:.1e}\n"
            f"Largest refinement change in J: {refinement_text}\n\n"
            "Diamond = original; circles = seeded phase surrogates.\n"
            "Same spectrum does not mean equal injected fluid work.\n\n"
            "This is a numerical 2-D calibration.\n"
            "It makes no claim about meaning, sacred status,\n"
            "or global regularity of arbitrary 3-D flows.")
    axes[1, 1].axis("off")
    axes[1, 1].text(0, 0.98, "D  What the checks support", fontsize=12, va="top")
    axes[1, 1].text(0, 0.82, text, fontsize=10, va="top", linespacing=1.65)
    fig.suptitle("Regularizing forcing — first reproducible experiment", fontsize=16)
    fig.savefig(out / "experiment.png", dpi=170)
    fig.savefig(out / "experiment.svg")
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path,
                        default=HERE / "runs" / f"run-{time.time_ns()}")
    parser.add_argument("--wav", type=Path, help="Optional local PCM WAV; never uploaded")
    parser.add_argument("--surrogates", type=int, default=8)
    parser.add_argument("--seed", type=int, default=20261016)
    parser.add_argument("--period", type=float, default=8.0)
    parser.add_argument("--duration", type=float, default=16.0)
    parser.add_argument("--grid", type=int, default=48)
    parser.add_argument("--dt", type=float, default=0.01)
    parser.add_argument("--feedback", type=float, default=0.8)
    parser.add_argument("--no-refinement", action="store_true",
                        help="Smoke run only; fails the completed-calibration validation gate")
    args = parser.parse_args()
    if args.surrogates < 1 or args.feedback <= 0:
        parser.error("need at least one surrogate and positive feedback strength")
    out = args.out.resolve()
    reserve_output(out)
    source_hashes = {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                     for p in [HERE/"solver.py", HERE/"signals.py", HERE/"run_experiment.py"]}
    signal = (wav_signal(args.wav, args.period) if args.wav
              else pangram_signal(args.period))
    base = Config(n=args.grid, dt=args.dt, duration=args.duration)
    cases, checks = [], []
    sources = [("original", signal)] + [
        (f"surrogate_{seed}", signal.phase_scramble(seed))
        for seed in range(args.seed, args.seed+args.surrogates)]
    (out / "manifest.json").write_text(json.dumps({
        "source": signal.metadata, "source_sha256": source_hashes,
        "base_config": vars(base), "feedback_strength": args.feedback,
        "seed_start": args.seed, "surrogates": args.surrogates},
        indent=2, default=json_default)+"\n")
    def checkpoint(result):
        # Preserve every completed computation even if later plotting/export fails.
        with (out / "completed_cases.jsonl").open("a") as stream:
            stream.write(json.dumps(result, default=json_default, allow_nan=False)+"\n")
    # Every original/surrogate and open/feedback combination is retained.
    for label, source in sources:
        checks.append(spectrum_comparison(signal, source))
        for condition, gain in [("open", 0.0), ("feedback", args.feedback)]:
            result = run_case(f"{label}_{condition}", replace(base, feedback=gain), source)
            cases.append(result)
            checkpoint(result)
    refinements = []
    refinement_comparisons = []
    if not args.no_refinement:
        # Audit both waveform types and both feedback conditions, not just a favorable case.
        for label, source in sources[:2]:
            for condition, gain in [("open", 0.0), ("feedback", args.feedback)]:
                standard = next(c for c in cases if c["label"] == f"{label}_{condition}")
                fine_config = replace(base, n=base.n+16, dt=base.dt/2, feedback=gain)
                fine = run_case(f"{label}_{condition}_refined", fine_config, source)
                checkpoint(fine)
                spatial = run_case(f"{label}_{condition}_space_only",
                                   replace(base, n=base.n+16, feedback=gain), source)
                checkpoint(spatial)
                changes = relative_refinement_changes(standard["mean_palinstrophy"],
                                                       spatial["mean_palinstrophy"],
                                                       fine["mean_palinstrophy"])
                refinement_comparisons.append({"case": standard["label"], **changes})
                for refined in [spatial, fine]:
                    refined["relative_J_change"] = abs(
                        refined["mean_palinstrophy"]-standard["mean_palinstrophy"]
                    )/max(abs(refined["mean_palinstrophy"]), 1e-300)
                    refinements.append(refined)
    all_cases = cases+refinements
    spectrum_error = max(max(c["max_channel_magnitude_error"], c["max_cross_spectrum_error"])
                         for c in checks)
    refinement_error = max((c[key] for c in refinement_comparisons
                            for key in ["spatial", "temporal", "combined"]), default=float("inf"))
    e_error = max(c["max_energy_balance_error"] for c in all_cases)
    z_error = max(c["max_enstrophy_balance_error"] for c in all_cases)
    bound_ratio = max(c["max_vorticity_to_bound_ratio"] for c in all_cases)
    gates = dict(spectra_matched=spectrum_error < 1e-12,
                 energy_budget=e_error < 1e-5, enstrophy_budget=z_error < 1e-5,
                 norm_envelope=bound_ratio < 1+1e-8,
                 refinement=bool(refinements) and refinement_error < 0.01,
                 nonlinear_active=min(c["max_nonlinear_l2"] for c in cases) > 1e-3,
                 spectral_tail=max(c["max_tail_fraction"] for c in all_cases) < 0.01)
    gates["source_stable"] = source_hashes == {
        p.name: hashlib.sha256(p.read_bytes()).hexdigest()
        for p in [HERE/"solver.py", HERE/"signals.py", HERE/"run_experiment.py"]}
    gates = {key: bool(value) for key, value in gates.items()}
    condition_stats = {}
    for condition in ["open", "feedback"]:
        original = next(c for c in cases if c["label"] == f"original_{condition}")
        surrogates = [c["mean_palinstrophy"] for c in cases
                      if c["label"].startswith("surrogate_") and c["label"].endswith(condition)]
        condition_stats[condition] = dict(original_J=original["mean_palinstrophy"],
            surrogate_min=min(surrogates), surrogate_max=max(surrogates),
            surrogate_mean=float(np.mean(surrogates)),
            surrogates_below_original=sum(x < original["mean_palinstrophy"] for x in surrogates),
            count=len(surrogates))
    try:
        base_commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=HERE,
                                             text=True).strip()
    except (subprocess.CalledProcessError, OSError):
        base_commit = None
    summary = dict(
        schema=1, model="2-D periodic incompressible Navier-Stokes, dimensionless",
        status="numerical calibration; no 3-D or semantic theorem",
        source=signal.metadata, base_commit=base_commit,
        python=platform.python_version(), numpy=np.__version__,
        source_sha256=source_hashes,
        primary_statistic="time-mean spatial mean of |grad vorticity|^2 (palinstrophy)",
        analysis_window=[0.0, base.duration], includes_initial_transient=True,
        maxima_are_over_recorded_samples=True,
        seed_start=args.seed, surrogate_count=args.surrogates,
        max_spectrum_error=spectrum_error, max_energy_balance_error=e_error,
        max_enstrophy_balance_error=z_error,
        max_refinement_change=refinement_error if refinements else None,
        max_vorticity_to_bound_ratio=bound_ratio,
        checks=gates, all_checks_passed=all(gates.values()),
        comparison=condition_stats,
        cases=[{k:v for k,v in c.items() if k != "rows"} for c in cases],
        refinements=[{k:v for k,v in c.items() if k != "rows"} for c in refinements],
        refinement_comparisons=refinement_comparisons,
        surrogate_spectrum_checks=checks,
        interpretation=("Synthetic pangram encoding is arbitrary. Equal spectra preserve RMS and "
                        "cross spectra but not peaks, nonstationarity, or actual fluid input work. "
                        "Surrogate rank is descriptive; eight surrogates and one synthetic input "
                        "do not establish a general advantage. No physical time scale is inferred."))
    (out/"summary.json").write_text(json.dumps(summary, indent=2, allow_nan=False,
                                              default=json_default)+"\n")
    with (out/"trajectories.csv").open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=["case"]+list(cases[0]["rows"][0]))
        writer.writeheader()
        for c in cases:
            for row in c["rows"]:
                writer.writerow({"case": c["label"], **row})
    with (out/"input.csv").open("w", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(["time", "channel_1", "channel_2"])
        for i, values in enumerate(signal.samples):
            writer.writerow([i*signal.period/len(signal.samples), *values])
    make_plot(out, signal, cases, summary)
    print(json.dumps({"all_checks_passed": summary["all_checks_passed"],
                      "checks": gates, "comparison": condition_stats}, indent=2,
                     default=json_default))
    if not summary["all_checks_passed"]:
        raise SystemExit("Calibration incomplete: inspect failed checks in summary.json")


if __name__ == "__main__":
    main()
