# Regularizing forcing

A first reproducible experiment from the speech, breath, and listening idea.
It asks whether temporal organization affects the small-scale activity of a
fluid, and whether explicitly dissipative feedback controls that response.

The working equation is **2-D periodic incompressible Navier--Stokes** with
smooth forcing and feedback on low Fourier modes. Smoothness in this dimension
is already known. The result is a calibration and a way to generate and reject
specific conjectures. Turbulence and mathematical singularity are different
properties; a turbulent velocity field can remain smooth.

## What is reused from Claude

The source branch is `claude/new-session-sbrl43`, base commit
`7df7f7d2282b4ff1763c4829873fb382534d15ce` in
[rafaellemus92/sgrounds](https://github.com/rafaellemus92/sgrounds).
`signals.py` imports the actual
[`coupled_prime26_pangram.py`](../coupled_prime26_pangram.py), reruns its finder
and verifier, and records the ten primes and their 26-letter witness. The
existing Lean proofs in `../wyrd` and `../wyrd-mathlib` remain the proof record
for the original arithmetic results. None of the fluid claims have been
kernel-checked in Lean.

The mapping of letters to a two-channel waveform is an explicit arbitrary
choice: A through Z become points on a circle, interpolated in witness order
and projected onto a finite temporal Fourier series. It is a reproducible test
input, not pronunciation, a speech synthesizer, or evidence of a physical
property of primes. The oscillator model `kinship.py` mentioned in the Claude
session was in temporary storage and is absent from this source branch.

## Reproduce

From the repository root:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r experiments/regularizing-forcing/requirements.txt
.venv/bin/python -m unittest discover -s experiments/regularizing-forcing -v
.venv/bin/python experiments/regularizing-forcing/run_experiment.py
```

The default creates a fresh directory under ignored `runs/`. A nonempty
output directory is never overwritten; each run preserves a source manifest
and checkpoints every completed computation. Reproduce the committed reference
experiment in a new directory with:

```sh
.venv/bin/python experiments/regularizing-forcing/run_experiment.py --out experiments/regularizing-forcing/runs/reproduction
```

The first run uses an 8-unit forcing period, a 16-unit observation window,
viscosity 0.06, forcing amplitude 0.8, a 48 by 48 grid, and timestep 0.01.
The controller has strength 0.8 on spatial wavevectors with length at most 2.
The initial vorticity and forcing fields are fixed in `solver.py`. These are
nondimensional numerical settings; no breathing or acoustic timescale is inferred.

## First result

The full reference run passed every calibration gate and all 19 unit tests.
For the original synthetic input, feedback changed J from 0.593272623 to
0.335230814, a reduction of 43.4946%. Without feedback, seven of eight phase
surrogates had lower J than the original. With feedback, all eight had lower J.
This particular witness has no demonstrated advantage under this mapping.
The result concerns one finite-window, dimensionless, two-dimensional experiment.

The largest channel-spectrum/cross-spectrum mismatch was 1.67e-16. The
largest recorded energy and enstrophy budget errors were 1.23e-7 and 1.87e-7.
The largest spatial, temporal, or combined refinement change in J was
4.36e-8 relative, about 0.00000436%. The shorter experiment used by CI also
passed locally. [RESULTS.md](RESULTS.md) interprets these results and identifies
the next theorem-sized step.

## Hypothesis and controls

The primary statistic chosen in the implementation is
`J = (1/T) integral mean(|grad vorticity|^2) dt`, the time-mean palinstrophy
using the convention without a factor of one half. The full window includes
the initial transient. Eight surrogates use seeds 20261016 through 20261023.
All original/surrogate and open-loop/feedback combinations are retained.

Each surrogate multiplies both temporal channels by the **same** random phase
at each frequency. It preserves each channel's Fourier magnitudes, RMS,
periodic autocorrelation, and cross-channel spectrum. It changes relationships
between frequencies. It generally changes peaks, envelopes, and nonstationarity.
No peak normalization is applied afterward.

Equal forcing spectra do not mean equal injected fluid work. The code therefore
reports actual input work and controller extraction as separate measurements.
The empirical surrogate rank is descriptive: eight surrogates and one arbitrary
synthetic input do not support a general statistical or semantic conclusion.
The input's words, religious status, and meaning are absent from the PDE. Two
identical numeric inputs produce identical trajectories regardless of labels.

## Numerical checks

- A time-dependent forced shear is compared with its closed-form solution.
- Random resolved fields verify cancellation of nonlinear energy and enstrophy
  production, as well as incompressibility.
- The strict componentwise 2/3 Fourier truncation removes quadratic aliases.
- Classical RK4 evolves the flow and integrated budgets with the same stages.
- Advection guards run at every RK4 stage using the actual adjusted step.
- Both integrated energy and enstrophy budgets are reported; sampled residuals
  must stay below 1e-5 in the full reference experiment.
- The analytic vorticity norm envelope must hold at recorded times.
- The spatial grid is increased to 64 with the original timestep, then the
  timestep is halved, for the original and first surrogate under both controls.
  Spatial-only, same-grid temporal-only, and combined changes in J must all
  stay below 1%, so opposite errors cannot cancel the refinement check.
- A high-wavenumber tail diagnostic must stay below 1%, and the nonlinear term
  must be active so this cannot pass as an accidentally linear shear example.

These checks are numerical consistency tests. They provide neither interval
enclosures of continuum error nor a proof for all future times. Reported maxima
are over recorded samples, not continuous-time extrema. The bounds and precise
3-D obstruction are derived in [THEORY.md](THEORY.md).

`--no-refinement` is available for smoke tests; it deliberately fails the
completed-calibration gate, saves the partial results, and exits nonzero.

## Use a local recording

```sh
.venv/bin/python experiments/regularizing-forcing/run_experiment.py --wav /absolute/path/recording.wav
```

Supported inputs are uncompressed 8-, 16-, or 32-bit integer PCM WAV. The clip
is read locally. Its RMS envelope and signed mean become two normalized,
smoothed numerical features, and the whole clip becomes one simulation period.
That feature choice does not model a vocal tract. Silence or constant retained
features are rejected. Local output stays under ignored `runs/` by default;
the reference results contain only the public synthetic input.

Before drawing conclusions from recordings, specify input processing and
comparison statistics, collect several independent clips, and test held-out
material. A phase effect can be specific to one chosen mapping or parameter
range. The same experiment should be repeated across those choices.

## Files and status

| File | Purpose |
|---|---|
| `solver.py` | Fourier flow solver, diagnostics, budget quadratures |
| `signals.py` | Existing witness integration, finite Fourier inputs, local WAV features |
| `test_solver.py`, `test_signals.py`, `test_export.py` | Exact solutions, invariants, and output preservation |
| `run_experiment.py` | Fixed experiment, surrogates, refinement, plots and machine-readable output |
| `THEORY.md` | Analytic theorem, proof, limitations and next 3-D target |
| `results/reference/summary.json` | Settings, source hashes, metrics and check outcomes |
| `results/reference/trajectories.csv.gz` | Compressed recorded time series for every comparison |
| `results/reference/completed_cases.jsonl.gz` | Compressed full completed-case checkpoints, including refinement histories |
| `results/reference/input.csv` | Actual two-channel synthetic input |
| `results/reference/experiment.png`, `.svg` | Scientific figure |

New runs write plain CSV/JSONL. The reference files are also preserved with
gzip compression to keep repository size modest; no rows are discarded.

Time-domain and Fourier-domain descriptions are both available. Fourier
coefficients summarize an entire cycle; they do not remove time from the
equations. No simulation here resolves arbitrary-data 3-D regularity.

## References

- [Cyranka, Mucha, Titi and Zgliczyński, fast oscillating forces](https://arxiv.org/abs/1601.04612):
  temporal forcing can stabilize dynamics under stated assumptions. This is
  precedent for a constrained question, not proof of the proposed speech analogy.
- [Schreiber and Schmitz, Surrogate time series](https://arxiv.org/abs/chao-dyn/9909037):
  surrogate construction and interpretation pitfalls.
- [Fefferman's official Clay problem statement](https://www.claymath.org/library/monographs/MPPc.pdf):
  the target statements and the distinction between the different forcing cases.
