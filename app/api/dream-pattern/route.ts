import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { dataPoints } = await req.json()

  const prompt = `You are analyzing paired data from a personal longitudinal study.
Each data point pairs a waking coherence score (0-100) with a dream quality score (0-7) from the following night.

Data: ${JSON.stringify(dataPoints)}

In 2-3 sentences, describe what pattern if any is emerging.
Reference Lissajous curve theory specifically: does the scatter suggest a circle (1:1 coupling), figure-eight (2:1), trefoil (3:2), or no discernible pattern?

Also note: does closing word valence appear to predict dream quality independently of coherence score?

Be precise. Be honest if there is insufficient data.
Do not use the word journey. Do not be encouraging if the data shows no pattern — that is a valid scientific finding.`

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
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    return NextResponse.json({ pattern: text })
  } catch {
    return NextResponse.json({ pattern: 'Insufficient data for pattern analysis.' })
  }
}
