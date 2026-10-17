"""Smooth, periodic two-channel inputs for the forcing experiment.

The prime-pangram input reuses the repository's actual verified witness.  Its
symbol-to-waveform mapping is arbitrary: it is not a speech model, and no
physical significance is assigned to primes, their spelling, or the pangram.
WAV files are read locally; this module does not record or upload audio.
"""

from __future__ import annotations

import copy
import hashlib
import importlib.util
from pathlib import Path
import wave

import numpy as np


MAX_HARMONICS = 24


class PeriodicSignal:
    """A real trigonometric polynomial with two zero-mean, unit-RMS channels.

    ``samples`` is an (M, 2) array on the uniform periodic grid [0, period).
    Construction projects it onto at most 24 positive Fourier harmonics and
    excludes the Nyquist mode.  The regenerated ``samples`` are read-only.
    Evaluation uses the same Fourier coefficients, so the forcing is smooth
    across the period boundary.  A channel with no retained variation is
    rejected because unit-RMS normalization would be undefined.
    """

    def __init__(self, samples: np.ndarray, period: float, metadata: dict):
        values = np.asarray(samples)
        if np.iscomplexobj(values):
            raise ValueError("Signal samples must be real")
        values = np.asarray(values, dtype=float)
        if values.ndim != 2 or values.shape[1] != 2 or values.shape[0] < 4:
            raise ValueError("Signal samples must have shape (M, 2), M >= 4")
        if not np.all(np.isfinite(values)):
            raise ValueError("Signal samples must be finite")
        if not np.isfinite(period) or period <= 0:
            raise ValueError("Signal period must be finite and positive")
        if not isinstance(metadata, dict):
            raise ValueError("Signal metadata must be a dictionary")

        count = values.shape[0]
        cutoff = min(MAX_HARMONICS, (count - 1) // 2)
        means = np.mean(values, axis=0)
        coeffs = np.fft.rfft(values - means, axis=0, norm="forward")
        coeffs[0] = 0
        coeffs[cutoff + 1:] = 0
        rms = np.sqrt(2.0 * np.sum(np.abs(coeffs[1:cutoff + 1]) ** 2, axis=0))
        if np.any(rms <= np.finfo(float).eps * np.maximum(1, np.max(np.abs(values), axis=0))):
            raise ValueError("Each signal channel needs nonconstant variation in the retained band")
        coeffs /= rms

        details = copy.deepcopy(metadata)
        details["signal_preprocessing"] = {
            "period": float(period),
            "samples": count,
            "positive_harmonics": cutoff,
            "nyquist_excluded": True,
            "removed_channel_means": means.tolist(),
            "retained_channel_rms_before_normalization": rms.tolist(),
            "normalization": "zero mean and unit RMS per channel",
        }
        self._install(coeffs, count, float(period), details)

    def _install(self, coeffs, count, period, metadata):
        self.period = period
        self.metadata = metadata
        self._coeffs = np.array(coeffs, dtype=complex, copy=True)
        self._coeffs.setflags(write=False)
        self._cutoff = min(MAX_HARMONICS, (count - 1) // 2)
        self._frequencies = np.arange(1, self._cutoff + 1)
        self.samples = np.fft.irfft(self._coeffs, n=count, axis=0, norm="forward")
        self.samples.setflags(write=False)

    @classmethod
    def _from_coeffs(cls, coeffs, count, period, metadata):
        """Preserve an existing normalization and its cross-channel spectra."""
        result = cls.__new__(cls)
        result._install(coeffs, count, period, copy.deepcopy(metadata))
        return result

    def __call__(self, t: float) -> np.ndarray:
        if not np.isfinite(t):
            raise ValueError("Signal evaluation time must be finite")
        fraction = (float(t) % self.period) / self.period
        phases = np.exp(2j * np.pi * self._frequencies * fraction)
        return 2.0 * np.real(phases @ self._coeffs[1:self._cutoff + 1])

    def phase_scramble(self, seed: int) -> "PeriodicSignal":
        """Randomize common phases, retaining channel powers and cross spectra.

        One random phase multiplies both channels at each positive frequency.
        This preserves c1 * conjugate(c2) as well as each |c|.  It changes
        phase relationships between frequencies.  No renormalization follows.
        """
        rng = np.random.default_rng(seed)
        coeffs = self._coeffs.copy()
        phases = np.exp(1j * rng.uniform(-np.pi, np.pi, self._cutoff))
        coeffs[1:self._cutoff + 1] *= phases[:, None]
        metadata = copy.deepcopy(self.metadata)
        metadata["surrogate"] = {
            "method": "common random phase per positive Fourier harmonic",
            "seed": int(seed),
            "preserved": ["channel Fourier magnitudes", "cross-channel Fourier spectra"],
        }
        return self._from_coeffs(coeffs, len(self.samples), self.period, metadata)


def _sample_count(samples):
    if isinstance(samples, bool) or not isinstance(samples, (int, np.integer)) or samples < 4:
        raise ValueError("samples must be an integer >= 4")
    return int(samples)


def _pangram_module():
    source = Path(__file__).resolve().parent.parent / "coupled_prime26_pangram.py"
    spec = importlib.util.spec_from_file_location("_forcing_prime26_source", source)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not import repository pangram generator: {source}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def pangram_signal(period=8.0, samples=512) -> PeriodicSignal:
    """Map the verified repository witness to a reproducible synthetic input.

    Letter A..Z is assigned a point on the unit circle, with linear periodic
    interpolation between letters followed by Fourier projection.  This is an
    arbitrary numeric mapping, not a pronunciation or semantic/audio model.
    """
    samples = _sample_count(samples)
    generator = _pangram_module()
    witness = generator.find_pangram()
    if witness is None:
        raise RuntimeError("The repository generator did not find its pangram witness")
    words = generator.verify(witness)
    target, pairs = witness
    letters = "".join(words)
    if len(letters) != 26 or sorted(letters) != list(generator.ALPHABET):
        raise RuntimeError("Repository witness failed the 26-letter pangram check")
    angles = 2 * np.pi * np.array([ord(letter) - ord("A") for letter in letters]) / 26
    points = np.column_stack((np.sin(angles), np.cos(angles)))
    cyclic_points = np.vstack((points, points[0]))
    locations = np.arange(27) / 26
    grid = np.arange(samples) / samples
    values = np.column_stack([np.interp(grid, locations, cyclic_points[:, j]) for j in range(2)])
    metadata = {
        "source": "repository_prime_pangram",
        "generator": "experiments/coupled_prime26_pangram.py",
        "generator_sha256": hashlib.sha256(Path(generator.__file__).read_bytes()).hexdigest(),
        "verified": True,
        "target_sum": int(target),
        "words": list(words),
        "letters": letters,
        "primes": [int(prime) for pair in pairs for prime in pair[:2]],
        "pairs": [[int(pair[0]), int(pair[1])] for pair in pairs],
        "mapping": "A..Z -> (sin(2*pi*index/26), cos(2*pi*index/26)); periodic linear interpolation",
        "interpretation": "Arbitrary synthetic symbol-to-waveform mapping; not speech; no physical significance of primes is assumed.",
    }
    return PeriodicSignal(values, period, metadata)


def _read_wav_pcm(path):
    """Decode only uncompressed integer PCM, without optional audio libraries."""
    try:
        with wave.open(str(path), "rb") as stream:
            if stream.getcomptype() != "NONE":
                raise ValueError("Only uncompressed integer PCM WAV is supported")
            width = stream.getsampwidth()
            if width not in (1, 2, 4):
                raise ValueError("WAV must contain 8-, 16-, or 32-bit integer PCM")
            channels = stream.getnchannels()
            rate = stream.getframerate()
            count = stream.getnframes()
            raw = stream.readframes(count)
    except (wave.Error, EOFError) as error:
        raise ValueError(f"Unsupported or invalid WAV: {error}") from error
    if count <= 0 or channels <= 0 or rate <= 0:
        raise ValueError("WAV must contain nonempty audio with a positive sample rate")
    if len(raw) != count * channels * width:
        raise ValueError("WAV PCM data is truncated")
    if width == 1:
        values = (np.frombuffer(raw, dtype=np.uint8).astype(float) - 128.0) / 128.0
    else:
        values = np.frombuffer(raw, dtype=f"<i{width}").astype(float) / (2 ** (8 * width - 1))
    return values.reshape(count, channels), {
        "sample_rate_hz": rate,
        "channels": channels,
        "sample_width_bytes": width,
        "frames": count,
        "duration_seconds": count / rate,
        "pcm_sha256": hashlib.sha256(raw).hexdigest(),
    }


def _bin_means(values, count):
    """Average piecewise-constant source samples into equal-duration cells."""
    edges = np.linspace(0.0, len(values), count + 1)
    integral = np.concatenate(([0.0], np.cumsum(values, dtype=float)))
    at_edges = np.interp(edges, np.arange(len(integral)), integral)
    return np.diff(at_edges) / (len(values) / count)


def wav_signal(path, period=8.0, samples=512) -> PeriodicSignal:
    """Use a local WAV's RMS envelope and signed mean as two numeric features.

    Channels are averaged to mono and the entire clip is mapped to one period.
    Equal-duration cell averages are Fourier-smoothed to <=24 harmonics.  This
    feature extraction is a numerical input choice, not a physical vocal-tract
    model.  Silent or constant retained features raise ValueError.  The file is
    never recorded, modified, or uploaded.
    """
    samples = _sample_count(samples)
    pcm, metadata = _read_wav_pcm(path)
    mono = np.mean(pcm, axis=1)
    envelope = np.sqrt(np.maximum(0.0, _bin_means(mono ** 2, samples)))
    signed_mean = _bin_means(mono, samples)
    metadata.update({
        "source": "local_wav",
        "path": "local input (absolute path omitted)",
        "features": ["RMS envelope", "signed sample mean"],
        "mapping": "mean-channel downmix; equal-duration cell means; clip duration mapped to one period",
        "interpretation": "Arbitrary audio feature input, not a physical speech model; read locally without recording or upload.",
    })
    return PeriodicSignal(np.column_stack((envelope, signed_mean)), period, metadata)
