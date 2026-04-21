// Types for the coupled-oscillator piano trainer.
//
// Every musical event in the system is either a ScoreNote (what the piece
// says) or an OnsetEvent (what the player actually produced). The only
// reserved dimensions are pitch (MIDI integer 0–127), time (seconds since
// session start), duration (seconds), and hand.

export type Hand = 'LH' | 'RH';

// A MIDI onset captured from either the Web MIDI API or the keyboard fallback.
// `t` is seconds since `MidiInput` mounted (performance.now() / 1000, zeroed).
export interface OnsetEvent {
  pitch: number;        // MIDI note number 0–127
  velocity: number;     // 0–127 (keyboard fallback emits 100)
  t: number;            // seconds, session-relative
  hand: Hand;           // derived from hand-split threshold or MIDI channel
  source: 'midi' | 'keyboard';
}

// A single expected note from the MusicXML score.
export interface ScoreNote {
  pitch: number;        // MIDI note number
  onset: number;        // seconds from start of piece (at chosen tempo)
  duration: number;     // seconds
  hand: Hand;           // derived from staff index or pitch threshold
  measure: number;      // 1-indexed measure
  voice: number;        // voice within the staff
  // Stable id so the OSMD renderer can paint the matching note head.
  // Format: `m{measure}-s{staff}-v{voice}-i{indexInMeasure}`
  id: string;
}

// Outcome of comparing an OnsetEvent against the ScoreNote it most likely
// belongs to. Used to color note heads and fill the timing strip.
export type MatchStatus = 'correct' | 'wrong' | 'missed' | 'pending';

export interface NoteMatch {
  note: ScoreNote;
  status: MatchStatus;
  event?: OnsetEvent;
  deviationMs?: number; // signed: positive = late, negative = early
}

// Session-level config surfaced in the UI.
export interface SessionConfig {
  tempoBpm: number;
  timingWindowMs: number;    // ± window for "correct"
  handSplitPitch: number;    // default 60 (middle C). Notes >= go RH.
  metronomeEnabled: boolean;
  synthFallback: boolean;    // play tone if MIDI device has no local sound
}

// A single frame of the Kuramoto live state, produced by the analysis loop
// in app/piano/page.tsx and rendered by PhasorDisplay.
export interface KuramotoFrame {
  t: number;               // seconds since session start
  r: number;               // order parameter in [0, 1]
  meanPhase: number;       // radians
  phaseLH: number;         // radians
  phaseRH: number;         // radians
}

// Everything SessionAnalytics needs after the user stops playing.
export interface SessionResult {
  startedAt: number;
  durationSec: number;
  config: SessionConfig;
  events: OnsetEvent[];
  matches: NoteMatch[];
  rSeries: KuramotoFrame[];
  accuracyPct: number;      // correct / (correct + wrong + missed)
}
