import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { passage, closingWord } = await req.json()

  if (!passage) {
    return NextResponse.json({ summary: '' })
  }

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
        max_tokens: 100,
        system: 'In one sentence of 12-18 words, name what this day was about. Be specific to the content. Do not use the word "journey". Plain text only.',
        messages: [{
          role: 'user',
          content: `Passage: "${passage}"${closingWord ? `\nClosing word: "${closingWord}"` : ''}`,
        }],
      }),
    })

    const data = await res.json()
    const summary = data.content?.[0]?.text || ''
    return NextResponse.json({ summary })
  } catch {
    return NextResponse.json({ summary: '' })
  }
}
