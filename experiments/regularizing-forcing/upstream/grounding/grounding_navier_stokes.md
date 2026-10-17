# Grounding, feedback, and Navier–Stokes

**Result:** a precise mathematical connection exists through observation and
feedback. Below is a self-contained conditional stability proof, an exact
counterexample to an overly strong interpretation, and the remaining estimate
that would matter for three-dimensional regularity. This is a derivation of
known mechanisms, not a new global-regularity proof.

## 1. Translate the intuition into an explicit model

The motivating question is: can a system remain receptive to information,
correct its deviations, and retain a stable orientation?

For someone whose orientation is grounded in a sacred text, that text can
motivate the question. The following mathematical assignments are choices of
model. They neither represent the text's meaning nor establish a physiological
effect of reading or recitation.

| Human motivating idea | Mathematical assignment | What would need separate evidence |
|---|---|---|
| A reference to return to | A reference trajectory U(t,x) | How a particular teaching or practice sets a human reference |
| Listening | Observations P_K U of some spatial scales | What a person actually measures or responds to |
| Recognizing a mismatch | P_K(V-U) | Whether this error describes the human process |
| Corrective response | Negative feedback -mu P_K(V-U) | Response strength, sign, delay, and noise |
| Recovery | Decay of the error norm ||V-U||_2 | Whether this norm matches a meaningful human outcome |

This is a feedback model. Literal speech production would instead require
airflow, vocal-fold mechanics and acoustics; a listener adds further physical
and interpretive processes. An equation for incompressible fluid velocity does
not automatically include those variables.

## 2. An established mathematical connection

Azouani, Olson and Titi's continuous data assimilation framework adds feedback
from partial observations to a fluid model. Their original two-dimensional
results prove synchronization when observation resolution and feedback satisfy
appropriate conditions. Our interpretation of that mechanism as “listening and
returning to a reference” is a modeling analogy.

Source: [Continuous Data Assimilation Using General Interpolant Observables](https://arxiv.org/html/1304.0997v1), especially equation (23) and Theorems 1–2.

The following elementary three-dimensional estimate is derived directly here.
It is conditional on a smooth reference and must not be mistaken for the
original paper's stronger two-dimensional conclusions.

## 3. A conditional theorem, with proof

Work on the periodic cube T^3=(R/2pi Z)^3, with normalized volume
dx/(2pi)^3. All norms below use this normalization. Let viscosity nu>0,
gain mu>0, and integer K>=1. P_K is the orthogonal Fourier projection onto
integer frequencies |k|<=K, **including the zero mode**.

Let U and V be smooth, divergence-free velocities on a common interval [0,T].
The reference obeys

\[
\partial_t U+(U\cdot\nabla)U+\nabla p=\nu\Delta U+f.
\]

The observer obeys

\[
\partial_t V+(V\cdot\nabla)V+\nabla q
=\nu\Delta V+f-\mu P_K(V-U).
\]

Only the observed reference P_K U is needed to implement the added feedback.
The same f appears in both equations; f can be zero.

Write e=V-U and S(U)=(grad U+grad U^T)/2. Subtracting the equations gives

\[
\partial_t e+(V\cdot\nabla)e+(e\cdot\nabla)U+\nabla(q-p)
=\nu\Delta e-\mu P_K e.
\]

Take the L2 inner product with e. Incompressibility and periodicity give
integral e dot (V dot grad)e=0 and integral e dot grad(q-p)=0.
The antisymmetric part of grad U contributes zero to e^T grad U e.
Orthogonality gives (e,P_K e)=||P_K e||_2^2. Therefore

\[
\boxed{
\frac12\frac{d}{dt}\|e\|_2^2
+\nu\|\nabla e\|_2^2+\mu\|P_K e\|_2^2
=-\int e^T S(U)e\,d\bar x .}
\tag{1}
\]

Define the possible error-amplification rate

\[
s(t)=\operatorname*{ess\,sup}_x
\max\{0,-\lambda_{\min}(S(U)(x,t))\}.
\]

Then the right side of (1) is at most s(t)||e||_2^2. A larger but simpler
choice is the L-infinity operator norm of S(U).

The first Fourier eigenvalue above K is K^2+1: integer squared frequencies
are integers, and (K,1,0) attains that value. Splitting e into P_K e and its
orthogonal complement gives

\[
\nu\|\nabla e\|_2^2+\mu\|P_K e\|_2^2
\ge a_K\|e\|_2^2,
\qquad a_K=\min\{\mu,\nu(K^2+1)\}.
\]

Applying the elementary differential inequality to (1) proves

\[
\boxed{
\|V(t)-U(t)\|_2\le\|V(0)-U(0)\|_2
\exp\!\left[-a_Kt+\int_0^t s(\tau)\,d\tau\right].}
\tag{2}
\]

In particular, if s(t)<=s_* and both mu>s_* and nu(K^2+1)>s_*, the
error decays at least as exp(-(a_K-s_*)t).

**Interpretation:** observed scales receive explicit correction; viscosity
controls sufficiently fine unobserved scales. Together they can dominate
error amplification. Increasing the feedback strength alone cannot make this
particular estimate work if the spatial observations remain too coarse.
Failure of this sufficient condition means the estimate is inconclusive,
not that the flow is unstable.

The mean matters: if P_K omitted the constant mode and the means differed,
a constant error could persist. With equal means, a sharper bound is
a_K=min{mu+nu,nu(K^2+1)}.

### Imperfect information

If the feedback uses P_K U+eta instead of P_K U, where eta=P_K eta and
||eta||_2<=epsilon, equation (1) gains mu(e,eta) on its right.
If delta=a_K-s_*>0, the resulting norm estimate is

\[
\|e(t)\|_2\le e^{-\delta t}\|e(0)\|_2
+\frac{\mu\epsilon}{\delta}(1-e^{-\delta t}).
\tag{3}
\]

This follows from R'<=-delta R+mu epsilon for R=||e||_2, interpreted by
regularization at R=0. Thus following a reference does not establish the
reference's accuracy. A larger gain can also increase sensitivity to noisy
observations. This is a mathematical observation about the chosen model,
not a conclusion about a religious practice.

## 4. What the theorem does not establish

Equation (2) holds on the common smooth existence interval. Assuming a
reference strain bound for every time already assumes substantial control of
the difficult solution. The estimate cannot manufacture that control.

Furthermore, V has an added feedback term. A theorem for that controlled
equation is not automatically a theorem for the original equation for U.
An L2 tracking bound also does not by itself give a bound on all derivatives
of V. No global smoothness claim for either three-dimensional solution is
being made here.

## 5. An exact test: identical observations can conceal fine structure

For any positive integer n, set

\[
u_n(x,t)=\sqrt2 e^{-\nu n^2t}\sin(nx_2)(1,0,0),\qquad p=0.
\]

This is an exact unforced Navier–Stokes solution: div u_n=0,
(u_n dot grad)u_n=0, and partial_t u_n=nu Delta u_n. Every member of this
family is smooth for all time.

At t=0,

\[
\|u_n\|_2^2=1,\qquad
\|\nabla u_n\|_2^2=\|\operatorname{curl}u_n\|_2^2=n^2.
\]

For fixed K and n>K, P_K u_n=0 at every time. Consequently **there is no
finite universal initial-gradient bound using only initial L2 energy and
those fixed low-mode observations**: their inputs are identical, while the
gradient can be arbitrarily large.

| Observation cutoff | Hidden frequency n | Initial ||u||_2^2 | Initial ||grad u||_2^2 | P_K u |
|---|---:|---:|---:|---|
| K=8 | 16 | 1 | 256 | 0 |
| K=8 | 32 | 1 | 1,024 | 0 |
| K=8 | 64 | 1 | 4,096 | 0 |

This refutes that proposed initial-data bound, not global regularity. It does
not rule out bounds that use the full smooth initial data, finer observations,
or positive-time smoothing. Those same fixed low-mode histories remain zero
and cannot distinguish these initial gradients. Indeed viscosity rapidly
damps these shears, whose vortex stretching is identically zero.

On R^3 there is a complementary scaling calculation. Choose a nonzero smooth
compactly supported divergence-free w, for example a nonzero curl of
(0,0,phi). For w_lambda(x)=lambda w(lambda x),

\[
\|w_\lambda\|_2^2=\lambda^{-1}\|w\|_2^2,
\quad \|\nabla w_\lambda\|_2^2=\lambda\|\nabla w\|_2^2,
\quad \|w_\lambda\|_3=\|w\|_3.
\]

Energy can decrease while initial gradients increase. These are different
initial-data problems, not a single solution developing a singularity. This
R^3 scaling formula must not be substituted for integer dilation on a fixed
periodic domain.

## 6. Where an actual regularity argument must act

For an unforced smooth three-dimensional flow, let omega=curl u. Taking
the curl of the equation, multiplying by omega and integrating gives

\[
\frac12\frac{d}{dt}\|\omega\|_2^2+\nu\|\nabla\omega\|_2^2
=\int\omega^T S(u)\omega\,d\bar x.
\tag{4}
\]

The right side is vortex stretching. Notice its plus sign: this is a
different identity from error production -e^T S(U)e in (1).

A sufficient route to continuation would be to establish

\[
\boxed{
\int\omega^T S(u)\omega
\le\frac\nu2\|\nabla\omega\|_2^2+C(t)\|\omega\|_2^2,
\qquad C(t)\ge0,\quad\int_0^T C(t)\,dt<\infty .}
\tag{5}
\]

Then Y=||omega||_2^2 satisfies Y'<=2C(t)Y, so
Y(t)<=Y(0) exp(2 integral_0^t C). Along with the velocity energy bound,
this controls H1 and allows the standard local strong-solution continuation
argument. To resolve unforced global regularity, the bound on C must follow
from the original dynamics and admissible initial data on every finite
interval, without presupposing the desired regularity.

In particular, replacing C(t) with an uncontrolled derivative norm merely
renames the missing estimate. A finite simulation cannot certify (5) for
arbitrary smooth initial data and all future times.

## 7. A published connection closer to the target

Balakrishna and Biswas (2025, Theorem 1.1) give a conditional periodic 3D
regularity criterion from finitely many spatial observations collected almost
everywhere in time. [Published paper](https://link.springer.com/article/10.1007/s40687-025-00530-w).

For the unforced, mean-zero modal setting, write

\[
M_K^2=\operatorname*{ess\,sup}_{0\le t\le T}
\|\nabla P_Ku(t)\|_2^2,
\qquad E_0=\|u(0)\|_2^2.
\]

With fixed domain factors absorbed into constants and h proportional to
1/K, its observation term requires M_K^2 at most a sufficiently small
constant times nu^2 K, at a cutoff also sufficiently large relative to the
initial gradient. Energy alone gives

\[
M_K^2\le K^2 E_0.
\]

The available bound grows quadratically in K; the threshold grows linearly.
Increasing K therefore does not make this energy-based verification
automatic. Actual observed quantities need not grow quadratically. The
remaining task is to obtain the stronger control from the original PDE.
Our elementary estimate (2) does not prove their theorem. No numerical
certificate using their universal constants is claimed.

Tao's averaged Navier–Stokes construction provides another useful check:
an altered nonlinearity can retain the ordinary energy identity and still
blow up. Thus the energy identity alone cannot distinguish the actual
equation from that modified model; finer nonlinear structure is essential.

Source: [Finite time blowup for an averaged three-dimensional Navier–Stokes equation](https://arxiv.org/html/1402.0290v3).

## 8. What has been accomplished, and the next concrete claim

We have made the proposed connection explicit as observation, reference and
feedback; proved a conditional tracking estimate; and identified an exact
obstruction to obtaining fine-scale control from energy and fixed
observations alone.

The next claim worth testing is:

> Can the required observation or vortex-stretching bound be obtained from
> the original unforced three-dimensional equations and their initial data,
> without adding a stabilizing force or assuming smoothness for all time?

That is a mathematical research target. An assertion about sacred language
would need an additional, independently supported map from a particular
practice to physical observables and a response law. No such map is assumed
or established by the derivations above.

The energy-only attempt can be taken one step further. Put
Z_0=||grad u(0)||_2^2. Combining the preceding energy envelope with the
criterion's requirements would ask for

\[
K\le c\frac{\nu^2}{E_0},\qquad
K\ge C\frac{Z_0}{\nu^2}.
\]

For nonzero data these can be compatible only in a small-data regime,
E_0 Z_0<=c' nu^4, also subject to the domain's baseline cutoff requirement.
Thus this attempt recovers a smallness condition; it does not close the
arbitrary-data argument. Failure of this sufficient verification does not
imply failure of the published criterion or formation of a singularity.

## 9. Reproduce the checks

Run `python3 -m pip install -r grounding_ns_requirements.txt`, followed by
`python3 verify_grounding_ns.py`, in this folder. Python 3.12 was used locally;
the requirements record the NumPy and Matplotlib versions used for this run.
The script writes `grounding_ns_results.json` and `grounding_ns.png` beside
itself. It checks:

1. The nonlinear error identity (1), incompressible transport cancellation,
   and vorticity identity (4) on five resolved random divergence-free
   trigonometric fields, including nonzero stretching. The instantaneous
   velocities are evaluated with the original PDE's Leray-projected RHS;
   these are algebraic checks, not a time simulation of generic 3D flow.
2. The invisible shear family by Fourier differentiation on a 1,024-point
   grid, with modes well below its Nyquist limit.
3. RK4 integration against exact shear error decay, and inequality (2),
   for nu=0.05, mu=1, K=4 and reference U=e^(-nu t) sin(x_2)e_1.
   Each plotted mode is a separate unit-norm initial-error experiment.

The independent proofs above establish the symbolic statements. Numerical
residuals are consistency checks; neither the examples nor the code claim
to establish global regularity. The plot's red region means “this
sufficient estimate is inconclusive,” never “singular flow.”

In the local run, the maximum error-identity residual was 3.13e-17 and the
maximum vorticity-identity residual was 1.81e-16. RK4's maximum absolute
deviation from the exact shear decay was 8.32e-11. The three invisible-shear
examples all had energy 1 to floating-point precision and observed norms
below 3.42e-16. Exact decimals can vary across numerical libraries.

The original target should be fixed against [Fefferman's official problem statement](https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf): the unforced existence alternatives and the forced breakdown alternatives have different quantifiers and assumptions.
