import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { dataPoints } = await req.json()

  if (!dataPoints || dataPoints.length < 7) {
    return NextResponse.json({ pattern: '' })
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
        max_tokens: 200,
        system: 'Given these paired data points of [waking coherence score, dream quality score] across consecutive days, describe in 2-3 sentences what pattern if any is emerging. Note whether the relationship looks like a circle (1:1 coupling), figure-eight (2:1), trefoil (3:2), or no pattern. Be specific and honest if there is not enough data yet. Do not use the word "journey". Plain text only.',
        messages: [{
          role: 'user',
          content: `Data points (chronological): ${JSON.stringify(dataPoints.slice(-30))}`,
        }],
      }),
    })

    const data = await res.json()
    const pattern = data.content?.[0]?.text || ''
    return NextResponse.json({ pattern })
  } catch {
    return NextResponse.json({ pattern: '' })
  }
}
