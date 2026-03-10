import { NextRequest, NextResponse } from 'next/server'
import { lensSystemPrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { content } = await req.json()

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
        system: lensSystemPrompt,
        messages: [{ role: 'user', content }],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    return NextResponse.json({ analysis: text })
  } catch {
    return NextResponse.json({ analysis: '' })
  }
}
