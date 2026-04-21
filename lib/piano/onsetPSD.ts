// Welch's method PSD on the inter-onset-interval (IOI) series, with a
// log-log slope fit.
//
// Why IOI? The sequence of gaps between successive note onsets is the
// clearest signature of "feel". A metronomic player gives a flat / white
// spectrum (slope ≈ 0). A drifting player gives a steep pink or brown
// spectrum (slope < −1). Expert ensemble performance sits around slope
// ≈ −1 — 1/f / pink-noise IOI fluctuations, long-range correlated but not
// runaway. That's what we're measuring.
//
// References: Welch (1967); Hennig et al. "The nature and perception of
// fluctuations in human musical rhythms" (2011).

import { fftInPlace } from './hilbert';

export interface PSDResult {
  frequencies: Float64Array;   // normalized to [0, 0.5] cycles / sample
  power: Float64Array;         // one-sided PSD
  slope: number;               // least-squares slope of log P vs log f
  intercept: number;           // log-log intercept
  r2: number;                  // coefficient of determination of the fit
}

function hannWindow(m: number): Float64Array {
  const w = new Float64Array(m);
  for (let n = 0; n < m; n++) w[n] = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (m - 1)));
  return w;
}

function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

// IOI series: given sorted onset times, return the gaps between them. If the
// input has N onsets we return N−1 intervals.
export function interOnsetIntervals(onsets: ArrayLike<number>): Float64Array {
  if (onsets.length < 2) return new Float64Array(0);
  const out = new Float64Array(onsets.length - 1);
  for (let i = 0; i < out.length; i++) out[i] = onsets[i + 1] - onsets[i];
  return out;
}

// Welch's PSD + log-log slope fit.
//
// `segmentLength` defaults to min(64, largest pow2 ≤ N). `overlap` ∈ [0, 1).
export function welchPSD(
  signal: ArrayLike<number>,
  opts: { segmentLength?: number; overlap?: number } = {},
): PSDResult {
  const n = signal.length;
  if (n < 4) {
    return {
      frequencies: new Float64Array(0),
      power: new Float64Array(0),
      slope: 0,
      intercept: 0,
      r2: 0,
    };
  }

  let m = opts.segmentLength ?? Math.min(64, nextPow2(Math.floor(n / 2)));
  // Clamp to a power of 2 ≤ n.
  while (m > n) m >>= 1;
  if (m < 4) m = Math.min(4, n);
  m = nextPow2(m) > m ? m : nextPow2(m);
  if (m > n) m = nextPow2(Math.floor(n / 2));
  if (m < 4) m = 4;

  const overlap = opts.overlap ?? 0.5;
  const step = Math.max(1, Math.floor(m * (1 - overlap)));

  // Mean-center the signal so DC doesn't dominate.
  let mean = 0;
  for (let i = 0; i < n; i++) mean += signal[i];
  mean /= n;

  const window = hannWindow(m);
  let windowPower = 0;
  for (let i = 0; i < m; i++) windowPower += window[i] * window[i];
  windowPower /= m;

  const half = m >> 1;
  const psd = new Float64Array(half + 1);
  let numSegs = 0;

  const re = new Float64Array(m);
  const im = new Float64Array(m);

  for (let start = 0; start + m <= n; start += step) {
    for (let i = 0; i < m; i++) {
      re[i] = (signal[start + i] - mean) * window[i];
      im[i] = 0;
    }
    fftInPlace(re, im);
    // One-sided periodogram; double interior bins.
    psd[0] += (re[0] * re[0] + im[0] * im[0]) / (m * windowPower);
    for (let k = 1; k < half; k++) {
      const mag2 = re[k] * re[k] + im[k] * im[k];
      psd[k] += (2 * mag2) / (m * windowPower);
    }
    psd[half] += (re[half] * re[half] + im[half] * im[half]) / (m * windowPower);
    numSegs++;
  }

  if (numSegs === 0) {
    return {
      frequencies: new Float64Array(0),
      power: new Float64Array(0),
      slope: 0,
      intercept: 0,
      r2: 0,
    };
  }

  for (let k = 0; k <= half; k++) psd[k] /= numSegs;

  const freqs = new Float64Array(half + 1);
  for (let k = 0; k <= half; k++) freqs[k] = k / m;

  // Log-log slope fit. Skip DC (k=0) and any zero-power bins.
  const xs: number[] = [];
  const ys: number[] = [];
  for (let k = 1; k <= half; k++) {
    if (psd[k] <= 0) continue;
    xs.push(Math.log10(freqs[k]));
    ys.push(Math.log10(psd[k]));
  }
  const fit = linearFit(xs, ys);

  return {
    frequencies: freqs,
    power: psd,
    slope: fit.slope,
    intercept: fit.intercept,
    r2: fit.r2,
  };
}

function linearFit(xs: number[], ys: number[]): { slope: number; intercept: number; r2: number } {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
    sxx += xs[i] * xs[i];
    sxy += xs[i] * ys[i];
  }
  const meanX = sx / n;
  const meanY = sy / n;
  const varX = sxx - n * meanX * meanX;
  const covXY = sxy - n * meanX * meanY;
  if (Math.abs(varX) < 1e-12) return { slope: 0, intercept: meanY, r2: 0 };
  const slope = covXY / varX;
  const intercept = meanY - slope * meanX;

  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const pred = slope * xs[i] + intercept;
    ssRes += (ys[i] - pred) ** 2;
    ssTot += (ys[i] - meanY) ** 2;
  }
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  return { slope, intercept, r2 };
}
