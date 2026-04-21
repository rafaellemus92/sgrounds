import { describe, it, expect } from 'vitest';
import { histogramFromEvents, histogramFromScore } from '../pitchHistogram';
import type { OnsetEvent, ScoreNote } from '../types';

function sn(pitch: number, onset: number, duration: number, hand: 'LH' | 'RH', id = ''): ScoreNote {
  return {
    pitch,
    onset,
    duration,
    hand,
    measure: 1,
    voice: 1,
    id: id || `n${pitch}-${onset}`,
  };
}

function ev(pitch: number, t: number, hand: 'LH' | 'RH'): OnsetEvent {
  return { pitch, t, hand, velocity: 100, source: 'midi' };
}

describe('histogramFromScore', () => {
  it('normalizes to sum 1 for non-empty input', () => {
    const notes = [
      sn(60, 0, 0.5, 'RH'),   // C
      sn(62, 0.5, 0.5, 'RH'), // D
      sn(64, 1, 1.0, 'RH'),   // E, 2x weight
    ];
    const h = histogramFromScore(notes);
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += h.combined.byClass[i];
    expect(sum).toBeCloseTo(1, 10);
    expect(h.combined.byClass[0]).toBeCloseTo(0.25, 6);  // C
    expect(h.combined.byClass[2]).toBeCloseTo(0.25, 6);  // D
    expect(h.combined.byClass[4]).toBeCloseTo(0.5, 6);   // E
  });

  it('splits by hand', () => {
    const notes = [
      sn(60, 0, 1, 'RH'),
      sn(48, 0, 1, 'LH'),
    ];
    const h = histogramFromScore(notes);
    expect(h.rh.byClass[0]).toBeCloseTo(1, 6);
    expect(h.lh.byClass[0]).toBeCloseTo(1, 6);
    expect(h.combined.byClass[0]).toBeCloseTo(1, 6);
  });

  it('folds by pitch class regardless of octave', () => {
    const notes = [
      sn(60, 0, 1, 'RH'),  // C4
      sn(72, 1, 1, 'RH'),  // C5
      sn(48, 2, 1, 'LH'),  // C3
    ];
    const h = histogramFromScore(notes);
    expect(h.combined.byClass[0]).toBeCloseTo(1, 6);
  });
});

describe('histogramFromEvents', () => {
  it('weights by per-hand inter-onset gap, clamped to session end', () => {
    // Two onsets on RH, one second apart, session ends at t=3.
    const evs = [ev(60, 0, 'RH'), ev(60, 1, 'RH')];
    const h = histogramFromEvents(evs, 3);
    // Weights: first note uses 1.0 sec gap; second uses (3-1)=2 clamped to 2.0.
    // Total = 3.0, both C, so byClass[0] = 1.
    expect(h.rh.byClass[0]).toBeCloseTo(1, 6);
  });

  it('handles empty events', () => {
    const h = histogramFromEvents([], 5);
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += h.combined.byClass[i];
    expect(sum).toBeCloseTo(0, 10);
  });
});
