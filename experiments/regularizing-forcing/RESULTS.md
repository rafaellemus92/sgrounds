# First results: regularizing forcing

The first experiment is implemented and tested on the Claude proof branch of
`rafaellemus92/sgrounds`. It connects the existing verified pangram generator
to a reproducible fluid experiment. GitHub access was already connected; no
new account, token, or uploaded recording was required.

## What was measured

The equation is dimensionless, two-dimensional incompressible Navier--Stokes
on a periodic square. Two smooth input channels force spatial modes with
different lengths. The full nonlinear interaction is active. The input comes
from an explicit arbitrary mapping of the repository's verified prime pangram.
There are no recordings or sacred texts in this first experiment.

Eight comparison inputs preserve the channel spectra, RMS and cross spectra
while changing the phase relationships between frequencies. Every input is
run both without feedback and with instantaneous dissipative feedback on low
spatial modes. The primary statistic is time-mean palinstrophy,
J = time-mean spatial-mean |gradient of vorticity| squared, with no factor of 1/2.
Lower J means less of this chosen measure of small-scale activity. It does not
by itself mean greater mathematical smoothness or establish avoidance of a
singularity.

| Condition | Original J | Surrogate range | Surrogates below original |
|---|---:|---:|---:|
| Open loop | 0.593272623 | 0.483506986–0.619333616 | 7 of 8 |
| Low-mode feedback | 0.335230814 | 0.311656078–0.328336380 | 8 of 8 |

Feedback reduced J for the original input by 43.4946%. The original sequence
did not outperform the phase surrogates. These observations support testing
structured forcing and explicit feedback further. They provide no evidence
that this pangram, its primes, or its word order has a privileged physical role.
Ranks are descriptive and based on one synthetic input, not a statistical test
of speech or religious traditions. Different waveforms can inject different
actual fluid work despite identical forcing spectra; that work is recorded.

## Verification

All 19 tests passed, covering a closed-form time-dependent shear solution,
incompressibility, nonlinear energy/enstrophy cancellation, timestep
convergence, the actual repository witness, WAV decoding, spectral matching,
and preservation of prior output directories.

All eight reference-run gates passed. The largest spectral mismatch was
1.67e-16; recorded energy and enstrophy budget errors were at most 1.23e-7 and
1.87e-7. For both the original and first surrogate under both controllers,
increasing the grid from 48 to 64 and halving the timestep from 0.01 to 0.005
changed J by at most 4.36e-8 relative. Spatial-only and same-grid temporal-only
differences are checked separately. The short CI experiment also passed locally.
These are numerical consistency checks, not rigorous continuum error bounds.

`results/reference/summary.json` contains settings, source hashes and results.
The input, compressed trajectories and full completed-case checkpoints are
preserved alongside it. Runs refuse to overwrite existing artifacts and detect
source edits during computation. The numerical fluid results have not been
checked by Lean; the existing Lean results concern the arithmetic witness.

## What can actually be proved next

[THEORY.md](THEORY.md) gives the standard analytic 2-D norm bound and derives
a restricted 3-D sufficient condition. For the 3-D equation with full
instantaneous drag -kappa*u, let Y = ||gradient u||_2 squared. Standard estimates
give Y' <= A*Y^3 - 2*kappa*Y + B. If an upper barrier R contains the initial Y
and A*R^3 - 2*kappa*R + B < 0, Y remains bounded and the controlled solution
continues smoothly. The note supplies the derivation and assumptions.

The note bounds the relevant Fourier inequality by an explicit conservative
constant 13, giving A = 771147/(16*nu^3) and B = 2*F^2/nu when the external
forcing has L2 norm at most F. One sufficient gain is therefore

`kappa > 771147*R^2/(32*nu^3) + F^2/(nu*R)`.

For example, nu=1, F<=1, Y(0)<=1, R=1 and kappa=24100 satisfy the strict
barrier condition. This large dimensionless gain illustrates a conservative
mathematical guarantee, not a proposed physical or biological setting.

This is a standard sufficient-condition argument for a modified equation.
The explicit constant is derived here by an elementary Fourier-shell estimate
and independently checked. No 3-D solver or Lean formalization of the argument
has been completed. It does not settle arbitrary-data regularity without the
controller. In 3-D, the obstacle is vortex stretching, which disappears from
this 2-D calculation.

The next mathematical step is to formalize the Fourier estimate and barrier
lemma, then investigate whether a useful theorem can hold for finite-mode or
phase-dependent feedback. The next empirical step is
to run several independent local recordings with a fixed processing rule and
held-out comparisons. The implemented `--wav` option supports the latter.

Fourier representation lets us inspect an entire cycle in phase and frequency
coordinates. The equations retain time evolution; the change of coordinates
does not remove causality or the burden of proof.

Reproduction commands and primary references are in [README.md](README.md)
and [THEORY.md](THEORY.md).
