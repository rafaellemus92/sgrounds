import unittest

from grounding_checks import run_identity_checks, upstream_module


class GroundingChecksTests(unittest.TestCase):
    def test_original_verifier_and_exact_hidden_shears(self):
        original = upstream_module()
        rows = original.check_invisible_shears()
        self.assertEqual([r["mode"] for r in rows],[16,32,64])
        for r in rows:
            self.assertAlmostEqual(r["velocity_L2_squared"],1)
            self.assertAlmostEqual(r["gradient_L2_squared"],r["mode"]**2,places=8)
            self.assertLess(r["observed_L2"],1e-12)

    def test_three_dimensional_identities_with_nonzero_stretching(self):
        result = run_identity_checks(count=2)
        self.assertTrue(result["passed"])
        self.assertLess(result["max_identity_residual"],1e-12)
        self.assertGreater(max(abs(r["stretching"]) for r in result["rows"]),1e-6)

    def test_polynomial_resolution_requirement(self):
        for kwargs in [dict(n=12),dict(n=23),dict(count=0)]:
            with self.assertRaises(ValueError):
                run_identity_checks(**kwargs)


if __name__ == "__main__":
    unittest.main()
