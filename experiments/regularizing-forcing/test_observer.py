from dataclasses import replace
import unittest

import numpy as np

from observer import ObserverConfig, ObserverFlow, simulate_observer


class ObserverTests(unittest.TestCase):
    def test_reference_is_unchanged_by_gain_cutoff_and_noise(self):
        c = ObserverConfig(n=24, duration=0.5, dt=0.01)
        first = simulate_observer(replace(c,gain=0,cutoff=1))
        other = simulate_observer(replace(c,gain=1.3,cutoff=4,noise=0.02))
        np.testing.assert_array_equal(first["final_reference_vorticity"], other["final_reference_vorticity"])

    def test_instantaneous_error_identity_and_strain_bound(self):
        p = ObserverFlow(ObserverConfig(n=24,noise=0.03))
        state = p.default_states()
        _, _, _, residual = p.rhs(0.25,state,0.5)
        self.assertLess(abs(residual),1e-13)
        a,b,d,bound,rate = p.strain(state[0])
        self.assertLess(np.max(np.abs(a+d)),1e-14)
        self.assertLessEqual(rate,bound+1e-14)
        eta = p.noise_hat(0)
        self.assertAlmostEqual(np.sqrt(p.flow.inner(eta,eta,p.flow.inv_k2)),0.03)
        np.testing.assert_allclose(eta*(~p.observed),0,atol=1e-14)

    def test_exact_parallel_shear_for_observed_and_hidden_error(self):
        for mode in (1,4,6):
            c = ObserverConfig(n=24,dt=0.002,duration=0.5,viscosity=0.05,gain=1,cutoff=4)
            p = ObserverFlow(c)
            reference = -np.cos(p.flow.y)
            error = -np.sqrt(2)*mode*np.cos(mode*p.flow.y)
            result = simulate_observer(c,reference0=reference,observer0=reference+error)
            rate = c.viscosity*mode**2+c.gain*(mode<=c.cutoff)
            self.assertAlmostEqual(result["final_error_L2"],np.exp(-rate*c.duration),places=10)
            np.testing.assert_allclose(result["final_reference_vorticity"],
                                       reference*np.exp(-c.viscosity*c.duration),atol=1e-11)

    def test_exact_noisy_shear_and_noise_floor(self):
        c = ObserverConfig(n=24,dt=0.002,duration=1,viscosity=0.1,gain=0.8,
                           noise=0.03,cutoff=2,noise_period=3)
        p = ObserverFlow(c)
        zeros = np.zeros((c.n,c.n))
        result = simulate_observer(c,reference0=zeros,observer0=zeros)
        lam = c.viscosity+c.gain
        omega = 2*np.pi/c.noise_period
        t = c.duration
        exact = c.gain*c.noise*(lam*np.cos(omega*t)+omega*np.sin(omega*t)
                                -lam*np.exp(-lam*t))/(lam**2+omega**2)
        np.testing.assert_allclose(result["final_observer_vorticity"], exact*p.flow.h1,atol=1e-10)
        self.assertLessEqual(result["final_error_L2"],c.gain*c.noise/p.alpha+1e-12)

    def test_nonlinear_budgets_and_temporal_refinement(self):
        c = ObserverConfig(n=24,dt=0.02,duration=1,gain=0.8,cutoff=2)
        first = simulate_observer(c)
        medium = simulate_observer(replace(c,dt=0.01))
        fine = simulate_observer(replace(c,dt=0.005))
        error1 = np.linalg.norm(first["final_observer_vorticity"]-medium["final_observer_vorticity"])
        error2 = np.linalg.norm(medium["final_observer_vorticity"]-fine["final_observer_vorticity"])
        self.assertGreater(error1/error2,10)
        self.assertLess(fine["max_recorded_budget_error"],1e-8)
        self.assertLess(fine["max_instantaneous_error_identity_residual"],1e-13)
        self.assertLess(fine["max_recorded_envelope_excess"],1e-8)

    def test_integer_cutoff_and_resolved_band_required(self):
        for kwargs in [dict(cutoff=1.5),dict(cutoff=0),dict(cutoff=8,n=24),
                       dict(gain=-1),dict(noise=-0.1),dict(noise_period=0)]:
            with self.assertRaises(ValueError):
                ObserverConfig(**kwargs)


if __name__ == "__main__":
    unittest.main()
