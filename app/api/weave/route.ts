import { NextRequest, NextResponse } from 'next/server'
import { weaveSystemPrompt } from '@/lib/prompts'
import { Entry } from '@/lib/types'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { entries }: { entries: Entry[] } = await req.json()

  const entriesText = entries
    .map(
      (e) =>
        `[${e.date_key}] ${e.passage}${e.closing_word ? ` (closing: ${e.closing_word})` : ''}${e.arc_note ? ` (arc: ${e.arc_note})` : ''}`
    )
    .join('\n\n')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: weaveSystemPrompt,
        messages: [{ role: 'user', content: entriesText }],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    return NextResponse.json({ weave: text })
  } catch {
    return NextResponse.json({ weave: '' })
  }
}
