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
    imageBase64,
    imageMediaType,
  }: {
    passage: string
    closingWord: string
    profile: Profile | null
    prevEntries: Entry[]
    inspoCtx: string
    newsCtx: string
    arcCtx: string
    archetype: string | null
    imageBase64?: string
    imageMediaType?: string
  } = body

  const system = reflectSystemPrompt(
    profile,
    prevEntries || [],
    closingWord || '',
    inspoCtx || '',
    newsCtx || '',
    arcCtx || '',
    archetype
  )

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
        messages: [{
          role: 'user',
          content: imageBase64 && imageMediaType
            ? [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: imageMediaType,
                    data: imageBase64,
                  },
                },
                {
                  type: 'text',
                  text: `The user chose this image as their semicolon moment — the frame they would keep if the day had only one image. Read it as part of their entry, not as a detached object. Let what you notice inform the reflection naturally, emotionally, and symbolically where appropriate, without turning clinical or sounding like an image caption.\n\n${passage}`,
                },
              ]
            : passage,
        }],
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
