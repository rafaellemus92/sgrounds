import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseMusicXML } from '../scoreAligner';

// End-to-end sanity check: the bundled MusicXML files in /public/scores must
// parse without error and return the expected note counts. This catches
// typos in the XML and alignment regressions.

describe('bundled scores', () => {
  it('c-major-scale.musicxml parses to 32 notes (16 per hand)', () => {
    const xml = readFileSync('public/scores/c-major-scale.musicxml', 'utf8');
    const notes = parseMusicXML(xml, { tempoBpm: 80 });
    expect(notes.length).toBe(32);
    const rh = notes.filter(n => n.hand === 'RH');
    const lh = notes.filter(n => n.hand === 'LH');
    expect(rh.length).toBe(16);
    expect(lh.length).toBe(16);
    // The lowest LH pitch is C3 (48), highest RH is C5 (72).
    expect(Math.min(...lh.map(n => n.pitch))).toBe(48);
    expect(Math.max(...rh.map(n => n.pitch))).toBe(72);
  });

  it('bach-invention-1.musicxml parses without error', () => {
    const xml = readFileSync('public/scores/bach-invention-1.musicxml', 'utf8');
    const notes = parseMusicXML(xml, { tempoBpm: 72 });
    // Measure 1: 14 pitched 16ths (RH subject), measure 2: 14 pitched 16ths
    // (LH subject) + 1 RH half note, measure 3: 8+8 eighths, measure 4:
    // 2 whole notes. = 14 + 15 + 16 + 2 = 47.
    expect(notes.length).toBe(47);
    // Sanity: hands populated.
    expect(notes.filter(n => n.hand === 'RH').length).toBeGreaterThan(0);
    expect(notes.filter(n => n.hand === 'LH').length).toBeGreaterThan(0);
  });
});
