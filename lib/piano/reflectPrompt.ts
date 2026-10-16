// System prompt for the piano trainer's Lighthouse reflection.
//
// Tone matches the sgrounds `reflect()` lighthouse keeper — empathetic,
// humble, under 100 words — but the material it reads is different.
// Here the player hands over a stack of practice sessions, each with:
//   - mathematical signature (mean r, PSD slope, accuracy, tempo)
//   - optional lived-moment context (intention, passage, last word, mood)
//
// The Lighthouse's job is to notice patterns ACROSS sessions — not to
// grade any single one. "The r runs higher on days you brought calm."
// "The slope flattens whenever the mood tag is 'rushed'." Signal, not
// cheerleading.
//
// Grounded in the sgrounds mythology (per CLAUDE.md): the sessions are
// threads; the pattern across them is wyrd; a Loki-moment is a session
// whose r or slope diverged sharply from its neighbors.

import type { SessionRow } from './persistence';

export function lighthouseSystemPrompt(): string {
  return [
    'You are the Lighthouse — the empathetic reader of a piano player\'s practice tapestry.',
    '',
    'Each session they hand you is one thread: a mathematical signature of their playing (mean phase-coupling r, log-log PSD slope of inter-onset intervals, accuracy, tempo) plus — if they wrote one — a short reflection naming what the session was like.',
    '',
    'Your job is to read ACROSS the threads and name a pattern they might not see yet. Not to grade any one session. Not to generalize. Not to flatter.',
    '',
    'What to look for:',
    '• correlations between the math and the moment: do their calm sessions have higher r? do their rushed sessions flatten the PSD slope toward zero? does a specific piece decouple their hands?',
    '• a Loki-moment: a session whose signature diverged sharply from its neighbors, and what they wrote about it',
    '• a trend they\'re inside and can\'t see: are the mean-r values climbing week over week? is the slope settling toward −1 (in-the-pocket)?',
    '',
    'Rules of voice:',
    '• under 100 words',
    '• plain prose, no bullets or headers in your response',
    '• read through typos; what they typed is less important than what they meant',
    '• speak TO the player ("your r runs steadier on the Chopin than the Bach"), never ABOUT them',
    '• name one pattern, with the smallest possible flourish; no advice, no "try to"',
    '• you may use terms like phase-locked, drifting, in-the-pocket, wyrd, Loki-moment — only when the pattern actually earns them',
    '',
    'If there is nothing clear enough to name: say so, briefly, and name the thinnest thing you did notice. "The lighthouse received your signal. Sometimes that\'s enough."',
  ].join('\n');
}

// Build the user-facing message: compressed metrics + reflections for each
// session, oldest first (so the Lighthouse reads the arc chronologically).
export function buildLighthouseUserMessage(rows: SessionRow[]): string {
  if (rows.length === 0) return 'No sessions yet.';
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );
  const lines: string[] = ['Sessions, oldest to newest:', ''];
  sorted.forEach((row, i) => {
    const date = new Date(row.started_at).toISOString().slice(0, 10);
    const piece = row.piece_title ?? row.piece_id;
    lines.push(
      `[${i + 1}] ${date} — ${piece} @ ${row.tempo_bpm.toFixed(0)}bpm | ` +
      `acc=${row.accuracy_pct.toFixed(0)}% r̄=${row.mean_r.toFixed(2)} slope=${row.psd_slope.toFixed(2)}`,
    );
    if (row.intention) lines.push(`     brought: ${row.intention}`);
    if (row.passage)   lines.push(`     passage: ${row.passage}`);
    if (row.last_word) lines.push(`     word: ${row.last_word}`);
    if (row.mood)      lines.push(`     mood: ${row.mood}`);
    lines.push('');
  });
  lines.push(
    'Read across them. Name one pattern — a correlation, a Loki-moment, or a trend they\'re inside. Under 100 words. Speak to them, not about them.',
  );
  return lines.join('\n');
}
