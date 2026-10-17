# Observation, reference, and return

This implements the supplied *Grounding, feedback, and Navier–Stokes* note.
Its original verifier, requirements, mathematical note and saved results are
preserved byte-for-byte in `upstream/grounding/`. The verifier's SHA-256 is
`03989d8f06eb521c5826f91b0dd1ea59e0cac3c7a057e80f0a327f7c115192c6`.
`grounding_checks.py` checks this digest before reusing its Fourier routines.
The original tests have now been reproduced with the current local runtime.

## Two equations with different roles

On the periodic torus, the reference follows its original unforced equation:

$$
U_t+(U\cdot\nabla)U+\nabla p=\nu\Delta U,\quad\nabla\cdot U=0.
$$

Only the observer is corrected:

$$
V_t+(V\cdot\nabla)V+\nabla q
=\nu\Delta V-\mu P_K(V-U)+\mu\eta,\quad\nabla\cdot V=0.
$$

Here $P_K$ observes Fourier modes with $|k|\le K$. The noise $\eta=P_K\eta$
is an error in the observed **velocity**, with $\|\eta(t)\|_2\le\epsilon$.
All norms use normalized spatial integrals on the $2\pi$-periodic domain.
The shared forcing could be nonzero in the abstract theorem; the implemented
paired time-evolution experiment uses zero forcing.

This differs from damping a forced fluid toward zero. Changing the observer
gain, noise or cutoff cannot alter the reference. A unit test checks exact
equality of its numerical trajectory under those changes. The main experiment
also compares final reference arrays from all six observer cases.

## Conditional tracking identity

On a common smooth existence interval, put $e=V-U$ and
$S(U)=(\nabla U+\nabla U^T)/2$. Subtraction and periodic incompressible
integration by parts give

$$
\frac12\frac d{dt}\|e\|_2^2+\nu\|\nabla e\|_2^2+\mu\|P_Ke\|_2^2
=-\langle e,S(U)e\rangle+\mu\langle e,\eta\rangle.
$$

The sign of the strain term matters: compression can amplify tracking error.
Define $s(t)=\operatorname*{ess\,sup}_x\max(0,-\lambda_{\min}(S(U)))$.
For integer $K\ge1$, the first omitted squared frequency is exactly $K^2+1$.
If means need not agree and $P_K$ includes the constant mode, use

$$
a_K=\min\{\mu,\nu(K^2+1)\}.
$$

For **equal mean** velocities, the sharper constant is

$$
a_K=\min\{\mu+\nu,\nu(K^2+1)\}.
$$

The code represents mean-zero velocities through vorticity and uses the
second constant. All its noise has zero spatial mean. Nonzero mean noise
would destroy equal means, since $\bar e'=-\mu\bar e+\mu\bar\eta$;
it cannot be silently combined with the sharper constant.

The scalar comparison inequality is

$$
R'\le(s(t)-a_K)R+\mu\epsilon,\quad R=\|e\|_2.
$$

Without noise, $R(t)\le R(0)\exp[-a_Kt+\int_0^t s]$. If
$s\le s_*$ and $\delta=a_K-s_*>0$, then

$$
R(t)\le e^{-\delta t}R(0)+\frac{\mu\epsilon}{\delta}(1-e^{-\delta t}).
$$

The correction always removes error energy through $-\mu\|P_Ke\|_2^2$.
Its work on the observer's own kinetic energy can have either sign. The code
therefore records correction work, noise work and strain work separately.
Tracking a reference does not establish the reference's physical accuracy.

## What the numerical envelope means

For the 2-D reference polynomial, write its strain matrix as
$\left[\begin{smallmatrix}a&b\\b&-a\end{smallmatrix}\right]$.
The exact spectral triangle bound

$$
s(t)\le\sqrt{\big(\sum_k|\hat a_k|\big)^2+
                    \big(\sum_k|\hat b_k|\big)^2}
$$

bounds its continuous spatial interpolant. `observer.py` computes this bound
using normalized Fourier coefficients. It integrates the scalar comparison
equation with the same RK4 stages as the paired Galerkin flows. This is a
**numerically evaluated envelope along a discrete trajectory**. Neither
time quadrature nor continuum discretization error is interval-certified.
The sampled decay margin in output is descriptive, not an all-time theorem.

Velocity and derivative errors are separate outputs. In 2-D the squared
gradient-error norm equals the squared vorticity-error norm. Noise amplitude
is measured in velocity L2, reconstructed from vorticity with the inverse
Laplacian weight, rather than confusing the two norms.

## The reference assumption already contains a regularity criterion

In 3-D incompressibility implies $\operatorname{tr}S(U)=0$. If its ordered
eigenvalues are $\lambda_1\le\lambda_2\le\lambda_3$, then
$\lambda_3=-\lambda_1-\lambda_2\le-2\lambda_1$, so
$\lambda_{\max}(S(U))\le2s(t)$. The reference enstrophy therefore satisfies

$$
Y'+2\nu\|\nabla\omega_U\|_2^2\le4s(t)Y,\quad
Y(t)\le Y(0)\exp\left(4\int_0^t s\right).
$$

Integrability of $s$ **up to a proposed finite singular time** already
provides the H1 continuation bound for the reference, without an observer.
Integrability on each already-known smooth subinterval would be automatic
and insufficient. A tracking theorem assuming this bound does not derive
the missing bound from the original dynamics.

## Exact obstruction and connection to published criteria

The unforced shear
$u_n=\sqrt2e^{-\nu n^2t}\sin(nx_2)(1,0,0)$ is globally smooth.
At time zero it has velocity L2 squared equal to 1 and gradient L2 squared
equal to $n^2$. Every fixed $P_Ku_n$ is zero when $n>K$. Thus fixed coarse
observations plus energy do not give a universal initial-gradient bound.
This counterexample does not refute positive-time smoothing or criteria that
also depend on the initial gradient.

[Azouani, Olson and Titi](https://arxiv.org/html/1304.0997v1) established
conditional synchronization from partial observations in 2-D.
[Balakrishna and Biswas, Theorem 1.1 (2025)](https://link.springer.com/article/10.1007/s40687-025-00530-w)
give a regularity criterion for original 3-D solutions from finite spatial
observations over a time interval. In the unforced modal setting, its scaling
requires $M_K^2\lesssim\nu^2K$ and $K\gtrsim\|\nabla u_0\|_2^2/\nu^2$,
with domain factors and unspecified universal constants understood.
The energy estimate only supplies $M_K^2\le K^2E_0$. Combining these
sufficient bounds recovers a small-data compatibility requirement
$E_0\|\nabla u_0\|_2^2\lesssim\nu^4$, not arbitrary-data control.
No numerical certificate for the paper's universal constants is claimed.

## Scope of the implementation

`observer.py` evolves general paired **2-D** Galerkin flows with known global
regularity. Vortex stretching is identically zero there. Exact parallel
shears test observed and hidden tracking errors; a driven shear tests noise.

`grounding_checks.py` reuses the original verifier and additionally checks
the 3-D error identity, pressure orthogonality, transport cancellation,
Parseval normalization, strain eigenvalues, and the vorticity identity on
five random resolved fields with nonzero stretching. These are instantaneous
evaluations of the original PDE's projected RHS, not a generic 3-D time
simulation. Tests and floating-point residuals do not prove regularity.

The next mathematical target remains a bound on observations or vortex
stretching derived from the original 3-D dynamics and admissible initial
data, without an added stabilizing force or a presupposed regular reference.
The human motivation supplies a modeling question; no map from sacred meaning
to these observables or controller laws has been established.
