'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { DreamEntry } from '@/lib/types'
import Nav from '@/components/Nav'

const QUALITY_MAP: Record<string, number> = {
  void: 0,
  threat: 2,
  flight: 3,
  presence: 4,
  resolution: 5,
  light: 6,
}

const QUALITY_LABELS: Record<number, string> = {
  0: 'Void',
  1: 'Fragments',
  2: 'Threat',
  3: 'Flight',
  4: 'Presence',
  5: 'Resolution',
  6: 'Light',
  7: 'Lucid',
}

function dreamScore(entry: DreamEntry): number | null {
  if (!entry.dreamed) return null
  if (entry.lucid === 'yes') return 7
  if (entry.quality) return QUALITY_MAP[entry.quality] ?? 0
  return 1 // fragments
}

const labelStyle = {
  fontSize: '8px',
  color: 'rgba(var(--sg-text-rgb), 0.40)',
  fontFamily: '"DM Mono", monospace',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
  fontWeight: 500,
}

export default function DreamPage() {
  const [dreams, setDreams] = useState<DreamEntry[]>([])
  const [entries, setEntries] = useState<{ date_key: string; closing_word: string; coherence_score: number | null }[]>([])
  const [pattern, setPattern] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: dreamData } = await supabase
        .from('dream_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: true })
        .limit(90)

      if (dreamData) setDreams(dreamData as DreamEntry[])

      const { data: entryData } = await supabase
        .from('entries')
        .select('date_key, closing_word, coherence_score')
        .eq('user_id', user.id)
        .order('date_key', { ascending: false })
        .limit(90)

      if (entryData) setEntries(entryData)
    }
    load()
  }, [])

  // Fetch pattern when enough data
  const fetchPattern = useCallback(async () => {
    const points = dreams
      .filter((d) => d.dreamed && d.waking_coherence != null)
      .map((d) => [d.waking_coherence, dreamScore(d)])
      .filter((p) => p[1] != null)

    if (points.length < 7) return

    try {
      const res = await fetch('/api/dream-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataPoints: points }),
      })
      const data = await res.json()
      if (data.pattern) setPattern(data.pattern)
    } catch {
      // skip
    }
  }, [dreams])

  useEffect(() => {
    if (dreams.length >= 7) fetchPattern()
  }, [dreams.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Draw phase portrait
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    // Background
    ctx.fillStyle = 'rgba(var(--sg-text-rgb), 0.015)'
    ctx.fillRect(0, 0, w, h)

    const pad = 40
    const pw = w - pad * 2
    const ph = h - pad * 2

    // Axis labels
    ctx.font = '9px "DM Mono", monospace'
    ctx.fillStyle = 'rgba(var(--sg-text-rgb), 0.2)'
    ctx.textAlign = 'center'
    ctx.fillText('waking coherence', w / 2, h - 8)
    ctx.save()
    ctx.translate(10, h / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('dream state', 0, 0)
    ctx.restore()

    // Plot points
    const plotPoints = dreams
      .filter((d) => d.dreamed)
      .map((d) => {
        const score = dreamScore(d)
        if (score == null || d.waking_coherence == null) return null
        return {
          x: pad + (d.waking_coherence / 100) * pw,
          y: h - pad - (score / 7) * ph,
          lucid: d.lucid,
        }
      })
      .filter(Boolean) as { x: number; y: number; lucid: string | null }[]

    // Connect with line
    if (plotPoints.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(201, 169, 110, 0.12)'
      ctx.lineWidth = 1
      ctx.moveTo(plotPoints[0].x, plotPoints[0].y)
      for (let i = 1; i < plotPoints.length; i++) {
        ctx.lineTo(plotPoints[i].x, plotPoints[i].y)
      }
      ctx.stroke()
    }

    // Draw dots
    for (const p of plotPoints) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2)
      if (p.lucid === 'yes') {
        ctx.fillStyle = '#c9a96e'
      } else if (p.lucid === 'partial') {
        ctx.fillStyle = 'rgba(253, 250, 242, 0.85)'
      } else {
        ctx.fillStyle = 'rgba(var(--sg-text-rgb), 0.25)'
      }
      ctx.fill()
    }
  }, [dreams])

  // Build correlation table (last 14)
  const correlationRows = dreams
    .slice(-14)
    .map((d) => {
      const prevEntry = entries.find((e) => e.date_key === d.entry_date) ||
        entries.find((e) => {
          const prev = new Date(d.entry_date)
          prev.setDate(prev.getDate() - 1)
          return e.date_key === prev.toISOString().slice(0, 10)
        })
      return {
        date: d.entry_date,
        closingWord: prevEntry?.closing_word || '',
        quality: d.quality || (d.dreamed === false ? 'none' : 'fragments'),
        lucid: d.lucid,
      }
    })
    .reverse()

  return (
    <>
      <Nav />
      <div className="max-w-[820px] mx-auto px-4 pb-24 md:pb-8 pt-4">
        <div className="text-center mb-10">
          <h1 className="font-display text-[28px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.78)' }}>
            The Phase Portrait
          </h1>
          <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.36)' }}>
            Waking coherence plotted against dream state. If a shape emerges, the oscillators are coupled.
          </p>
        </div>

        {/* SECTION 1 — PHASE PORTRAIT */}
        <section className="mb-12">
          <canvas
            ref={canvasRef}
            className="w-full rounded-[12px]"
            style={{
              height: 320,
              border: '1px solid rgba(var(--sg-text-rgb), 0.06)',
              background: 'rgba(var(--sg-text-rgb), 0.015)',
            }}
          />
          <p className="font-display italic text-[11px] mt-4 leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.28)' }}>
            Lissajous patterns emerge when two oscillators are coupled at simple frequency ratios.
            A circle or ellipse suggests 1:1 coupling. A figure-eight suggests 2:1. No pattern suggests independence.
          </p>
          {dreams.length === 0 && (
            <p className="text-center font-display italic text-[14px] mt-8" style={{ color: 'rgba(var(--sg-text-rgb), 0.22)' }}>
              No dream entries yet. Begin recording from the Thread page.
            </p>
          )}
        </section>

        {/* SECTION 2 — PATTERN DETECTION */}
        {pattern && (
          <section className="mb-12 animate-slideUp">
            <div style={labelStyle} className="mb-2">PATTERN DETECTION</div>
            <p className="font-display italic text-[14px] leading-relaxed" style={{ color: 'rgba(201, 169, 110, 0.6)' }}>
              {pattern}
            </p>
          </section>
        )}

        {dreams.length >= 7 && !pattern && (
          <section className="mb-12">
            <div style={labelStyle} className="mb-2">PATTERN DETECTION</div>
            <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.22)' }}>
              Reading the oscillators…
            </p>
          </section>
        )}

        {dreams.length > 0 && dreams.length < 7 && (
          <section className="mb-12">
            <div style={labelStyle} className="mb-2">PATTERN DETECTION</div>
            <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.22)' }}>
              {7 - dreams.length} more data points needed before pattern analysis.
            </p>
          </section>
        )}

        {/* SECTION 3 — CLOSING WORD CORRELATION */}
        {correlationRows.length > 0 && (
          <section className="mb-12">
            <div className="mb-4">
              <div style={labelStyle} className="mb-1">THE CLOSING WORD AS INSTRUCTION</div>
              <p className="font-body text-[11px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.30)' }}>
                Does what you carry out of the day shape what the night returns?
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Date', 'Closing Word', 'Dream Quality', 'Lucid?'].map((h) => (
                      <th
                        key={h}
                        className="font-mono text-[9px] uppercase tracking-wider pb-2 pr-3"
                        style={{ color: 'rgba(var(--sg-text-rgb), 0.25)', borderBottom: '1px solid rgba(var(--sg-text-rgb), 0.06)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationRows.map((row) => {
                    const isLucid = row.lucid === 'yes'
                    return (
                      <tr key={row.date}>
                        <td
                          className="font-mono text-[10px] py-1.5 pr-3"
                          style={{ color: 'rgba(var(--sg-text-rgb), 0.35)', borderBottom: '1px solid rgba(var(--sg-text-rgb), 0.03)' }}
                        >
                          {row.date}
                        </td>
                        <td
                          className="font-display italic text-[13px] py-1.5 pr-3"
                          style={{
                            color: isLucid ? '#c9a96e' : 'rgba(var(--sg-text-rgb), 0.5)',
                            borderBottom: '1px solid rgba(var(--sg-text-rgb), 0.03)',
                          }}
                        >
                          {row.closingWord || '—'}
                        </td>
                        <td
                          className="font-body text-[11px] py-1.5 pr-3"
                          style={{ color: 'rgba(var(--sg-text-rgb), 0.4)', borderBottom: '1px solid rgba(var(--sg-text-rgb), 0.03)' }}
                        >
                          {row.quality}
                        </td>
                        <td
                          className="font-mono text-[10px] py-1.5"
                          style={{
                            color: isLucid ? '#c9a96e' : 'rgba(var(--sg-text-rgb), 0.3)',
                            borderBottom: '1px solid rgba(var(--sg-text-rgb), 0.03)',
                          }}
                        >
                          {row.lucid || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="font-display italic text-[11px] mt-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.22)' }}>
              The hypothesis: the closing word is not a summary. It is an instruction to the integrating brain.
            </p>
          </section>
        )}

        {/* Footer semicolon */}
        <div className="text-center py-8">
          <span className="font-display text-[32px] text-sg-gold animate-breathe inline-block">;</span>
        </div>
      </div>
    </>
  )
}
