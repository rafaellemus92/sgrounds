"""Standard-library unittest coverage for the local forcing signal inputs."""

import importlib.util
from pathlib import Path
import tempfile
import unittest
import wave

import numpy as np

from signals import MAX_HARMONICS, PeriodicSignal, _read_wav_pcm, pangram_signal, wav_signal


class PeriodicSignalTests(unittest.TestCase):
    def setUp(self):
        x = 2 * np.pi * np.arange(128) / 128
        self.values = np.column_stack((np.cos(x) + 0.4 * np.sin(7 * x),
                                       np.sin(2 * x) + 0.2 * np.cos(7 * x)))
        self.signal = PeriodicSignal(self.values, 8.0, {"source": "test"})

    def test_zero_mean_unit_rms_and_periodicity(self):
        signal = self.signal
        np.testing.assert_allclose(signal.samples.mean(axis=0), 0, atol=1e-15)
        np.testing.assert_allclose(np.sqrt(np.mean(signal.samples ** 2, axis=0)), 1, atol=1e-14)
        for t in (-0.5, 0.0, 0.2, 1.1, 7.9):
            self.assertEqual(signal(t).shape, (2,))
            np.testing.assert_allclose(signal(t), signal(t + 8), atol=1e-14)
        self.assertFalse(signal.samples.flags.writeable)

    def test_grid_evaluation_and_conjugate_reconstruction(self):
        signal = self.signal
        evaluated = np.array([signal(t) for t in np.arange(128) * 8 / 128])
        np.testing.assert_allclose(evaluated, signal.samples, atol=2e-14)
        full = np.fft.fft(signal.samples, axis=0, norm="forward")
        np.testing.assert_allclose(full[1:64], np.conj(full[-1:64:-1]), atol=1e-15)
        np.testing.assert_allclose(np.fft.ifft(full, axis=0, norm="forward").real,
                                   signal.samples, atol=1e-15)

    def test_band_cap_and_nyquist_exclusion(self):
        x = 2 * np.pi * np.arange(128) / 128
        values = self.values + np.column_stack((5 * np.cos(40 * x), 3 * (-1.0) ** np.arange(128)))
        signal = PeriodicSignal(values, 8.0, {})
        spectrum = np.fft.rfft(signal.samples, axis=0, norm="forward")
        np.testing.assert_allclose(spectrum[MAX_HARMONICS + 1:], 0, atol=1e-15)
        np.testing.assert_allclose(signal.samples, self.signal.samples, atol=5e-14)

    def test_surrogate_preserves_channel_magnitudes_and_cross_spectra(self):
        original = np.fft.rfft(self.signal.samples, axis=0, norm="forward")
        surrogate = self.signal.phase_scramble(42)
        changed = np.fft.rfft(surrogate.samples, axis=0, norm="forward")
        np.testing.assert_allclose(np.abs(changed), np.abs(original), atol=4e-16, rtol=2e-14)
        np.testing.assert_allclose(changed[:, 0] * changed[:, 1].conj(),
                                   original[:, 0] * original[:, 1].conj(), atol=4e-16, rtol=2e-14)
        np.testing.assert_allclose(np.sqrt(np.mean(surrogate.samples ** 2, axis=0)), 1, atol=1e-14)
        np.testing.assert_array_equal(surrogate.samples, self.signal.phase_scramble(42).samples)
        self.assertFalse(np.allclose(surrogate.samples, self.signal.samples))
        self.assertFalse(np.allclose(surrogate.samples, self.signal.phase_scramble(43).samples))
        self.assertNotIn("surrogate", self.signal.metadata)

    def test_invalid_inputs(self):
        for values in (np.zeros((16, 2)), np.ones((16, 2)), np.zeros((16, 3)),
                       np.ones((3, 2)), np.full((16, 2), np.nan), np.ones((16, 2), dtype=complex)):
            with self.subTest(shape=values.shape), self.assertRaises(ValueError):
                PeriodicSignal(values, 8.0, {})
        for period in (0, -1, float("nan"), float("inf")):
            with self.assertRaises(ValueError):
                PeriodicSignal(self.values, period, {})
        with self.assertRaises(ValueError):
            self.signal(float("nan"))


class PangramSignalTests(unittest.TestCase):
    def test_actual_repository_witness_is_reverified_and_decodes(self):
        signal = pangram_signal()
        source = Path(__file__).resolve().parent.parent / "coupled_prime26_pangram.py"
        spec = importlib.util.spec_from_file_location("_test_repo_pangram", source)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        witness = module.find_pangram()
        words = module.verify(witness)
        self.assertEqual(signal.metadata["words"], words)
        self.assertEqual(signal.metadata["primes"], [module.decode(word) for word in words])
        self.assertEqual(sorted(signal.metadata["letters"]), list(module.ALPHABET))
        self.assertTrue(signal.metadata["verified"])
        self.assertEqual(len(signal.metadata["generator_sha256"]), 64)
        self.assertEqual(signal.samples.shape, (512, 2))
        self.assertTrue(np.all(np.isfinite(signal.samples)))
        np.testing.assert_array_equal(signal.samples, pangram_signal().samples)


class WavSignalTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)

    def write_wav(self, name, raw, width, channels=1, rate=8000):
        path = Path(self.directory.name) / name
        with wave.open(str(path), "wb") as stream:
            stream.setnchannels(channels)
            stream.setsampwidth(width)
            stream.setframerate(rate)
            stream.writeframes(raw)
        return path

    def test_exact_unsigned8_signed16_signed32_decoding(self):
        examples = [(1, bytes([0, 128, 255]), [-1, 0, 127 / 128]),
                    (2, np.array([-32768, 0, 32767], dtype="<i2").tobytes(), [-1, 0, 32767 / 32768]),
                    (4, np.array([-2147483648, 0, 2147483647], dtype="<i4").tobytes(),
                     [-1, 0, 2147483647 / 2147483648])]
        for width, raw, expected in examples:
            path = self.write_wav(f"pcm{width}.wav", raw, width)
            values, metadata = _read_wav_pcm(path)
            np.testing.assert_array_equal(values[:, 0], expected)
            self.assertEqual(metadata["frames"], 3)
            self.assertEqual(metadata["sample_width_bytes"], width)

    def test_wav_features_are_nonempty_finite_and_periodic(self):
        t = np.arange(8000) / 8000
        waveform = (0.5 + 0.2 * np.sin(2 * np.pi * 3 * t)) * np.sin(2 * np.pi * 9 * t)
        pcm = np.round(30000 * waveform).astype("<i2")
        path = self.write_wav("local.wav", pcm.tobytes(), 2)
        signal = wav_signal(path, period=4, samples=128)
        self.assertEqual(signal.samples.shape, (128, 2))
        self.assertTrue(np.all(np.isfinite(signal.samples)))
        self.assertEqual(signal.metadata["features"], ["RMS envelope", "signed sample mean"])
        self.assertEqual(signal.metadata["source"], "local_wav")
        np.testing.assert_allclose(signal(0), signal(4), atol=1e-15)
        np.testing.assert_allclose(np.mean(signal.samples ** 2, axis=0), 1, atol=1e-14)

    def test_stereo_decoding(self):
        pcm = np.array([[0, 32767], [-32768, 10]], dtype="<i2")
        path = self.write_wav("stereo.wav", pcm.tobytes(), 2, channels=2)
        values, metadata = _read_wav_pcm(path)
        np.testing.assert_array_equal(values, pcm.astype(float) / 32768)
        self.assertEqual(metadata["channels"], 2)

    def test_rejects_unsupported_empty_and_silent_wav(self):
        unsupported = self.write_wav("24bit.wav", b"\x00\x01\x00" * 16, 3)
        empty = self.write_wav("empty.wav", b"", 2)
        silence = self.write_wav("silence.wav", b"\x00\x00" * 256, 2)
        for path in (unsupported, empty, silence):
            with self.subTest(path=path), self.assertRaises(ValueError):
                wav_signal(path)
        with self.assertRaises(ValueError):
            wav_signal(empty, samples=3)


if __name__ == "__main__":
    unittest.main()
