// MusicXML → expected-note list for scoring.
//
// Parses a MusicXML string into a flat array of ScoreNotes with absolute
// onsets (in seconds at the supplied tempo). Handles the subset of MusicXML
// needed for piano score rendering: multiple parts, two staves per part,
// voices within a staff, <chord/>, <rest/>, <backup>, <forward>, tuplets,
// and mid-measure divisions changes.
//
// Unhandled on purpose: grace notes (stripped), repeats (unrolled only if the
// score has no explicit repeat structure), multi-measure rests.

import type { Hand, ScoreNote } from './types';

const STEP_TO_SEMITONE: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

export interface AlignOptions {
  tempoBpm: number;
  handSplitPitch?: number; // used only when a <note> has no <staff>
}

function pitchToMidi(step: string, octave: number, alter: number): number {
  const base = STEP_TO_SEMITONE[step.toUpperCase()];
  if (base === undefined) throw new Error(`bad pitch step: ${step}`);
  return (octave + 1) * 12 + base + alter;
}

function textOf(el: Element | null | undefined, selector: string): string | null {
  if (!el) return null;
  const child = el.querySelector(selector);
  return child?.textContent?.trim() ?? null;
}

function intOf(el: Element | null | undefined, selector: string, dflt = 0): number {
  const t = textOf(el, selector);
  if (t == null) return dflt;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : dflt;
}

// Count explicit <note> elements (including rests) in a measure — used to
// build stable, OSMD-alignable note ids. Chord notes share an index with the
// preceding non-chord note, matching how OSMD enumerates voice entries.
function buildNoteIds(partIndex: number, measureNum: number, measure: Element): Map<Element, string> {
  const ids = new Map<Element, string>();
  const notes = Array.from(measure.querySelectorAll(':scope > note')) as Element[];
  let counter = 0;
  let lastNonChordIdx = -1;
  for (const n of notes) {
    const isChord = n.querySelector(':scope > chord') != null;
    const voice = intOf(n, ':scope > voice', 1);
    const staff = intOf(n, ':scope > staff', 1);
    if (isChord && lastNonChordIdx >= 0) {
      ids.set(n, `p${partIndex}-m${measureNum}-s${staff}-v${voice}-i${lastNonChordIdx}`);
    } else {
      const idx = counter++;
      lastNonChordIdx = idx;
      ids.set(n, `p${partIndex}-m${measureNum}-s${staff}-v${voice}-i${idx}`);
    }
  }
  return ids;
}

export function parseMusicXML(xml: string, opts: AlignOptions): ScoreNote[] {
  const { tempoBpm } = opts;
  const handSplitPitch = opts.handSplitPitch ?? 60;

  // DOMParser is available in browsers and in vitest (jsdom env).
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const parseErr = doc.querySelector('parsererror');
  if (parseErr) throw new Error(`MusicXML parse error: ${parseErr.textContent}`);

  const secPerQuarter = 60 / tempoBpm;
  const parts = Array.from(doc.querySelectorAll('score-partwise > part, score-timewise > part'));
  if (parts.length === 0) throw new Error('no <part> found in MusicXML');

  const notes: ScoreNote[] = [];

  parts.forEach((part, partIndex) => {
    let divisions = 1;            // divisions per quarter note (mutable)
    let measureStartSec = 0;      // absolute seconds at start of current measure
    let measureDivisions = divisions * 4; // nominal divisions per measure (4/4 default)

    const measures = Array.from(part.querySelectorAll(':scope > measure'));
    for (const measure of measures) {
      const measureNum = parseInt(measure.getAttribute('number') ?? '0', 10) || (notes.length + 1);
      const ids = buildNoteIds(partIndex, measureNum, measure);

      // Cursor within the measure, in divisions.
      let cursor = 0;
      let lastNoteStartDivs = 0;   // for chord handling: chord notes share start
      let maxCursorReached = 0;    // used to advance measureStart if no time sig

      for (const child of Array.from(measure.children) as Element[]) {
        const tag = child.tagName.toLowerCase();

        if (tag === 'attributes') {
          const divEl = child.querySelector(':scope > divisions');
          if (divEl?.textContent) {
            const d = parseInt(divEl.textContent, 10);
            if (Number.isFinite(d) && d > 0) divisions = d;
          }
          const time = child.querySelector(':scope > time');
          if (time) {
            const beats = intOf(time, ':scope > beats', 4);
            const beatType = intOf(time, ':scope > beat-type', 4);
            measureDivisions = Math.round(beats * (4 / beatType) * divisions);
          } else {
            // Recompute in case divisions changed but time sig didn't.
            measureDivisions = Math.round((measureDivisions / (divisions === 0 ? 1 : divisions)) * divisions) || divisions * 4;
          }
          continue;
        }

        if (tag === 'backup') {
          cursor -= intOf(child, ':scope > duration', 0);
          if (cursor < 0) cursor = 0;
          continue;
        }

        if (tag === 'forward') {
          cursor += intOf(child, ':scope > duration', 0);
          if (cursor > maxCursorReached) maxCursorReached = cursor;
          continue;
        }

        if (tag !== 'note') continue;

        const note = child;
        // Grace notes have no <duration>; we ignore them for alignment.
        if (note.querySelector(':scope > grace')) continue;

        const duration = intOf(note, ':scope > duration', 0);
        const isChord = note.querySelector(':scope > chord') != null;
        const isRest = note.querySelector(':scope > rest') != null;
        const voice = intOf(note, ':scope > voice', 1);
        const staffEl = note.querySelector(':scope > staff');
        const staff = staffEl ? parseInt(staffEl.textContent ?? '1', 10) : null;

        const startDivs = isChord ? lastNoteStartDivs : cursor;

        if (!isRest) {
          const pitchEl = note.querySelector(':scope > pitch');
          if (pitchEl) {
            const step = textOf(pitchEl, 'step') ?? 'C';
            const octave = intOf(pitchEl, 'octave', 4);
            const alter = intOf(pitchEl, 'alter', 0);
            const midi = pitchToMidi(step, octave, alter);

            let hand: Hand;
            if (staff === 2) hand = 'LH';
            else if (staff === 1) hand = 'RH';
            else hand = midi >= handSplitPitch ? 'RH' : 'LH';

            const onsetSec = measureStartSec + (startDivs / divisions) * secPerQuarter;
            const durSec = (duration / divisions) * secPerQuarter;

            notes.push({
              pitch: midi,
              onset: onsetSec,
              duration: Math.max(durSec, 0.05),
              hand,
              measure: measureNum,
              voice,
              id: ids.get(note) ?? `p${partIndex}-m${measureNum}-v${voice}-i${notes.length}`,
            });
          }
        }

        if (!isChord) {
          lastNoteStartDivs = cursor;
          cursor += duration;
          if (cursor > maxCursorReached) maxCursorReached = cursor;
        }
      }

      // Advance measureStart. Prefer the nominal measure length when set;
      // fall back to the furthest cursor reached (handles pickups + partial
      // measures without blowing up).
      const advanceDivs = measureDivisions > 0 ? measureDivisions : maxCursorReached;
      measureStartSec += (advanceDivs / divisions) * secPerQuarter;
    }
  });

  // Intentionally un-sorted: the order matches OSMD's reading-order
  // traversal of the same MusicXML, so callers can pair GraphicalNotes with
  // ScoreNotes by index. Callers that need time-ordered notes should sort
  // their own copy.
  return notes;
}

// Given the list of expected notes, find the best candidate for a player
// onset. Matches by pitch + hand, within `windowSec`, preferring the closest
// unmatched note. Used by the live matcher in app/piano/page.tsx.
export function findMatchIndex(
  expected: ScoreNote[],
  consumed: Set<string>,
  pitch: number,
  hand: Hand,
  tSec: number,
  windowSec: number,
): number {
  let bestIdx = -1;
  let bestDist = Infinity;
  for (let i = 0; i < expected.length; i++) {
    const n = expected[i];
    if (consumed.has(n.id)) continue;
    if (n.pitch !== pitch) continue;
    if (n.hand !== hand) continue;
    const dist = Math.abs(n.onset - tSec);
    if (dist > windowSec) continue;
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}
