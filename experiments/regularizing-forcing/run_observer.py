"""Reproduce the untouched-reference / nudged-observer research calibration."""
import argparse
import csv
from dataclasses import asdict, replace
import hashlib
import json
import os
from pathlib import Path
import platform
import subprocess
import time

import numpy as np

from grounding_checks import run_identity_checks, upstream_reproduction
from observer import ObserverConfig, simulate_observer
from run_experiment import json_default, relative_refinement_changes, reserve_output


HERE = Path(__file__).resolve().parent


def compact_case(result):
    return {k:v for k,v in result.items() if k not in
            ("final_reference_vorticity","final_observer_vorticity")}


def execute(label,config,out):
    start = time.monotonic()
    result = simulate_observer(config)
    result["label"] = label
    result["wall_seconds"] = time.monotonic()-start
    with (out/"completed_cases.jsonl").open("a") as stream:
        stream.write(json.dumps(compact_case(result),default=json_default,allow_nan=False)+"\n")
    print(f"{label}: final L2 error={result['final_error_L2']:.7g}, "
          f"budget residual={result['max_recorded_budget_error']:.2g}, "
          f"{result['wall_seconds']:.1f}s",flush=True)
    return result


def figure(out,cases,checks,upstream):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    plt.rcParams.update({"font.size":10,"axes.spines.top":False,
                         "axes.spines.right":False,"svg.fonttype":"none"})
    fig,axes = plt.subplots(2,2,figsize=(11,7.5),layout="constrained")
    for case in cases:
        rows = case["rows"]
        label = case["label"].replace("_"," ")
        axes[0,0].semilogy([r["time"] for r in rows],[r["error_L2"] for r in rows],label=label)
        axes[0,1].semilogy([r["time"] for r in rows],[r["error_H1_seminorm"] for r in rows])
    axes[0,0].set(title="A  Tracking error: original reference is untouched",
                  xlabel="Nondimensional time",ylabel="Velocity error L2 norm")
    axes[0,0].legend(fontsize=8,frameon=False)
    axes[0,1].set(title="B  Derivative error is measured separately",
                  xlabel="Nondimensional time",ylabel="Error H1 seminorm")
    shears = upstream["hidden_shears"]
    ns = [r["mode"] for r in shears]
    axes[1,0].semilogy(ns,[r["velocity_L2_squared"] for r in shears],"o-",label="Same energy = 1")
    axes[1,0].semilogy(ns,[r["gradient_L2_squared"] for r in shears],"o-",label="Initial gradient squared")
    axes[1,0].set(title="C  Identical low-mode observations can hide gradients",
                  xlabel="Hidden shear frequency",ylabel="Normalized squared norm",xticks=ns)
    axes[1,0].text(.04,.92,"P8 u = 0 for all three exact smooth shears",
                   transform=axes[1,0].transAxes,fontsize=9)
    axes[1,0].legend(frameon=False,fontsize=9)
    values = [r["stretching"] for r in checks["rows"]]
    axes[1,1].bar(range(1,len(values)+1),values,color=["#315f91" if x>0 else "#b96c45" for x in values])
    axes[1,1].axhline(0,color="black",lw=.7)
    axes[1,1].set(title="D  3-D stretching: instantaneous identity checks",
                  xlabel="Independent resolved 3-D field",ylabel="Signed vortex stretching")
    fig.suptitle("Observation and return — paired Navier–Stokes calibration",fontsize=15)
    fig.supxlabel("Time evolution is 2-D. Panel D checks 3-D algebra only. No arbitrary-data regularity proof is claimed.",fontsize=10)
    fig.savefig(out/"observer.png",dpi=170)
    fig.savefig(out/"observer.svg")
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out",type=Path,default=HERE/"runs"/f"observer-{time.time_ns()}")
    parser.add_argument("--grid",type=int,default=48)
    parser.add_argument("--dt",type=float,default=.01)
    parser.add_argument("--duration",type=float,default=8)
    parser.add_argument("--no-refinement",action="store_true")
    args = parser.parse_args()
    base = ObserverConfig(n=args.grid,dt=args.dt,duration=args.duration)
    out = args.out.resolve()
    reserve_output(out)
    os.environ.setdefault("MPLCONFIGDIR",str(out/".matplotlib"))
    files = [HERE/name for name in ("observer.py","solver.py","grounding_checks.py","run_observer.py",
                                    "upstream/grounding/verify_grounding_ns.py")]
    hashes = {str(p.relative_to(HERE)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
    manifest = dict(source_sha256=hashes,base_config=asdict(base),python=platform.python_version(),
                    numpy=np.__version__,reference="original unforced 2-D Navier-Stokes; zero spatial mean",
                    observer="same PDE plus -gain*P_K(V-U)+gain*eta; zero spatial mean")
    (out/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
    original = upstream_reproduction()
    identities = run_identity_checks()
    # Preselected settings. No case is dropped based on its result.
    settings = [("no_observer_correction",0,1,0),
                ("K1_gain1",1,1,0),("K2_gain1",1,2,0),
                ("K4_gain04",.4,4,0),("K4_gain1",1,4,0),
                ("K4_gain1_noise002",1,4,.02)]
    cases = [execute(label,replace(base,gain=gain,cutoff=cutoff,noise=noise),out)
             for label,gain,cutoff,noise in settings]
    untouched = max(float(np.max(np.abs(c["final_reference_vorticity"]
                                         -cases[0]["final_reference_vorticity"]))) for c in cases)
    refinements,comparisons = [],[]
    if not args.no_refinement:
        for label in ("K4_gain1","K4_gain1_noise002"):
            standard = next(c for c in cases if c["label"]==label)
            config = ObserverConfig(**standard["config"])
            spatial = execute(label+"_space",replace(config,n=config.n+16),out)
            fine = execute(label+"_space_time",replace(config,n=config.n+16,dt=config.dt/2),out)
            for key in ("final_error_L2","final_error_H1_seminorm","final_reference_energy"):
                comparisons.append(dict(case=label,metric=key,
                    **relative_refinement_changes(standard[key],spatial[key],fine[key])))
            refinements.extend((spatial,fine))
    all_cases = cases+refinements
    refinement_error = max((r[k] for r in comparisons for k in ("spatial","temporal","combined")),default=None)
    max_budget = max(c["max_recorded_budget_error"] for c in all_cases)
    max_identity = max(c["max_instantaneous_error_identity_residual"] for c in all_cases)
    max_envelope = max(c["max_recorded_envelope_excess"] for c in all_cases)
    gates = dict(reference_unchanged=untouched==0,paired_budgets=max_budget<1e-6,
                 paired_error_identity=max_identity<1e-11,numerical_envelope=max_envelope<1e-7,
                 refinement=refinement_error is not None and refinement_error<.01,
                 original_verifier=True,three_dimensional_identities=identities["passed"],
                 source_stable=hashes=={str(p.relative_to(HERE)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files})
    summary = dict(schema=1,all_checks_passed=bool(all(gates.values())),checks=gates,
                   **manifest,reference_change_max=untouched,max_budget_error=max_budget,
                   max_error_identity_residual=max_identity,max_numerical_envelope_excess=max_envelope,
                   max_relative_refinement_change=refinement_error,refinement_comparisons=comparisons,
                   maxima_are_recorded_samples=True,
                   upstream_reproduction=original,three_dimensional_checks=identities,
                   cases=[{k:v for k,v in compact_case(c).items() if k!="rows"} for c in cases],
                   refinements=[{k:v for k,v in compact_case(c).items() if k!="rows"} for c in refinements],
                   interpretation=("Paired mean-zero 2-D time evolution; 3-D instantaneous identities only. "
                                   "The tracking envelope is evaluated numerically along the Galerkin trajectory, "
                                   "not a certified continuum or all-time bound. No observational criterion for "
                                   "arbitrary unforced 3-D solutions has been verified. Noise is bounded in velocity L2."))
    (out/"summary.json").write_text(json.dumps(summary,indent=2,default=json_default,allow_nan=False)+"\n")
    with (out/"trajectories.csv").open("w",newline="") as stream:
        writer = csv.DictWriter(stream,fieldnames=["case"]+list(cases[0]["rows"][0]),lineterminator="\n")
        writer.writeheader()
        for case in cases:
            for row in case["rows"]:
                writer.writerow({"case":case["label"],**row})
    figure(out,cases,identities,original)
    print(json.dumps({"checks":gates,"reference_change_max":untouched,
                      "max_relative_refinement_change":refinement_error},indent=2,default=json_default))
    if not summary["all_checks_passed"]:
        raise SystemExit("Observer calibration incomplete; inspect saved results")


if __name__=="__main__":
    main()
