// Piano trainer — cross-session Lighthouse reflection.
//
// Reads the player's session rows (metrics + reflections) and asks Claude
// to name one pattern across them. Follows the same server-route pattern
// as /api/reflect (sgrounds' daily reflection): the API key lives in the
// server env, the client posts the raw rows, we build the prompt here, we
// return `{ reflection: string }`.
//
// Model: Claude 5 Sonnet (the latest), per the environment's "default to
// the most capable" guidance. Max 500 tokens — the Lighthouse is terse.

import { NextRequest, NextResponse } from 'next/server';
import {
  buildLighthouseUserMessage,
  lighthouseSystemPrompt,
} from '@/lib/piano/reflectPrompt';
import type { SessionRow } from '@/lib/piano/persistence';

const MODEL = 'claude-sonnet-5-5';
const FALLBACK = 'The lighthouse received your signal. Sometimes that\'s enough.';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  let body: { rows?: SessionRow[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (rows.length === 0) {
    return NextResponse.json({
      reflection: 'No threads yet. Return to the trainer and play one — the Lighthouse reads what the hands leave behind.',
    });
  }

  const system = lighthouseSystemPrompt();
  const user = buildLighthouseUserMessage(rows);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });
    const data = await res.json();
    const text: string = data.content?.[0]?.text || FALLBACK;
    return NextResponse.json({ reflection: text.trim() });
  } catch {
    return NextResponse.json({ reflection: FALLBACK });
  }
}
