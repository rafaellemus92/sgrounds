"""Dealiased Fourier-Galerkin 2-D Navier--Stokes calibration experiment.

All space integrals are normalized means on [0, 2*pi)^2. This computes
finite-dimensional approximations of an already globally regular 2-D PDE.
It is neither a 3-D regularity proof nor a physical vocal-tract model.
"""

from dataclasses import dataclass, asdict
from typing import Callable

import numpy as np


@dataclass(frozen=True)
class Config:
    n: int = 48
    dt: float = 0.01
    duration: float = 16.0
    viscosity: float = 0.06
    amplitude: float = 0.8
    feedback: float = 0.0
    control_cutoff: float | None = 2.0
    record_every: int = 10

    def __post_init__(self):
        if isinstance(self.n, bool) or not isinstance(self.n, int) or self.n < 12 or self.n % 2:
            raise ValueError("n must be an even integer >= 12")
        if isinstance(self.record_every, bool) or not isinstance(self.record_every, int):
            raise ValueError("record_every must be a positive integer")
        if not all(np.isfinite(x) for x in
                   [self.dt, self.duration, self.viscosity,
                    self.amplitude, self.feedback]):
            raise ValueError("parameters must be finite")
        if self.dt <= 0 or self.duration <= 0 or self.viscosity <= 0:
            raise ValueError("dt, duration, and viscosity must be positive")
        if self.feedback < 0 or self.amplitude < 0 or self.record_every < 1:
            raise ValueError("feedback/amplitude >= 0 and record_every >= 1 required")
        if self.control_cutoff is not None and (
                not np.isfinite(self.control_cutoff) or self.control_cutoff < 1):
            raise ValueError("control_cutoff must be >= 1 or None for full feedback")


class Flow:
    def __init__(self, config: Config):
        self.config = config
        n = config.n
        k = np.fft.fftfreq(n, d=1 / n)
        self.kx, self.ky = np.meshgrid(k, k, indexing="ij")
        self.k2 = self.kx**2 + self.ky**2
        self.inv_k2 = np.zeros_like(self.k2)
        np.divide(1.0, self.k2, out=self.inv_k2, where=self.k2 > 0)
        # Strict 2/3 rule excludes the equality boundary and every alias triad.
        self.keep = ((np.abs(self.kx) < n / 3)
                     & (np.abs(self.ky) < n / 3) & (self.k2 > 0))
        cutoff = config.control_cutoff
        self.control = ((self.k2 > 0) if cutoff is None
                        else ((self.k2 > 0) & (self.k2 <= cutoff**2)))
        self.linear = -config.viscosity * self.k2 - config.feedback * self.control
        self.x, self.y = np.meshgrid(2 * np.pi * np.arange(n) / n,
                                     2 * np.pi * np.arange(n) / n, indexing="ij")
        # Curl of g1=(0,sqrt(2) sin x), g2=(-sin(x+y),sin(x+y)).
        # The velocity fields are orthonormal and have eigenvalues 1 and 2.
        self.h1 = np.sqrt(2) * np.cos(self.x)
        self.h2 = 2 * np.cos(self.x + self.y)
        self.h1hat, self.h2hat = self.project(self.h1), self.project(self.h2)
        self.normalization = float(n**4)

    @property
    def alpha(self):
        """Continuum coercivity constant, including modes beyond this grid."""
        c = self.config
        if c.control_cutoff is None:
            return c.viscosity + c.feedback
        radius = int(np.ceil(c.control_cutoff)) + 1
        next_eigenvalue = min(i*i + j*j
                             for i in range(-radius, radius + 1)
                             for j in range(-radius, radius + 1)
                             if i*i + j*j > c.control_cutoff**2)
        return min(c.viscosity + c.feedback, c.viscosity * next_eigenvalue)

    def project(self, physical):
        value = np.asarray(physical, dtype=float)
        if value.shape != (self.config.n, self.config.n) or not np.isfinite(value).all():
            raise ValueError("initial field must be finite and have shape (n,n)")
        return np.fft.fft2(value - value.mean()) * self.keep

    def inner(self, first, second, weight=1.0):
        return float(np.real(np.sum(weight * np.conj(first) * second))
                     / self.normalization)

    def velocity_hat(self, what):
        psi = what * self.inv_k2
        return 1j * self.ky * psi, -1j * self.kx * psi

    def initial(self):
        return self.project(0.3 * (np.sin(2*self.x) + np.cos(3*self.y)
                                  + 0.5*np.sin(self.x - 2*self.y)))

    def forcing(self, t, signal):
        a = np.asarray(signal(t), dtype=float)
        if a.shape != (2,) or not np.isfinite(a).all():
            raise ValueError("signal(t) must return two finite real coefficients")
        return self.config.amplitude * (a[0]*self.h1hat + a[1]*self.h2hat)

    def nonlinear(self, what):
        uhat, vhat = self.velocity_hat(what)
        u, v = np.fft.ifft2(uhat).real, np.fft.ifft2(vhat).real
        wx = np.fft.ifft2(1j * self.kx * what).real
        wy = np.fft.ifft2(1j * self.ky * what).real
        return -np.fft.fft2(u*wx + v*wy) * self.keep, u, v

    def rates(self, what, forcing_hat):
        """E', Z', forcing work, feedback extraction, and palinstrophy."""
        c = self.config
        w2 = self.inner(what, what)
        gradient2 = self.inner(what, what, self.k2)
        input_energy = self.inner(what, forcing_hat, self.inv_k2)
        input_enstrophy = self.inner(what, forcing_hat)
        extracted_energy = c.feedback * self.inner(what, what, self.control*self.inv_k2)
        extracted_enstrophy = c.feedback * self.inner(what, what, self.control)
        return np.array([
            input_energy - c.viscosity*w2 - extracted_energy,
            input_enstrophy - c.viscosity*gradient2 - extracted_enstrophy,
            input_energy, extracted_energy, input_enstrophy, extracted_enstrophy,
            gradient2,
        ])

    def rhs(self, t, what, signal, step_size=None):
        nonlinear, u, v = self.nonlinear(what)
        if step_size is not None:
            cfl = step_size * (np.max(np.abs(u))*np.max(np.abs(self.kx[self.keep]))
                               + np.max(np.abs(v))*np.max(np.abs(self.ky[self.keep])))
            if not np.isfinite(cfl) or cfl > 1.0:
                raise FloatingPointError("advective stability guard exceeded; reduce dt")
        forcing_hat = self.forcing(t, signal)
        return ((nonlinear + self.linear*what + forcing_hat)*self.keep,
                self.rates(what, forcing_hat))

    def step(self, t, what, h, signal):
        k1, b1 = self.rhs(t, what, signal, h)
        k2, b2 = self.rhs(t+h/2, what+h*k1/2, signal, h)
        k3, b3 = self.rhs(t+h/2, what+h*k2/2, signal, h)
        k4, b4 = self.rhs(t+h, what+h*k3, signal, h)
        return ((what+h*(k1+2*k2+2*k3+k4)/6)*self.keep,
                h*(b1+2*b2+2*b3+b4)/6)

    def diagnostics(self, t, what, integrals, initial_e, initial_z, step_size):
        nonlinear, u, v = self.nonlinear(what)
        z = self.inner(what, what)/2
        e = self.inner(what, what, self.inv_k2)/2
        w = np.fft.ifft2(what).real
        grad_energy = self.k2*np.abs(what)**2
        edge = self.keep & (np.maximum(np.abs(self.kx), np.abs(self.ky)) >= self.config.n/4)
        tail = float(grad_energy[edge].sum()/max(grad_energy.sum(), 1e-300))
        return dict(time=float(t), energy=e, enstrophy=z,
                    palinstrophy=self.inner(what, what, self.k2),
                    max_vorticity=float(np.max(np.abs(w))),
                    nonlinear_l2=np.sqrt(max(0.0, self.inner(nonlinear, nonlinear))),
                    input_work=float(integrals[2]),
                    feedback_extraction=float(integrals[3]),
                    vorticity_input=float(integrals[4]),
                    vorticity_extraction=float(integrals[5]),
                    palinstrophy_integral=float(integrals[6]),
                    energy_balance_error=e-initial_e-float(integrals[0]),
                    enstrophy_balance_error=z-initial_z-float(integrals[1]),
                    resolved_tail_fraction=tail,
                    advective_step=float(step_size * (
                        np.max(np.abs(u))*np.max(np.abs(self.kx[self.keep]))
                        + np.max(np.abs(v))*np.max(np.abs(self.ky[self.keep])))))


def simulate(config: Config, signal: Callable, omega0=None):
    flow = Flow(config)
    what = flow.initial() if omega0 is None else flow.project(omega0)
    e0 = flow.inner(what, what, flow.inv_k2)/2
    z0 = flow.inner(what, what)/2
    integrals = np.zeros(7)
    steps = int(np.ceil(config.duration/config.dt))
    # Last step adjusted so comparisons end at exactly the same time.
    h = config.duration/steps
    rows = [flow.diagnostics(0.0, what, integrals, e0, z0, h)]
    stiff_step = h * float(np.max(-flow.linear[flow.keep]))
    if stiff_step > 2.5:
        raise ValueError(f"RK4 diffusion/feedback step {stiff_step:.3g} too large; reduce dt")
    for j in range(steps):
        what, increment = flow.step(j*h, what, h, signal)
        integrals += increment
        if not np.isfinite(what).all():
            raise FloatingPointError("nonfinite numerical state; no singularity inference is valid")
        if (j+1) % config.record_every == 0 or j+1 == steps:
            row = flow.diagnostics((j+1)*h, what, integrals, e0, z0, h)
            if row["advective_step"] > 1.0:
                raise FloatingPointError("advective stability guard exceeded; reduce dt")
            rows.append(row)
    last = rows[-1]
    return dict(config=asdict(config), alpha=flow.alpha,
                mean_palinstrophy=float(integrals[6]/config.duration),
                max_enstrophy=max(r["enstrophy"] for r in rows),
                max_energy_balance_error=max(abs(r["energy_balance_error"]) for r in rows),
                max_enstrophy_balance_error=max(abs(r["enstrophy_balance_error"]) for r in rows),
                max_tail_fraction=max(r["resolved_tail_fraction"] for r in rows),
                max_nonlinear_l2=max(r["nonlinear_l2"] for r in rows),
                input_work=last["input_work"],
                feedback_extraction=last["feedback_extraction"],
                rows=rows, final_vorticity=np.fft.ifft2(what).real)
