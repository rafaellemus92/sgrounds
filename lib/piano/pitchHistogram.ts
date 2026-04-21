// Duration-weighted pitch-class histogram.
//
// For each of 12 pitch classes (C=0, C#=1, …, B=11), sum how much *time*
// was spent on that class during the session. Normalize so the values sum
// to 1. We weight by duration (not just count) so a held whole note counts
// more than a passing sixteenth — the resulting histogram describes the
// tonal center of the playing, not the note density.

import type { Hand, OnsetEvent, ScoreNote } from './types';

export interface PitchHistogram {
  byClass: Float64Array;   // length 12, sums to 1 (or 0 if empty)
  total: number;           // total weighted mass before normalization
}

export interface HandedHistogram {
  lh: PitchHistogram;
  rh: PitchHistogram;
  combined: PitchHistogram;
}

function empty(): PitchHistogram {
  return { byClass: new Float64Array(12), total: 0 };
}

function add(h: PitchHistogram, pc: number, weight: number) {
  if (weight <= 0) return;
  h.byClass[pc] += weight;
  h.total += weight;
}

function normalize(h: PitchHistogram): PitchHistogram {
  if (h.total <= 0) return h;
  for (let i = 0; i < 12; i++) h.byClass[i] /= h.total;
  return h;
}

// Build the histogram from the *score* (what the piece asks of you). Useful
// as a reference to overlay against the actual-played histogram.
export function histogramFromScore(notes: ScoreNote[]): HandedHistogram {
  const lh = empty();
  const rh = empty();
  const combined = empty();
  for (const n of notes) {
    const pc = ((n.pitch % 12) + 12) % 12;
    const w = n.duration;
    if (n.hand === 'LH') add(lh, pc, w);
    else add(rh, pc, w);
    add(combined, pc, w);
  }
  return {
    lh: normalize(lh),
    rh: normalize(rh),
    combined: normalize(combined),
  };
}

// Build the histogram from the actual onsets the player produced. Duration
// is estimated as (nextOnsetOnSameHand - thisOnset), clamped to [0.05, 2.0]s.
// If there is no following onset for a given hand, we use the session end.
export function histogramFromEvents(
  events: OnsetEvent[],
  sessionEnd: number,
): HandedHistogram {
  const lh = empty();
  const rh = empty();
  const combined = empty();

  const sorted = [...events].sort((a, b) => a.t - b.t);
  const nextOnHand: number[] = new Array(sorted.length).fill(sessionEnd);
  const lastIdx: Record<Hand, number> = { LH: -1, RH: -1 };
  for (let i = sorted.length - 1; i >= 0; i--) {
    const h = sorted[i].hand;
    nextOnHand[i] = lastIdx[h] >= 0 ? sorted[lastIdx[h]].t : sessionEnd;
    lastIdx[h] = i;
  }

  for (let i = 0; i < sorted.length; i++) {
    const e = sorted[i];
    const rawDur = Math.max(0.05, Math.min(2.0, nextOnHand[i] - e.t));
    const pc = ((e.pitch % 12) + 12) % 12;
    if (e.hand === 'LH') add(lh, pc, rawDur);
    else add(rh, pc, rawDur);
    add(combined, pc, rawDur);
  }

  return {
    lh: normalize(lh),
    rh: normalize(rh),
    combined: normalize(combined),
  };
}

export const PITCH_CLASS_LABELS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
