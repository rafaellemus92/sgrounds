import { describe, it, expect } from 'vitest';
import {
  analyticSignal,
  fftInPlace,
  ifftInPlace,
  instantaneousAmplitude,
  instantaneousPhase,
  onsetDensity,
  unwrapPhase,
} from '../hilbert';

describe('fftInPlace / ifftInPlace', () => {
  it('round-trips a random signal', () => {
    const n = 64;
    const re = new Float64Array(n);
    const im = new Float64Array(n);
    const orig = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      re[i] = Math.sin(i * 0.3) + 0.5 * Math.cos(i * 1.1);
      orig[i] = re[i];
    }
    fftInPlace(re, im);
    ifftInPlace(re, im);
    for (let i = 0; i < n; i++) expect(re[i]).toBeCloseTo(orig[i], 8);
  });

  it('rejects non-power-of-2 lengths', () => {
    const re = new Float64Array(5);
    const im = new Float64Array(5);
    expect(() => fftInPlace(re, im)).toThrow(/power of 2/);
  });
});

describe('analyticSignal', () => {
  it('returns the Hilbert transform of a pure cosine as a sine of equal amplitude', () => {
    const n = 512;
    const f = 5; // cycles across the window
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = Math.cos((2 * Math.PI * f * i) / n);
    const { re, im } = analyticSignal(x);

    // Real part should match input; imaginary part should be sin of same f.
    // Edge samples are noisy (spectral leakage from finite windowing) — skip
    // a margin on each side when comparing.
    const margin = 32;
    for (let i = margin; i < n - margin; i++) {
      expect(re[i]).toBeCloseTo(Math.cos((2 * Math.PI * f * i) / n), 2);
      expect(im[i]).toBeCloseTo(Math.sin((2 * Math.PI * f * i) / n), 2);
    }
  });

  it('gives envelope ≈ 1 for a unit cosine', () => {
    const n = 512;
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = Math.cos((2 * Math.PI * 7 * i) / n);
    const amp = instantaneousAmplitude(x);
    let total = 0;
    for (let i = 64; i < n - 64; i++) total += amp[i];
    const mean = total / (n - 128);
    expect(mean).toBeCloseTo(1, 1);
  });
});

describe('instantaneousPhase', () => {
  it('increases monotonically for a positive-frequency complex exponential', () => {
    const n = 256;
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = Math.cos((2 * Math.PI * 4 * i) / n);
    const phase = instantaneousPhase(x);
    const unwrapped = unwrapPhase(phase);
    // Check phase advances by ~8π across the window (4 cycles).
    const margin = 32;
    const delta = unwrapped[n - margin] - unwrapped[margin];
    const expected = 2 * Math.PI * 4 * ((n - 2 * margin) / n);
    expect(delta).toBeCloseTo(expected, 0);
  });
});

describe('onsetDensity', () => {
  it('returns all zeros for empty input', () => {
    const d = onsetDensity([], 1, 0.01, 0.05);
    expect(d.length).toBeGreaterThan(0);
    for (const v of d) expect(v).toBeCloseTo(0, 12);
  });

  it('produces a peak near each onset', () => {
    const onsets = [0.2, 0.7];
    const d = onsetDensity(onsets, 1, 0.01, 0.05);
    // Find local maxima — they should be near indices 20 and 70.
    const peakIdx1 = Math.round(0.2 / 0.01);
    const peakIdx2 = Math.round(0.7 / 0.01);
    // Values at peak indices should be higher than at trough midpoint.
    const trough = Math.round(0.45 / 0.01);
    expect(d[peakIdx1]).toBeGreaterThan(d[trough]);
    expect(d[peakIdx2]).toBeGreaterThan(d[trough]);
  });
});
