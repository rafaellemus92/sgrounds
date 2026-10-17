"""Regression checks for preserving scientific outputs and refinement checks."""
import json
from pathlib import Path
import tempfile
import unittest

import numpy as np

from run_experiment import json_default, relative_refinement_changes, reserve_output


class ExportTests(unittest.TestCase):
    def test_numpy_scalar_export(self):
        result = json.loads(json.dumps({"passed": np.bool_(True), "n": np.int64(8)},
                                       default=json_default))
        self.assertEqual(result, {"passed": True, "n": 8})

    def test_run_cannot_overwrite_or_reuse_artifact_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            out = Path(directory)/"run"
            reserve_output(out)
            with self.assertRaises(ValueError):
                reserve_output(out)
            marker = out/"evidence.txt"
            marker.write_text("preserve this result")
            with self.assertRaises(ValueError):
                reserve_output(out)
            self.assertEqual(marker.read_text(), "preserve this result")

    def test_opposite_spatial_and_temporal_errors_do_not_cancel(self):
        changes = relative_refinement_changes(1.0, 1.009, 0.991)
        self.assertLess(changes["spatial"], 0.01)
        self.assertLess(changes["combined"], 0.01)
        self.assertGreater(changes["temporal"], 0.01)


if __name__ == "__main__":
    unittest.main()
