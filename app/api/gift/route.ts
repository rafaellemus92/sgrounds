import { NextRequest, NextResponse } from 'next/server'
import { giftSystemPrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { passage, closingWord } = await req.json()

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
        max_tokens: 200,
        system: giftSystemPrompt,
        messages: [
          {
            role: 'user',
            content: `Passage: ${passage}\nClosing word: ${closingWord || 'none'}`,
          },
        ],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    return NextResponse.json({ gift: text })
  } catch {
    return NextResponse.json({ gift: '' })
  }
}
