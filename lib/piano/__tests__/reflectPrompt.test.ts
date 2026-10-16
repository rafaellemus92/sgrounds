import { describe, it, expect } from 'vitest';
import { buildLighthouseUserMessage, lighthouseSystemPrompt } from '../reflectPrompt';
import type { SessionRow } from '../persistence';

function row(
  partial: Partial<SessionRow> & { id: string; started_at: string },
): SessionRow {
  const defaults: SessionRow = {
    id: partial.id,
    user_id: null,
    piece_id: 'test',
    piece_title: 'Test Piece',
    started_at: partial.started_at,
    duration_sec: 60,
    tempo_bpm: 80,
    accuracy_pct: 85,
    mean_r: 0.75,
    psd_slope: -0.9,
    r_series: [],
    pitch_hist: { lh: Array(12).fill(0), rh: Array(12).fill(0), combined: Array(12).fill(0) },
    intention: null,
    passage: null,
    last_word: null,
    mood: null,
    created_at: '2026-01-01T00:00:00.000Z',
  };
  return { ...defaults, ...partial };
}

describe('lighthouseSystemPrompt', () => {
  it('names the role and the voice rules', () => {
    const s = lighthouseSystemPrompt();
    expect(s).toMatch(/Lighthouse/);
    expect(s).toMatch(/under 100 words/i);
    expect(s).toMatch(/across/i);
    // Mentions at least one piece of the native vocabulary.
    expect(s).toMatch(/(phase-locked|wyrd|Loki|in-the-pocket)/);
  });
});

describe('buildLighthouseUserMessage', () => {
  it('handles empty input', () => {
    expect(buildLighthouseUserMessage([])).toBe('No sessions yet.');
  });

  it('includes the headline metrics for each row and sorts oldest first', () => {
    const newer = row({ id: 'b', started_at: '2026-02-01T10:00:00Z', mean_r: 0.9 });
    const older = row({ id: 'a', started_at: '2026-01-01T10:00:00Z', mean_r: 0.5 });
    const msg = buildLighthouseUserMessage([newer, older]);
    const idxA = msg.indexOf('2026-01-01');
    const idxB = msg.indexOf('2026-02-01');
    expect(idxA).toBeGreaterThan(-1);
    expect(idxB).toBeGreaterThan(idxA); // older appears first in the serialized log
    expect(msg).toMatch(/r̄=0\.50/);
    expect(msg).toMatch(/r̄=0\.90/);
  });

  it('surfaces reflection fields when present', () => {
    const r = row({
      id: 'x',
      started_at: '2026-01-01T10:00:00Z',
      intention: 'calm',
      passage: 'the Bach felt breathed',
      last_word: 'tether',
      mood: 'flowing',
    });
    const msg = buildLighthouseUserMessage([r]);
    expect(msg).toMatch(/brought: calm/);
    expect(msg).toMatch(/passage: the Bach felt breathed/);
    expect(msg).toMatch(/word: tether/);
    expect(msg).toMatch(/mood: flowing/);
  });

  it('closes with a prompt instructing the model to name one pattern', () => {
    const r = row({ id: 'x', started_at: '2026-01-01T10:00:00Z' });
    const msg = buildLighthouseUserMessage([r]);
    expect(msg).toMatch(/one pattern/i);
    expect(msg).toMatch(/under 100 words/i);
  });
});
