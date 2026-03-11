import { NextRequest, NextResponse } from 'next/server'
import { reflectSystemPrompt } from '@/lib/prompts'
import { Entry, Profile } from '@/lib/types'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const body = await req.json()
  const {
    passage,
    closingWord,
    profile,
    prevEntries,
    inspoCtx,
    newsCtx,
    arcCtx,
    archetype,
    echoText,
    echoType,
    arcText,
    imageUrl,
    echoReason,
    landingType,
    attunementGap,
    signalCoherence,
  }: {
    passage: string
    closingWord: string
    profile: Profile | null
    prevEntries: Entry[]
    inspoCtx: string
    newsCtx: string
    arcCtx: string
    archetype: string | null
    echoText: string | null
    echoType: string | null
    arcText: string | null
    imageUrl: string | null
    echoReason: string | null
    landingType: string | null
    attunementGap: number | null
    signalCoherence: number | null
  } = body

  const system = reflectSystemPrompt(
    profile,
    prevEntries || [],
    closingWord || '',
    inspoCtx || '',
    newsCtx || '',
    arcCtx || '',
    archetype,
    echoReason,
    landingType,
    attunementGap,
    signalCoherence,
  )

  // Build richer user prompt with echo and arc context
  let userPrompt = passage
  if (echoText) {
    userPrompt += `\n\nThey chose this ${echoType || 'echo'}: "${echoText}"`
  }
  if (arcText) {
    userPrompt += `\n\nThe larger arc they named: "${arcText}"`
  }
  if (closingWord) {
    userPrompt += `\n\nClosing word: "${closingWord}"`
  }

  // Build message content — include image as vision if available
  let userContent: unknown
  if (imageUrl) {
    userContent = [
      {
        type: 'image',
        source: {
          type: 'url',
          url: imageUrl,
        },
      },
      {
        type: 'text',
        text: `The user chose this image as their semicolon moment. Read it as part of their day — not as a caption but as feeling.\n\n${userPrompt}`,
      },
    ]
  } else {
    userContent = userPrompt
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
        max_tokens: 1000,
        system,
        messages: [{ role: 'user', content: userContent }],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text || 'The lighthouse received your signal. Sometimes that\'s enough.'
    return NextResponse.json({ reflection: text })
  } catch {
    return NextResponse.json({
      reflection: 'The lighthouse received your signal. Sometimes that\'s enough.',
    })
  }
}
