'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'

export default function LensPage() {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAnalyze() {
    const content = text || `URL: ${url}`
    if (!content.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/lens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      setAnalysis(data.analysis || null)
    } catch {}
    setLoading(false)
  }

  const inputStyle = {
    background: 'rgba(var(--sg-text-rgb), 0.032)',
    border: '1px solid rgba(var(--sg-text-rgb), 0.11)',
    color: 'rgba(var(--sg-text-rgb), 0.85)',
  }

  const labelStyle = {
    fontSize: '8px' as const,
    color: 'rgba(var(--sg-text-rgb), 0.34)',
    fontFamily: '"DM Mono", monospace',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    fontWeight: 500 as const,
  }

  function parseLens(t: string) {
    const labels = ['SOURCE', 'THE SIGNAL', 'THE FRAME', 'THE SHADOW', 'THE QUESTION']
    const sections: { label: string; content: string }[] = []
    let remaining = t
    for (const label of labels) {
      const marker = `${label}::`
      const idx = remaining.indexOf(marker)
      if (idx !== -1) {
        const after = remaining.slice(idx + marker.length)
        const nextLabel = labels.find((l) => l !== label && after.indexOf(`${l}::`) !== -1)
        let content: string
        if (nextLabel) {
          const nextIdx = after.indexOf(`${nextLabel}::`)
          content = after.slice(0, nextIdx).trim()
          remaining = after.slice(nextIdx)
        } else {
          content = after.trim()
          remaining = ''
        }
        sections.push({ label, content })
      }
    }
    return sections
  }

  return (
    <>
      <Nav />
      <div className="max-w-[520px] mx-auto px-4 pb-24 md:pb-8 pt-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-[28px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.7)' }}>
            Lens
          </h1>
          <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>
            Read an external signal through your practice
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div style={labelStyle} className="mb-1">URL</div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="paste article URL"
              className="w-full rounded-[9px] px-[13px] py-[10px] font-body text-[13px] outline-none transition-all focus:ring-2 focus:ring-sg-gold/50"
              style={inputStyle}
            />
          </div>
          <div>
            <div style={labelStyle} className="mb-1">OR PASTE TEXT</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="paste article text, quote, or passage"
              rows={6}
              className="w-full rounded-[9px] px-[13px] py-[10px] font-body text-[13px] outline-none resize-none transition-all focus:ring-2 focus:ring-sg-gold/50"
              style={inputStyle}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || (!url && !text)}
            className="w-full py-[12px] rounded-[18px] font-body text-[14px] tracking-wide transition-all"
            style={{
              background: loading ? 'rgba(201, 169, 110, 0.08)' : 'rgba(201, 169, 110, 0.18)',
              border: '1.5px solid rgba(201, 169, 110, 0.35)',
              color: 'rgba(201, 169, 110, 0.9)',
            }}
          >
            {loading ? 'Reading the signal…' : 'Analyze through the Lens'}
          </button>
        </div>

        {analysis && (
          <div className="mt-8 space-y-5 animate-slideUp">
            {parseLens(analysis).map(({ label, content }) => (
              <div key={label}>
                <span
                  className="font-mono text-[8px] uppercase tracking-[0.15em]"
                  style={{ color: 'rgba(201, 169, 110, 0.5)' }}
                >
                  {label}
                </span>
                <p
                  className={`mt-1 ${label === 'THE QUESTION' ? 'font-display italic text-[16px]' : 'font-body text-[14px]'}`}
                  style={{
                    color: label === 'THE QUESTION'
                      ? 'rgba(201, 169, 110, 0.7)'
                      : 'rgba(var(--sg-text-rgb), 0.6)',
                  }}
                >
                  {content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
