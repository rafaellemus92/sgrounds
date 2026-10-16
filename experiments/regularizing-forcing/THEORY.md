# Analytic calibration for structured forcing and feedback

This experiment studies a known globally regular, two-dimensional equation.
The estimates below are standard analytic calibration results, specialized to
the implemented forcing and controller. They are not a new Navier--Stokes
regularity theorem, a proof of the three-dimensional Millennium problem, or a
Lean kernel-checked proof. Numerical tests check the implementation; they do
not turn its finite-resolution output into a proof about the continuum PDE.

## Model and conventions

On the periodic square $\mathbb T^2=(\mathbb R/2\pi\mathbb Z)^2$, consider

$$
\partial_t u+(u\cdot\nabla)u+\nabla p
 =\nu\Delta u+f-\kappa P_Ku,\qquad \nabla\cdot u=0.
$$

Here $\nu>0$, $\kappa\ge0$, and $P_K$ is the orthogonal Fourier projection
onto wavevectors $k\in\mathbb Z^2$ with $0<|k|\le K$, where $K\ge1$.
The initial velocity and forcing have zero spatial mean and are divergence
free. Thus the velocity remains mean zero. Take initial data and forcing
smooth, with all norms needed below finite on each bounded time interval.
No zero *temporal* mean assumption is required for the theorem.

All spatial integrals are normalized:

$$
\langle a,b\rangle=(2\pi)^{-2}\int_{[0,2\pi)^2}a\cdot b\,dx\,dy,
\qquad \|a\|_2^2=\langle a,a\rangle.
$$

Define scalar vorticity $\omega=\partial_xu_y-\partial_yu_x$, energy
$E=\|u\|_2^2/2$, and enstrophy $Z=\|\omega\|_2^2/2$.
This implementation reports palinstrophy as
$\|\nabla\omega\|_2^2$, **without** a factor of $1/2$.
For a mean-zero, divergence-free periodic velocity,
$\|\nabla u\|_2^2=\|\omega\|_2^2$.

## The calibration theorem

Let

$$
\lambda_{\mathrm{next}}(K)
 =\min\{|k|^2:k\in\mathbb Z^2,\ |k|>K\},\qquad
\alpha=\min\{\nu+\kappa,\ \nu\lambda_{\mathrm{next}}(K)\}.
$$

There is a unique global smooth velocity for these smooth two-dimensional
data; pressure is determined up to an additive function of time. For every
$t\ge0$ the velocity satisfies

$$
\|u(t)\|_2\le e^{-\alpha t}\|u(0)\|_2
 +\int_0^t e^{-\alpha(t-s)}\|f(s)\|_2\,ds,
$$

$$
\|\omega(t)\|_2\le e^{-\alpha t}\|\omega(0)\|_2
 +\int_0^t e^{-\alpha(t-s)}
             \|\operatorname{curl}f(s)\|_2\,ds.
$$

In particular, if $\|\operatorname{curl}f(t)\|_2\le G$ uniformly, then

$$
\|\omega(t)\|_2\le e^{-\alpha t}\|\omega(0)\|_2
                 +\frac{G}{\alpha}(1-e^{-\alpha t}).
$$

For full-state feedback $P_K=I$ on mean-zero fields, use
$\alpha=\nu+\kappa$. Without feedback, $\alpha=\nu$.
Finite-mode feedback cannot increase this coercivity estimate past
$\nu\lambda_{\mathrm{next}}(K)$: the first uncontrolled mode has only
viscous damping. For example, $K=2$ gives
$\lambda_{\mathrm{next}}=5$.

### Proof and exact budgets

Taking the velocity inner product with $u$, incompressibility and periodicity
give $\langle(u\cdot\nabla)u,u\rangle=0$ and
$\langle\nabla p,u\rangle=0$. Consequently

$$
E'(t)+\nu\|\omega\|_2^2+\kappa\|P_Ku\|_2^2
 =\langle f,u\rangle. \tag{1}
$$

Curl commutes with $P_K$. The two-dimensional vorticity equation is

$$
\partial_t\omega+u\cdot\nabla\omega
 =\nu\Delta\omega+\operatorname{curl}f-\kappa P_K\omega.
$$

Its advective term has zero inner product with $\omega$, so

$$
Z'(t)+\nu\|\nabla\omega\|_2^2+\kappa\|P_K\omega\|_2^2
 =\langle\operatorname{curl}f,\omega\rangle. \tag{2}
$$

For either mean-zero field $v=u$ or $v=\omega$, split its Fourier series into
controlled and uncontrolled modes. Controlled modes have $|k|^2\ge1$;
uncontrolled modes have $|k|^2\ge\lambda_{\mathrm{next}}$. Parseval gives

$$
\nu\|\nabla v\|_2^2+\kappa\|P_Kv\|_2^2
 \ge(\nu+\kappa)\|P_Kv\|_2^2
   +\nu\lambda_{\mathrm{next}}\|(I-P_K)v\|_2^2
 \ge\alpha\|v\|_2^2.
$$

Equations (1)--(2) and Cauchy--Schwarz imply
$y'+\alpha y\le F(t)$ for $y=\|u\|_2$, $F=\|f\|_2$, or
$y=\|\omega\|_2$, $F=\|\operatorname{curl}f\|_2$.
At zeros of $y$ the same conclusion follows by regularizing the norm, or
using its upper right derivative. The integrating-factor inequality proves
the stated bounds. These estimates are compatible with the standard
two-dimensional global existence and regularity theory; the smoothness
assertion also uses that established theory and its continuation estimates.

Integrated versions of (1)--(2) are the numerical budget checks. In particular,
the externally supplied kinetic-energy work is
$\int_0^T\langle f,u\rangle\,dt$; feedback extracts
$\kappa\int_0^T\|P_Ku\|_2^2\,dt\ge0$.
Increasing $\kappa$ improves the bound above, but this does not prove that
every realized trajectory has monotonically smaller enstrophy as $\kappa$
increases. Delayed or phase-shifted feedback is a different model:
$-\kappa P_Ku(t-\tau)$ need not extract energy at time $t$.

## Implemented forcing and discretization

For amplitude $A\ge0$ and real scalar signals $a_1,a_2$, the velocity forcing is

$$
f=A(a_1g_1+a_2g_2),\qquad
g_1=(0,\sqrt2\sin x),\quad
g_2=(-\sin(x+y),\sin(x+y)).
$$

Both fields have zero spatial mean and zero divergence. They are orthonormal
in the normalized velocity inner product, with
$-\Delta g_1=g_1$ and $-\Delta g_2=2g_2$. Their curls are

$$
h_1=\sqrt2\cos x,\qquad h_2=2\cos(x+y).
$$

It follows exactly that

$$
\|f(t)\|_2^2=A^2(a_1(t)^2+a_2(t)^2),\qquad
\|\operatorname{curl}f(t)\|_2^2
 =A^2(a_1(t)^2+2a_2(t)^2).
$$

The nonparallel wavevectors $(1,0)$ and $(1,1)$ have distinct lengths. This
avoids the special case of a single Laplacian eigenspace, where the
two-dimensional vorticity advection can vanish identically. Nonlinearity is
also measured directly; complicated-looking input alone does not demonstrate
nonlinear transfer.

`solver.py` evolves vorticity with forcing $A(a_1h_1+a_2h_2)$.
For $k\ne0$ it reconstructs velocity as

$$
\widehat u_x=i k_y\widehat\omega/|k|^2,\qquad
\widehat u_y=-i k_x\widehat\omega/|k|^2,
$$

which has curl $\omega$ with the convention above. Its strict rectangular
two-thirds truncation removes quadratic aliasing on the retained Fourier
modes. Thus the spatial Galerkin system preserves the nonlinear cancellations
in (1)--(2). Parseval divides squared unnormalized FFT coefficients by $n^4$,
matching the normalized spatial integrals. `control_cutoff=None` means full
feedback; otherwise it implements $P_K$ with $K=\texttt{control_cutoff}$.
The reported `alpha` includes continuum modes beyond the grid and remains a
valid, possibly conservative coercivity constant for the truncated system.

Explicit RK4 time integration introduces numerical error. Budget residuals,
an exact forced-shear test, and resolution/timestep comparisons provide
checks, rather than a rigorous discretization-error bound. The stability
guards are numerical safeguards. Reported maxima, including `max_enstrophy`,
are maxima over recorded samples, not certified suprema between those times.

## What the input comparison can establish

`signals.py` uses two zero-mean, unit-RMS channels of a finite trigonometric
polynomial. This makes the periodically repeated forcing smooth. An audio
clip is represented by two chosen numeric features; the repository pangram
is mapped to two synthetic channels. Those choices do not model a vocal tract
or assign physical significance to letters, primes, meaning, or sacred status.

At every positive temporal harmonic $n$, the surrogate multiplies **both**
channels' coefficients by the same random phase:

$$
\widetilde A_j(n)=A_j(n)e^{i\phi_n}.
$$

Consequently $|\widetilde A_j(n)|=|A_j(n)|$ and
$\widetilde A_j(n)\overline{\widetilde A_\ell(n)}
=A_j(n)\overline{A_\ell(n)}$: channel powers and cross spectra are preserved.
No subsequent peak normalization is applied. Peaks, amplitude distributions,
envelopes, and relationships between distinct temporal harmonics can change.
Over complete periods, forcing squared-norm integrals are preserved; over
partial periods this need not hold. Actual work $\int\langle f,u\rangle dt$
can differ even when forcing RMS and spectra match.

A comparison may therefore identify sensitivity to temporal organization in
this specified model, using quantities such as time-mean palinstrophy and
measured input work. Surrogate ranks are descriptive unless a justified
statistical null and its sampling assumptions are supplied. Identical forcing
and initial data produce identical solutions regardless of the input's
semantic label. Turbulent or chaotic flow can remain smooth; neither a large
diagnostic nor a quiet simulation is a test of continuum singularity.

A temporal Fourier representation describes the same time-dependent input in
frequency coordinates. Evaluating it at time $t$ still gives a force at physical
or nondimensional time $t$. It does not leave physical time, provide future
measurements to a causal controller, or remove the initial-value problem.

## Why the argument does not settle three dimensions

In three dimensions, smooth solutions with full-state drag instead obey

$$
\frac12\frac d{dt}\|\omega\|_2^2
 +\nu\|\nabla\omega\|_2^2+\kappa\|\omega\|_2^2
 =\langle(\omega\cdot\nabla)u,\omega\rangle
  +\langle\operatorname{curl}f,\omega\rangle.
$$

The vortex-stretching term has no fixed sign and does not vanish in general.
The two-dimensional norm inequality therefore does not follow in three
dimensions. An arbitrary-data three-dimensional regularity proof would need
an additional argument controlling that obstruction. Finite-resolution
simulations and the calibration estimates above supply no such argument.

## A restricted three-dimensional theorem with full instantaneous drag

There is nevertheless a standard sufficient condition for global regularity
of the **controlled** three-dimensional equation. This is an analytic result
separate from the two-dimensional computations; no three-dimensional numerical
test is implemented here.

Consider the same velocity equation on
$\mathbb T^3=(\mathbb R/2\pi\mathbb Z)^3$, with the full controller
$-\kappa u(t,x)$ in place of $-\kappa P_Ku$. Use normalized integrals
$(2\pi)^{-3}\int_{[0,2\pi)^3}$ and the associated $L^p$ norms. Assume smooth
mean-zero divergence-free initial data and forcing, with
$\sup_{t\ge0}\|f(t)\|_2\le F<\infty$; forcing and its derivatives are smooth
and bounded on each compact time interval. Put

$$
Y(t)=\|\nabla u(t)\|_2^2,\qquad D(t)=\|\Delta u(t)\|_2^2.
$$

An elementary Fourier estimate gives an explicit interpolation constant.
Write

$$
\widehat u(k)=(2\pi)^{-3}\int_{[0,2\pi)^3}u(x)e^{-ik\cdot x}\,dx,
\quad
Y=\sum_{k\ne0}|k|^2|\widehat u(k)|^2,
\quad
D=\sum_{k\ne0}|k|^4|\widehat u(k)|^2.
$$

Here $|\widehat u(k)|$ is the Euclidean norm of the complex vector
coefficient. Thus the vector triangle inequality gives
$\|u\|_\infty\le\sum_{k\ne0}|\widehat u(k)|$, with no extra factor for
the number of components. Parseval also gives $D\ge Y$.
The integer lattice shell $|k|_\infty=m$ has
$(2m+1)^3-(2m-1)^3=24m^2+2$ points, each satisfying $|k|\ge m$.
For every integer $M\ge1$,

$$
\sum_{0<|k|_\infty\le M}|k|^{-2}
 \le\sum_{m=1}^M\frac{24m^2+2}{m^2}\le26M,
$$

$$
\sum_{|k|_\infty>M}|k|^{-4}
 \le26\sum_{m=M+1}^\infty m^{-2}
 \le26\int_M^\infty x^{-2}\,dx=\frac{26}{M}.
$$

Applying Cauchy--Schwarz separately to the low and high modes therefore gives

$$
\|u\|_\infty
 \le\sqrt{26M}\,Y^{1/2}+\sqrt{26/M}\,D^{1/2}.
$$

If $Y>0$, put $r=\sqrt{D/Y}\ge1$ and $M=\lceil r\rceil$, so
$r\le M\le2r$. It follows that

$$
\|u\|_\infty
 \le(\sqrt{52}+\sqrt{26})Y^{1/4}D^{1/4}
 \le13Y^{1/4}D^{1/4}.
$$

If $Y=0$, the mean-zero field is zero and this estimate holds trivially.
For smooth fields the Fourier series used above converge absolutely; the
same estimates extend to mean-zero $H^2$ fields. Consequently, taking
$C_0=13$,

$$
|\langle(u\cdot\nabla)u,\Delta u\rangle|
 \le\|u\|_\infty\|\nabla u\|_2\|\Delta u\|_2
 \le C_0Y^{3/4}D^{3/4}.
$$

Set

$$
A_\nu=\frac{27C_0^4}{16\nu^3}
     =\frac{771147}{16\nu^3},\qquad
B_\nu=\frac{2F^2}{\nu}.
$$

**Sufficient condition.** If there is a finite $R>0$ such that

$$
Y(0)\le R,\qquad A_\nu R^3-2\kappa R+B_\nu<0,
$$

then the controlled equation has a unique global smooth velocity, and
$Y(t)\le R$ for all $t\ge0$. Pressure is unique after fixing its spatial mean.
Equivalently, after choosing $R>0$ with $R\ge Y(0)$, it suffices to take

$$
\kappa>\frac{771147}{32\nu^3}R^2+\frac{F^2}{\nu R}.
$$

**Proof.** On the local smooth solution's interval of existence, take the
velocity inner product with $-\Delta u$. The pressure term vanishes, giving

$$
\frac12Y'+\nu D+\kappa Y
 \le C_0Y^{3/4}D^{3/4}+F\sqrt D.
$$

Young's inequality with these explicit allocations yields

$$
C_0Y^{3/4}D^{3/4}
 \le\frac\nu2D+\frac{27C_0^4}{32\nu^3}Y^3,
\qquad
F\sqrt D\le\frac\nu4D+\frac{F^2}{\nu}.
$$

Therefore

$$
Y'+\frac\nu2D\le A_\nu Y^3-2\kappa Y+B_\nu,
\qquad
Y'\le q(Y):=A_\nu Y^3-2\kappa Y+B_\nu. \tag{3}
$$

Since $q(R)<0$, the constant $R$ is a strict upper barrier. If $Y(0)<R$,
the first time a smooth trajectory reached $R$ from below would have
$Y'\ge0$, contradicting (3). If $Y(0)=R$, (3) makes $Y'(0)<0$ and the
trajectory first enters the region below $R$; the same argument then applies.
Equivalently, the scalar comparison theorem gives the barrier, because $q$
is locally Lipschitz. Smooth data justify these derivatives and continuity
throughout every local classical interval.

The bound on $Y$ also bounds the mean-zero velocity's full $H^1$ norm by
Poincare's inequality. Keeping the $D$ term in (3) shows
$\int_0^T D(t)\,dt<\infty$ on every finite interval. The usual local
strong-solution continuation theorem in $H^1$, with smooth forcing, rules
out a finite maximal existence time; regularity propagation then gives a
global smooth solution. The $H^1$ bound and the same local theory imply
uniqueness. This proves the stated sufficient condition.

This modifies the PDE by adding a controller whose gain depends on the data
and forcing bound. It establishes neither the arbitrary-data undamped
three-dimensional theorem nor a statement about every finite-mode or delayed
controller. The condition is sufficient and need not be necessary. The
explicit constant $C_0=13$ is a conservative bound for the exact torus and
norm normalization stated above; no sharpness or novelty is claimed. The
result gives a mathematical sufficient gain, not tested physical controller
performance. This analytic argument has not been formalized or checked by a
Lean kernel.

## Primary sources and background

- [Lenya Ryzhik, *Lecture notes for Math 256B* (2024), especially sections
  2, 3.4, and 5--6](https://math.stanford.edu/~ryzhik/notes-256B-24.pdf):
  background on vorticity, energy estimates, two-dimensional regularity, and
  local strong solutions and continuation in three dimensions. The controlled
  sufficient condition above is derived here from those standard estimates.
- [Cyranka, Mucha, Titi and Zgliczyński,
  *Stabilizing the long-time behavior of the forced Navier--Stokes and damped
  Euler systems by large mean flow*, Physica D 369 (2018), 18--29](https://doi.org/10.1016/j.physd.2017.12.010)
  ([author manuscript](https://arxiv.org/abs/1601.04612)):
  temporal oscillation can stabilize dynamics under the paper's specified
  hypotheses. Its restricted three-dimensional long-time results do not
  establish arbitrary-data global smoothness.
- [Schreiber and Schmitz, *Surrogate time series*, Physica D 142 (2000),
  346--382](https://doi.org/10.1016/S0167-2789(00)00043-9)
  ([author manuscript](https://arxiv.org/abs/chao-dyn/9909037)):
  construction, constraints, and interpretation of surrogate time series.
