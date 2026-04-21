import { describe, it, expect } from 'vitest';
import { interOnsetIntervals, welchPSD } from '../onsetPSD';

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

describe('interOnsetIntervals', () => {
  it('returns N-1 gaps for N onsets', () => {
    const iois = interOnsetIntervals([0, 0.5, 1.2, 2.0]);
    expect(iois.length).toBe(3);
    expect(iois[0]).toBeCloseTo(0.5, 10);
    expect(iois[1]).toBeCloseTo(0.7, 10);
    expect(iois[2]).toBeCloseTo(0.8, 10);
  });

  it('returns empty for < 2 onsets', () => {
    expect(interOnsetIntervals([]).length).toBe(0);
    expect(interOnsetIntervals([1]).length).toBe(0);
  });
});

describe('welchPSD', () => {
  it('returns an empty result for too-short input', () => {
    const r = welchPSD([1, 2]);
    expect(r.frequencies.length).toBe(0);
    expect(r.slope).toBe(0);
  });

  it('fits near-zero slope on white noise', () => {
    const rng = seededRandom(42);
    const n = 512;
    const x: number[] = [];
    for (let i = 0; i < n; i++) x.push(rng() - 0.5);
    const { slope } = welchPSD(x, { segmentLength: 64 });
    // White noise → flat spectrum → slope near 0. Allow wide tolerance
    // because a 512-sample estimate has substantial variance.
    expect(Math.abs(slope)).toBeLessThan(0.4);
  });

  it('fits a strongly negative slope on an integrated-random-walk series', () => {
    // Brownian noise (integrated white) has a 1/f² spectrum → slope ≈ −2.
    const rng = seededRandom(7);
    const n = 1024;
    const x: number[] = [];
    let y = 0;
    for (let i = 0; i < n; i++) {
      y += rng() - 0.5;
      x.push(y);
    }
    const { slope } = welchPSD(x, { segmentLength: 128 });
    expect(slope).toBeLessThan(-1.0); // more negative than white
    expect(slope).toBeGreaterThan(-3.0);
  });

  it('handles constant-IOI (metronomic) input gracefully', () => {
    // Perfectly constant IOIs → zero variance → PSD concentrated at DC.
    const x = new Array(128).fill(0.5);
    const r = welchPSD(x);
    expect(Number.isFinite(r.slope)).toBe(true);
  });
});
