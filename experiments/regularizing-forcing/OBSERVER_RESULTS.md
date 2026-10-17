# Observation and return: completed calibration

The paired experiment is implemented. The original unforced reference U
evolves independently; only the observer V receives correction toward the
observed modes of U. The implementation reuses the supplied grounding verifier
and preserves its original mathematical note, code, requirements and results.
No additional files or recordings were needed from the user.

## Main result

The initial velocity error is 0.5. With fixed viscosity 0.06 and the same
initial states, the preselected observation settings give the following errors
at time 8 in the dimensionless 2-D model:

| Observer setting | Final velocity L2 error | Final derivative-error seminorm |
|---|---:|---:|
| No correction | 0.2941800 | 0.3002067 |
| Cutoff 1, gain 1 | 0.0738816 | 0.1051480 |
| Cutoff 2, gain 1 | 0.00247141 | 0.00591631 |
| Cutoff 4, gain 0.4 | 0.0119619 | 0.0124019 |
| Cutoff 4, gain 1 | 0.0000986501 | 0.000105266 |
| Cutoff 4, gain 1, noise bound 0.02 | 0.00590306 | 0.00590326 |

The reference arrays were identical across all six runs, to the bit: maximum
difference 0. The improvement is in state reconstruction, not a modification
of the reference fluid. The noise case illustrates persistent tracking error
under imperfect information. These are finite-window results for one fixed
set of dimensionless initial data; the full trajectories are preserved.

The tests deliberately measure velocity error, derivative error, and observed
versus hidden error separately. The supplied exact shears all have identical
energy and zero low-mode observations, while their initial gradient norms
grow with frequency. Thus tracking error alone must not be used as a
regularity certificate.

## Checks and provenance

All 28 unit tests passed. The main paired comparison plus four grid/time
refinement runs passed every numerical gate. The maximum paired instantaneous
error-identity residual was 1.39e-16; maximum recorded integrated budget error
was 2.51e-10. The largest relative spatial, temporal or combined refinement
change among final velocity error, derivative error and reference energy was
8.60e-10. These checks are not rigorous enclosures of continuum error.

The original verifier reproduced its saved values, including maximum error
and vorticity identity residuals 3.13e-17 and 1.81e-16, and exact-shear RK4
error 8.32e-11. Five additional resolved 3-D fields check the original PDE's
error, pressure, transport and vortex-stretching identities, including
nonzero stretching of both signs. Their largest combined residual, including
an independent Parseval comparison, was 1.78e-15.

Original files and SHA-256 digests are in `upstream/grounding/`. Fresh results,
source hashes, trajectories and completed-case checkpoints are in
`results/observer-reference/`. Checkpoints and trajectories are also preserved
with gzip compression. The original input files were not overwritten.

## Mathematical meaning

[OBSERVABILITY.md](OBSERVABILITY.md) derives the conditional tracking estimate,
including the mean and observation-noise assumptions. The sampled numerical
envelope uses a continuous-space spectral strain bound for the reference
interpolant and numerical time integration. It does not certify a strain bound
for an arbitrary 3-D continuum flow or for all future times.

The experiment now asks the right reconstruction question: what do finite
observations reveal, and what can remain hidden? General time evolution is
still **2-D**, where vortex stretching vanishes. The **3-D** work consists of
instantaneous identity checks and exact shear examples. There is no generic
3-D solver, new global regularity proof, or Lean formalization of the fluid
argument here.

For the original unforced 3-D problem, the outstanding step is to derive
sufficient observation or stretching bounds from the dynamics and initial
data. Assuming an integrable reference strain already supplies a continuation
criterion and cannot close that step by itself. Human grounding motivates
the model; no physical effect of sacred meaning is inferred.

## Reproduce

From the repository root:

```sh
.venv/bin/python -m unittest discover -s experiments/regularizing-forcing -v
.venv/bin/python experiments/regularizing-forcing/run_observer.py
```

The runner creates a fresh directory under ignored `runs/` and refuses to
overwrite existing results. `--grid`, `--dt` and `--duration` select a new
resolution and window. The source hashes are captured before computation and
checked afterward. Numerical diagrams are in `results/observer-reference/observer.png`
and `.svg`; source and data are included in the downloadable research bundle.
