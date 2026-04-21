import { describe, it, expect } from 'vitest';
import {
  kuramotoFromOnsets,
  liveFrame,
  orderParameter,
  orderParameterSeries,
} from '../kuramoto';

describe('orderParameter', () => {
  it('returns r = 1 for identical phases', () => {
    const { r, meanPhase } = orderParameter([0.5, 0.5, 0.5]);
    expect(r).toBeCloseTo(1, 10);
    expect(meanPhase).toBeCloseTo(0.5, 10);
  });

  it('returns r = 0 for antipodal phases', () => {
    const { r } = orderParameter([0, Math.PI]);
    expect(r).toBeCloseTo(0, 10);
  });

  it('returns r = 1/N for phases spread uniformly on the circle', () => {
    const n = 12;
    const phases: number[] = [];
    for (let i = 0; i < n; i++) phases.push((2 * Math.PI * i) / n);
    const { r } = orderParameter(phases);
    expect(r).toBeCloseTo(0, 10);
  });

  it('ignores non-finite phases', () => {
    const { r } = orderParameter([0, Number.NaN, 0]);
    expect(r).toBeCloseTo(1, 10);
  });

  it('N=2: r = |cos((θ₂ − θ₁)/2)|', () => {
    for (const delta of [0, 0.5, 1, Math.PI / 2, 2, Math.PI]) {
      const { r } = orderParameter([0, delta]);
      const expected = Math.abs(Math.cos(delta / 2));
      expect(r).toBeCloseTo(expected, 10);
    }
  });
});

describe('orderParameterSeries', () => {
  it('tracks r over time for two drifting oscillators', () => {
    // Two oscillators with slightly different frequencies → r should
    // oscillate between 1 and 0 as they phase-slip.
    const n = 200;
    const p1 = new Float64Array(n);
    const p2 = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      p1[i] = (0.1 * i) % (2 * Math.PI);
      p2[i] = (0.12 * i) % (2 * Math.PI);
    }
    const frames = orderParameterSeries([p1, p2], 0.01, 0);
    expect(frames.length).toBe(n);
    // Check that r hits both high and low values somewhere in the series.
    const rs = frames.map(f => f.r);
    expect(Math.max(...rs)).toBeGreaterThan(0.95);
    expect(Math.min(...rs)).toBeLessThan(0.1);
  });
});

describe('kuramotoFromOnsets', () => {
  it('gives high mean r when both hands have identical onset trains', () => {
    // 8 beats at 0.5 Hz — same spikes for both hands. Phases should lock.
    const onsets = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5];
    const frames = kuramotoFromOnsets([onsets, onsets], 4, 0.02, 0.08);
    const meanR = frames.slice(20, frames.length - 20)
      .reduce((a, f) => a + f.r, 0) / (frames.length - 40);
    expect(meanR).toBeGreaterThan(0.9);
  });

  it('gives lower mean r when one hand is offset by a half-period', () => {
    const inPhase = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5];
    const antiPhase = [0.25, 0.75, 1.25, 1.75, 2.25, 2.75, 3.25, 3.75];
    const frames = kuramotoFromOnsets([inPhase, antiPhase], 4, 0.02, 0.08);
    const meanR = frames.slice(20, frames.length - 20)
      .reduce((a, f) => a + f.r, 0) / (frames.length - 40);
    // Anti-phase should give substantially lower mean r than in-phase (1.0).
    expect(meanR).toBeLessThan(0.5);
  });
});

describe('liveFrame', () => {
  it('returns r = 1 when both live phases are identical', () => {
    const f = liveFrame(1.2, 1.2, 5);
    expect(f.r).toBeCloseTo(1, 10);
    expect(f.t).toBe(5);
    expect(f.phaseLH).toBe(1.2);
    expect(f.phaseRH).toBe(1.2);
  });
});
