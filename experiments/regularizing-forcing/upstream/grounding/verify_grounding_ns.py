#!/usr/bin/env python3
"""Reproduce elementary checks in grounding_navier_stokes.md.

These are numerical checks of identities and exact smooth examples, not a
Navier--Stokes global-regularity proof or a simulation of human physiology.
Dependencies: Python 3.12, NumPy, Matplotlib (see grounding_ns_requirements.txt).
Run: python3 verify_grounding_ns.py
Writes grounding_ns_results.json and grounding_ns.png beside this script.
"""

from __future__ import annotations

import json
import platform
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


def inner(a: np.ndarray, b: np.ndarray) -> float:
    """Normalized integral over the 2pi-periodic cube, vector components first."""
    return float(np.mean(np.sum(a * b, axis=0)))


class FourierCube:
    """Spectral derivatives on a periodic grid; checks use resolved polynomials."""

    def __init__(self, n: int = 32):
        self.n = n
        k = np.fft.fftfreq(n, d=1.0 / n)
        self.k = np.array(np.meshgrid(k, k, k, indexing="ij"))
        self.k2 = np.sum(self.k * self.k, axis=0)
        self.axes = (-3, -2, -1)

    def fft(self, a: np.ndarray) -> np.ndarray:
        return np.fft.fftn(a, axes=self.axes)

    def inverse(self, a: np.ndarray) -> np.ndarray:
        return np.fft.ifftn(a, axes=self.axes).real

    def leray(self, a: np.ndarray) -> np.ndarray:
        ah = self.fft(a)
        dot = np.sum(self.k * ah, axis=0)
        quotient = np.divide(
            dot, self.k2, out=np.zeros_like(dot), where=self.k2 != 0
        )
        return self.inverse(ah - self.k * quotient)

    def low(self, a: np.ndarray, cutoff: int) -> np.ndarray:
        return self.inverse(self.fft(a) * (self.k2 <= cutoff * cutoff))

    def gradient(self, a: np.ndarray) -> np.ndarray:
        """Result [velocity component, derivative direction, x, y, z]."""
        ah = self.fft(a)
        return np.stack(
            [self.inverse(1j * self.k[j] * ah) for j in range(3)], axis=1
        )

    def laplacian(self, a: np.ndarray) -> np.ndarray:
        return self.inverse(-self.k2 * self.fft(a))

    def divergence(self, a: np.ndarray) -> np.ndarray:
        return self.inverse(1j * np.sum(self.k * self.fft(a), axis=0))

    def curl(self, a: np.ndarray) -> np.ndarray:
        g = self.gradient(a)
        return np.array([g[2, 1] - g[1, 2], g[0, 2] - g[2, 0], g[1, 0] - g[0, 1]])

    def advect(self, a: np.ndarray, b: np.ndarray) -> np.ndarray:
        return np.einsum("jxyz,ijxyz->ixyz", a, self.gradient(b))

    def gradient_norm2(self, a: np.ndarray) -> float:
        return float(np.mean(np.sum(self.gradient(a) ** 2, axis=(0, 1))))

    def random_solenoidal(self, seed: int, rms: float) -> np.ndarray:
        rng = np.random.default_rng(seed)
        raw = rng.standard_normal((3, self.n, self.n, self.n))
        resolved = self.inverse(self.fft(raw) * ((self.k2 > 0) & (self.k2 <= 9)))
        field = self.leray(resolved)
        return field * (rms / np.sqrt(inner(field, field)))


def check_nonlinear_identities() -> list[dict]:
    cube = FourierCube(32)
    nu, mu, cutoff = 0.07, 0.8, 2
    damping_bound = min(mu, nu * (cutoff * cutoff + 1))
    results = []
    for seed in range(5):
        reference = cube.random_solenoidal(10 + 2 * seed, rms=0.7)
        error = cube.random_solenoidal(11 + 2 * seed, rms=0.6)
        observer = reference + error
        observed_error = cube.low(error, cutoff)
        rhs_reference = nu * cube.laplacian(reference) - cube.leray(
            cube.advect(reference, reference)
        )
        rhs_observer = nu * cube.laplacian(observer) - cube.leray(
            cube.advect(observer, observer)
        ) - mu * observed_error

        grad_ref = cube.gradient(reference)
        strain = 0.5 * (grad_ref + np.swapaxes(grad_ref, 0, 1))
        error_strain = float(
            np.mean(np.einsum("ixyz,ijxyz,jxyz->xyz", error, strain, error))
        )
        dissipation = nu * cube.gradient_norm2(error) + mu * inner(
            observed_error, observed_error
        )
        error_residual = (
            inner(error, rhs_observer - rhs_reference) + dissipation + error_strain
        )

        omega = cube.curl(reference)
        stretch = inner(omega, cube.advect(omega, reference))
        vorticity_residual = (
            inner(omega, cube.curl(rhs_reference))
            + nu * cube.gradient_norm2(omega)
            - stretch
        )
        transport_residual = inner(error, cube.advect(observer, error))
        divergence_max = float(np.max(np.abs(cube.divergence(observer))))
        coercivity_margin = dissipation - damping_bound * inner(error, error)
        assert abs(error_residual) < 2e-11
        assert abs(vorticity_residual) < 2e-11
        assert abs(transport_residual) < 2e-11
        assert divergence_max < 2e-11
        assert coercivity_margin > -2e-11
        results.append(
            {
                "seed": seed,
                "error_identity_absolute_residual": abs(error_residual),
                "vorticity_identity_absolute_residual": abs(vorticity_residual),
                "transport_cancellation_absolute_residual": abs(transport_residual),
                "maximum_grid_divergence": divergence_max,
                "coercivity_margin": coercivity_margin,
                "vorticity_stretching": stretch,
            }
        )
    assert max(abs(row["vorticity_stretching"]) for row in results) > 1e-5
    return results


def check_invisible_shears() -> list[dict]:
    """Resolved 1D quadrature of exact 3D shear fields, P_8 u = 0."""
    grid_n, cutoff = 1024, 8
    y = 2.0 * np.pi * np.arange(grid_n) / grid_n
    k = np.fft.fftfreq(grid_n, d=1.0 / grid_n)
    results = []
    for mode in (16, 32, 64):
        u = np.sqrt(2.0) * np.sin(mode * y)
        uh = np.fft.fft(u)
        derivative = np.fft.ifft(1j * k * uh).real
        observed = np.fft.ifft(uh * (np.abs(k) <= cutoff)).real
        energy = float(np.mean(u * u))
        gradient2 = float(np.mean(derivative * derivative))
        observed_rms = float(np.sqrt(np.mean(observed * observed)))
        assert abs(energy - 1.0) < 1e-12
        assert abs(gradient2 - mode * mode) / (mode * mode) < 1e-12
        assert observed_rms < 1e-12
        results.append(
            {
                "mode": mode,
                "velocity_L2_squared": energy,
                "gradient_L2_squared": gradient2,
                "observed_L2": observed_rms,
            }
        )
    return results


def check_exact_tracking() -> tuple[dict, dict]:
    """RK4 versus exact shears, each mode separately; no 3D blowup inference."""
    nu, mu, cutoff = 0.05, 1.0, 4
    modes = np.array([1, 2, 4, 8, 16])
    rates = nu * modes.astype(float) ** 2 + mu * (modes <= cutoff)
    times = np.linspace(0.0, 4.0, 4001)
    dt = times[1] - times[0]
    values = np.empty((len(times), len(modes)))
    values[0] = 1.0
    for step in range(1, len(times)):
        x = values[step - 1]
        k1 = -rates * x
        k2 = -rates * (x + 0.5 * dt * k1)
        k3 = -rates * (x + 0.5 * dt * k2)
        k4 = -rates * (x + dt * k3)
        values[step] = x + dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6.0
    exact = np.exp(-times[:, None] * rates)
    error = float(np.max(np.abs(values - exact)))
    assert error < 2e-10

    # A reference U = exp(-nu*t) sin(y)e1 has s(t) = 0.5 exp(-nu*t).
    a = min(mu, nu * (cutoff * cutoff + 1))
    integral_s = (1.0 - np.exp(-nu * times)) / (2.0 * nu)
    norm_bound = np.exp(-a * times + integral_s)
    assert np.max(exact - norm_bound[:, None]) < 2e-12
    report = {
        "viscosity": nu,
        "gain": mu,
        "cutoff": cutoff,
        "reference": "U(t,x)=exp(-nu*t) sin(x_2) e_1",
        "initial_error_modes": modes.tolist(),
        "mode_norm_decay_rates": rates.tolist(),
        "a": a,
        "reference_strain_upper_bound": 0.5,
        "uniform_guaranteed_norm_decay_rate": a - 0.5,
        "rk4_maximum_absolute_error": error,
        "interpretation": "Exact invariant shear subspace; all solutions smooth.",
    }
    data = {"time": times, "modes": modes, "exact": exact, "bound": norm_bound}
    return report, data


def make_figure(shears: list[dict], tracking: dict, output: Path) -> None:
    plt.rcParams.update(
        {"font.family": "DejaVu Sans", "font.size": 10, "axes.spines.top": False,
         "axes.spines.right": False, "savefig.facecolor": "white"}
    )
    fig, axes = plt.subplots(1, 3, figsize=(14.2, 4.6), layout="constrained")
    fig.suptitle("Finite observations, feedback, and the limit of the analogy", fontsize=15)
    n = np.array([row["mode"] for row in shears])
    axes[0].plot(n, np.ones(len(n)), "o-", color="#147D92", label=r"Energy $\|u\|_2^2=1$")
    axes[0].plot(n, n * n, "o-", color="#C25A2B", label=r"Gradient $\|\nabla u\|_2^2=n^2$")
    axes[0].set_yscale("log")
    axes[0].set_xticks(n)
    axes[0].set_xlabel("Unobserved shear frequency n")
    axes[0].set_title("Same energy and observations")
    axes[0].legend(loc="center left", frameon=False, fontsize=9)
    axes[0].text(0.04, 0.93, r"$P_8u_n=0$ for every example", transform=axes[0].transAxes)

    for j, mode in enumerate(tracking["modes"]):
        axes[1].semilogy(
            tracking["time"], tracking["exact"][:, j],
            label=f"n={mode}" + (" (observed)" if mode <= 4 else ""),
        )
    axes[1].semilogy(
        tracking["time"], tracking["bound"], "k--", linewidth=2,
        label="Proved upper bound",
    )
    axes[1].set_ylim(1e-5, 1.2)
    axes[1].set_title("Exact smooth shear errors")
    axes[1].set_xlabel("Time")
    axes[1].set_ylabel(r"Relative error norm $\|e(t)\|_2/\|e(0)\|_2$")
    axes[1].legend(frameon=False, fontsize=8)

    gains = np.linspace(0, 1.5, 201)
    cutoffs = np.arange(1, 9)
    margins = np.minimum(gains[None, :], 0.05 * (cutoffs[:, None] ** 2 + 1)) - 0.5
    mesh = axes[2].pcolormesh(
        gains, cutoffs, margins, shading="nearest", cmap="RdBu", vmin=-0.5, vmax=0.5
    )
    axes[2].contour(gains, cutoffs, margins, levels=[0], colors="black", linewidths=1.2)
    axes[2].set_xlabel(r"Feedback gain $\mu$")
    axes[2].set_ylabel("Observed frequency cutoff K")
    axes[2].set_yticks(cutoffs)
    axes[2].set_title("Sufficient stability condition")
    fig.colorbar(mesh, ax=axes[2], label=r"$\min(\mu,0.05(K^2+1))-0.5$")
    fig.supxlabel(
        "Blue: this estimate guarantees decay. Red: the estimate is inconclusive. "
        "No blowup is shown in any panel.", fontsize=10,
    )
    fig.savefig(output, dpi=180)
    plt.close(fig)


def main() -> None:
    out = Path(__file__).resolve().parent
    identities = check_nonlinear_identities()
    shears = check_invisible_shears()
    tracking_report, tracking_data = check_exact_tracking()
    report = {
        "status": "All numerical identity/example checks passed; no global regularity proof.",
        "numpy_version": np.__version__,
        "matplotlib_version": matplotlib.__version__,
        "python_version": platform.python_version(),
        "convention": "Normalized volume on [0,2*pi]^3; integer radial Fourier cutoff.",
        "nonlinear_identity_checks": identities,
        "invisible_shears": shears,
        "exact_tracking": tracking_report,
    }
    (out / "grounding_ns_results.json").write_text(json.dumps(report, indent=2) + "\n")
    make_figure(shears, tracking_data, out / "grounding_ns.png")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
