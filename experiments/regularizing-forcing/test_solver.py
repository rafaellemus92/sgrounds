import unittest
from dataclasses import replace

import numpy as np

from solver import Config, Flow, simulate


class SolverTests(unittest.TestCase):
    def test_oscillating_forced_shear_against_closed_form(self):
        c = Config(n=24, dt=0.01, duration=1.0, viscosity=0.1,
                   amplitude=1.0, feedback=0.3, record_every=10)
        f = Flow(c)
        frequency = 1.7
        signal = lambda t: np.array([np.sin(frequency*t), 0.0])
        result = simulate(c, signal, omega0=0.4*f.h1)
        decay = c.viscosity+c.feedback
        t = c.duration
        b = (0.4*np.exp(-decay*t)
             + (decay*np.sin(frequency*t)-frequency*np.cos(frequency*t)
                + frequency*np.exp(-decay*t))/(decay**2+frequency**2))
        self.assertLess(np.max(np.abs(result["final_vorticity"]-b*f.h1)), 1e-9)
        self.assertLess(result["max_nonlinear_l2"], 1e-12)

    def test_nonlinearity_preserves_energy_and_enstrophy(self):
        f = Flow(Config(n=32))
        rng = np.random.default_rng(19)
        w = f.project(rng.normal(size=(32, 32)))
        adv, _, _ = f.nonlinear(w)
        self.assertLess(abs(f.inner(w, adv)), 2e-14)
        self.assertLess(abs(f.inner(w, adv, f.inv_k2)), 2e-14)
        uhat, vhat = f.velocity_hat(w)
        self.assertLess(np.max(np.abs(f.kx*uhat+f.ky*vhat)), 1e-12)

    def test_feedback_rates_and_continuum_coercivity(self):
        c = Config(n=24, viscosity=0.1, feedback=0.7, control_cutoff=2)
        f = Flow(c)
        self.assertAlmostEqual(f.alpha, 0.5)
        full = Flow(replace(c, control_cutoff=None))
        self.assertAlmostEqual(full.alpha, 0.8)
        w = f.initial()
        rates = f.rates(w, np.zeros_like(w))
        self.assertGreaterEqual(rates[3], 0)
        self.assertGreaterEqual(rates[5], 0)
        self.assertLessEqual(rates[1], -2*f.alpha*f.inner(w,w)/2 + 1e-14)

    def test_nonlinear_budget_and_timestep_convergence(self):
        c = Config(n=24, dt=0.02, duration=1.5, viscosity=0.08,
                   amplitude=0.8, feedback=0.2, record_every=1)
        signal = lambda t: np.array([np.cos(1.3*t), np.sin(0.7*t)])
        coarse = simulate(c, signal)
        medium = simulate(replace(c, dt=0.01), signal)
        fine = simulate(replace(c, dt=0.005), signal)
        err1 = np.linalg.norm(coarse["final_vorticity"]-medium["final_vorticity"])
        err2 = np.linalg.norm(medium["final_vorticity"]-fine["final_vorticity"])
        self.assertGreater(err1/err2, 10)
        self.assertGreater(fine["max_nonlinear_l2"], 0.01)
        self.assertLess(fine["max_energy_balance_error"], 1e-8)
        self.assertLess(fine["max_enstrophy_balance_error"], 1e-8)

    def test_bad_parameters_and_unstable_step_rejected(self):
        for kwargs in [dict(viscosity=0), dict(feedback=-1), dict(dt=-1), dict(n=15),
                       dict(n=16.0), dict(record_every=1.5)]:
            with self.assertRaises(ValueError):
                Config(**kwargs)
        with self.assertRaises(ValueError):
            simulate(Config(n=64, dt=1.0), lambda t: np.zeros(2))

    def test_stability_guard_uses_actual_adjusted_step(self):
        c = Config(n=12, dt=1.0, duration=0.001, viscosity=0.01, amplitude=0)
        f = Flow(c)
        result = simulate(c, lambda t: np.zeros(2), omega0=10*f.h1)
        self.assertLess(result["rows"][-1]["advective_step"], 0.05)


if __name__ == "__main__":
    unittest.main()
