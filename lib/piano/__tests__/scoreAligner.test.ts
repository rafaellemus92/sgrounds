import { describe, it, expect } from 'vitest';
import { findMatchIndex, parseMusicXML } from '../scoreAligner';

const TINY_SCORE = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>piano</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <staves>2</staves>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>quarter</type><staff>1</staff></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>quarter</type><staff>1</staff></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>quarter</type><staff>1</staff></note>
      <note><pitch><step>F</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>quarter</type><staff>1</staff></note>
      <backup><duration>8</duration></backup>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><voice>2</voice><type>half</type><staff>2</staff></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><voice>2</voice><type>half</type><staff>2</staff></note>
    </measure>
  </part>
</score-partwise>`;

describe('parseMusicXML', () => {
  it('parses pitches, hands, and onsets at 60 bpm', () => {
    const notes = parseMusicXML(TINY_SCORE, { tempoBpm: 60 });
    expect(notes.length).toBe(6);

    // RH voice, 4 quarter notes from C5 up.
    expect(notes[0]).toMatchObject({ pitch: 72, hand: 'RH', measure: 1 });
    expect(notes[1]).toMatchObject({ pitch: 74, hand: 'RH' });
    expect(notes[2]).toMatchObject({ pitch: 76, hand: 'RH' });
    expect(notes[3]).toMatchObject({ pitch: 77, hand: 'RH' });
    // LH: C3, G3 half notes.
    expect(notes[4]).toMatchObject({ pitch: 48, hand: 'LH' });
    expect(notes[5]).toMatchObject({ pitch: 55, hand: 'LH' });

    // At 60 bpm: 1 quarter = 1 sec.
    expect(notes[0].onset).toBeCloseTo(0, 6);
    expect(notes[1].onset).toBeCloseTo(1, 6);
    expect(notes[2].onset).toBeCloseTo(2, 6);
    expect(notes[3].onset).toBeCloseTo(3, 6);
    expect(notes[3].duration).toBeCloseTo(1, 6);

    // LH: half notes at 0 and 2 sec.
    expect(notes[4].onset).toBeCloseTo(0, 6);
    expect(notes[4].duration).toBeCloseTo(2, 6);
    expect(notes[5].onset).toBeCloseTo(2, 6);
  });

  it('scales onsets with tempo', () => {
    const slow = parseMusicXML(TINY_SCORE, { tempoBpm: 30 });
    const fast = parseMusicXML(TINY_SCORE, { tempoBpm: 120 });
    // Second RH note: at 30 bpm, 2s; at 120 bpm, 0.5s.
    expect(slow[1].onset).toBeCloseTo(2, 6);
    expect(fast[1].onset).toBeCloseTo(0.5, 6);
  });

  it('emits stable ids that are unique', () => {
    const notes = parseMusicXML(TINY_SCORE, { tempoBpm: 60 });
    const ids = new Set(notes.map(n => n.id));
    expect(ids.size).toBe(notes.length);
  });

  it('falls back to pitch threshold when no <staff> tag is present', () => {
    const xml = TINY_SCORE.replace(/<staff>\d<\/staff>/g, '');
    const notes = parseMusicXML(xml, { tempoBpm: 60, handSplitPitch: 60 });
    // C5/D5/E5/F5 → RH; C3/G3 → LH.
    const rh = notes.filter(n => n.hand === 'RH').map(n => n.pitch).sort();
    const lh = notes.filter(n => n.hand === 'LH').map(n => n.pitch).sort();
    expect(rh).toEqual([72, 74, 76, 77]);
    expect(lh).toEqual([48, 55]);
  });
});

describe('findMatchIndex', () => {
  it('matches by pitch + hand + time window', () => {
    const expected = parseMusicXML(TINY_SCORE, { tempoBpm: 60 });
    const consumed = new Set<string>();
    // E5 at t=2 within ±80ms window → match.
    const idx = findMatchIndex(expected, consumed, 76, 'RH', 2.02, 0.08);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(expected[idx].pitch).toBe(76);
  });

  it('does not match outside the time window', () => {
    const expected = parseMusicXML(TINY_SCORE, { tempoBpm: 60 });
    const idx = findMatchIndex(expected, new Set(), 76, 'RH', 2.2, 0.08);
    expect(idx).toBe(-1);
  });

  it('does not match the wrong hand', () => {
    const expected = parseMusicXML(TINY_SCORE, { tempoBpm: 60 });
    const idx = findMatchIndex(expected, new Set(), 48, 'RH', 0, 0.1);
    expect(idx).toBe(-1);
  });

  it('skips consumed notes', () => {
    const expected = parseMusicXML(TINY_SCORE, { tempoBpm: 60 });
    const consumed = new Set([expected[0].id]);
    const idx = findMatchIndex(expected, consumed, 72, 'RH', 0, 0.1);
    expect(idx).toBe(-1);
  });
});
