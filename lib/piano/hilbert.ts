// FFT-based Hilbert transform and onset-density helpers.
//
// The analytic signal of a real sequence x is x + i·H{x}, where H is the
// Hilbert transform. Computed via FFT:
//   1. X[k]   = FFT(x)
//   2. Z[k]   = X[k] · h[k],  h = [1, 2, 2, ..., 2, 1, 0, 0, ..., 0]
//                              (h[0]=1, h[N/2]=1 when N even, h[1..N/2-1]=2)
//   3. z[n]   = IFFT(Z)
//
// We expose `instantaneousPhase(x)` and `analyticSignal(x)`; plus
// `onsetDensity(onsets, ...)` which turns a spike train into a Gaussian-
// smoothed continuous signal suitable for Hilbert phase extraction.

// ─── radix-2 iterative Cooley–Tukey FFT ──────────────────────────────────
// `re` and `im` are mutated in place. Length must be a power of two.

export function fftInPlace(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  if (n !== im.length) throw new Error('fft: re/im length mismatch');
  if ((n & (n - 1)) !== 0) throw new Error(`fft: length ${n} is not a power of 2`);

  // Bit-reverse permutation.
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  // Butterflies.
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const theta = -2 * Math.PI / len;
    const wpr = Math.cos(theta);
    const wpi = Math.sin(theta);
    for (let i = 0; i < n; i += len) {
      let wr = 1;
      let wi = 0;
      for (let k = 0; k < half; k++) {
        const tRe = wr * re[i + k + half] - wi * im[i + k + half];
        const tIm = wr * im[i + k + half] + wi * re[i + k + half];
        re[i + k + half] = re[i + k] - tRe;
        im[i + k + half] = im[i + k] - tIm;
        re[i + k] += tRe;
        im[i + k] += tIm;
        const nwr = wr * wpr - wi * wpi;
        wi = wr * wpi + wi * wpr;
        wr = nwr;
      }
    }
  }
}

export function ifftInPlace(re: Float64Array, im: Float64Array): void {
  for (let i = 0; i < im.length; i++) im[i] = -im[i];
  fftInPlace(re, im);
  const n = re.length;
  for (let i = 0; i < n; i++) {
    re[i] /= n;
    im[i] = -im[i] / n;
  }
}

function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

// Analytic signal of a real input. Returns {re, im} arrays of the original
// (un-padded) length.
export function analyticSignal(x: ArrayLike<number>): { re: Float64Array; im: Float64Array } {
  const nOrig = x.length;
  if (nOrig === 0) return { re: new Float64Array(0), im: new Float64Array(0) };
  const n = nextPow2(nOrig);
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < nOrig; i++) re[i] = x[i];

  fftInPlace(re, im);

  // Apply the Hilbert multiplier in-place.
  const half = n >> 1;
  // k = 0: leave as-is.
  for (let k = 1; k < half; k++) {
    re[k] *= 2;
    im[k] *= 2;
  }
  // k = n/2 (Nyquist): leave as-is for even n.
  for (let k = half + 1; k < n; k++) {
    re[k] = 0;
    im[k] = 0;
  }

  ifftInPlace(re, im);

  if (n === nOrig) return { re, im };
  return { re: re.slice(0, nOrig), im: im.slice(0, nOrig) };
}

// Per-sample instantaneous phase in radians, wrapped to (-π, π].
export function instantaneousPhase(x: ArrayLike<number>): Float64Array {
  const { re, im } = analyticSignal(x);
  const phase = new Float64Array(re.length);
  for (let i = 0; i < re.length; i++) phase[i] = Math.atan2(im[i], re[i]);
  return phase;
}

// Per-sample instantaneous amplitude envelope.
export function instantaneousAmplitude(x: ArrayLike<number>): Float64Array {
  const { re, im } = analyticSignal(x);
  const amp = new Float64Array(re.length);
  for (let i = 0; i < re.length; i++) amp[i] = Math.hypot(re[i], im[i]);
  return amp;
}

// Convert a spike train (onset times in seconds) into a uniformly-sampled
// density signal using a Gaussian kernel. Output has length `Math.ceil(tMax/dt)`.
//
//   density(t) = Σ (1 / (σ√(2π))) · exp(-(t - tᵢ)² / (2σ²))
//
// `sigma` is the kernel bandwidth in seconds (≈ 60ms works well for
// sixteenth-note to quarter-note tempos). The resulting signal mean is
// subtracted so the Hilbert transform gets a zero-mean input.
export function onsetDensity(
  onsets: ArrayLike<number>,
  tMax: number,
  dt: number,
  sigma: number,
): Float64Array {
  if (tMax <= 0 || dt <= 0) return new Float64Array(0);
  const nSamples = Math.max(2, Math.ceil(tMax / dt));
  const out = new Float64Array(nSamples);
  if (onsets.length === 0) return out;

  const norm = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const twoSig2 = 2 * sigma * sigma;
  // Truncate kernel at 4σ for speed.
  const halfWidth = Math.ceil((4 * sigma) / dt);

  for (let k = 0; k < onsets.length; k++) {
    const tk = onsets[k];
    const center = Math.round(tk / dt);
    const lo = Math.max(0, center - halfWidth);
    const hi = Math.min(nSamples - 1, center + halfWidth);
    for (let i = lo; i <= hi; i++) {
      const dtSec = i * dt - tk;
      out[i] += norm * Math.exp(-(dtSec * dtSec) / twoSig2);
    }
  }

  // Remove mean for Hilbert (otherwise DC dominates the phase estimate).
  let mean = 0;
  for (let i = 0; i < nSamples; i++) mean += out[i];
  mean /= nSamples;
  for (let i = 0; i < nSamples; i++) out[i] -= mean;
  return out;
}

// Unwrap phase: remove 2π discontinuities. Used for plotting, not for the
// order parameter itself (which uses raw wrapped phase).
export function unwrapPhase(phase: ArrayLike<number>): Float64Array {
  const out = new Float64Array(phase.length);
  if (phase.length === 0) return out;
  out[0] = phase[0];
  let offset = 0;
  for (let i = 1; i < phase.length; i++) {
    const diff = phase[i] - phase[i - 1];
    if (diff > Math.PI) offset -= 2 * Math.PI;
    else if (diff < -Math.PI) offset += 2 * Math.PI;
    out[i] = phase[i] + offset;
  }
  return out;
}
