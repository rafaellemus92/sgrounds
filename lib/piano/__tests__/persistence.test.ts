import { describe, it, expect } from 'vitest';
import { buildRowFromResult } from '../persistence';
import type { OnsetEvent, SessionResult } from '../types';

function makeResult(): SessionResult {
  const events: OnsetEvent[] = [
    { pitch: 60, velocity: 100, t: 0.0, hand: 'RH', source: 'midi' },
    { pitch: 48, velocity: 100, t: 0.1, hand: 'LH', source: 'midi' },
    { pitch: 62, velocity: 100, t: 0.5, hand: 'RH', source: 'midi' },
    { pitch: 50, velocity: 100, t: 0.6, hand: 'LH', source: 'midi' },
    { pitch: 64, velocity: 100, t: 1.0, hand: 'RH', source: 'midi' },
    { pitch: 52, velocity: 100, t: 1.1, hand: 'LH', source: 'midi' },
  ];
  return {
    startedAt: 0,
    durationSec: 2,
    config: {
      tempoBpm: 80,
      timingWindowMs: 80,
      handSplitPitch: 60,
      metronomeEnabled: true,
      synthFallback: false,
    },
    events,
    matches: [],
    rSeries: Array.from({ length: 40 }, (_, i) => ({
      t: i * 0.05,
      r: 0.9 - 0.02 * i,
      meanPhase: 0,
      phaseLH: 0,
      phaseRH: 0,
    })),
    accuracyPct: 100,
  };
}

describe('buildRowFromResult', () => {
  it('builds a row with headline metrics and compressed traces', () => {
    const row = buildRowFromResult(makeResult(), { pieceId: 'test' }, 'user-x');
    expect(row.user_id).toBe('user-x');
    expect(row.piece_id).toBe('test');
    expect(row.duration_sec).toBeCloseTo(2, 6);
    expect(row.tempo_bpm).toBe(80);
    expect(row.accuracy_pct).toBe(100);

    // mean_r = average over the synthetic descending r trace.
    expect(row.mean_r).toBeGreaterThan(0.5);
    expect(row.mean_r).toBeLessThan(1);

    // r_series is downsampled — 40 input frames at 20Hz over 2 sec collapses
    // to ~4 frames at 2Hz.
    expect(row.r_series.length).toBeLessThan(10);
    expect(row.r_series.length).toBeGreaterThan(0);

    // Pitch histogram sums to 1 (per hand or combined).
    const sum = row.pitch_hist.combined.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);

    // PSD slope is finite (fit over the IOIs).
    expect(Number.isFinite(row.psd_slope)).toBe(true);
  });

  it('handles empty event lists without throwing', () => {
    const empty: SessionResult = {
      startedAt: 0,
      durationSec: 0,
      config: {
        tempoBpm: 60,
        timingWindowMs: 80,
        handSplitPitch: 60,
        metronomeEnabled: false,
        synthFallback: false,
      },
      events: [],
      matches: [],
      rSeries: [],
      accuracyPct: 0,
    };
    const row = buildRowFromResult(empty, { pieceId: 'nil' }, null);
    expect(row.user_id).toBeNull();
    expect(row.r_series).toEqual([]);
    expect(row.pitch_hist.combined.length).toBe(12);
    expect(row.mean_r).toBe(0);
  });
});
