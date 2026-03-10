'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDreamScore } from '@/lib/dreamUtils'
import Nav from '@/components/Nav'

interface DreamRow {
  entry_date: string
  dreamed: string
  lucid: string | null
  quality: string | null
  closing_image: string | null
  continuity: string | null
  waking_coherence: number | null
  waking_closing_word: string | null
}

interface DataPoint {
  date: string
  coherence: number
  quality: number
  lucid: boolean
  lucidPartial: boolean
  closingWord: string | null
}

const label = {
  fontSize: '8px',
  color: '#c9a96e',
  fontFamily: '"DM Mono", monospace',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
  fontWeight: 500,
}

const muted = {
  color: 'rgba(var(--sg-text-rgb), 0.35)',
}

export default function DreamPage() {
  const [data, setData] = useState<DataPoint[]>([])
  const [allRows, setAllRows] = useState<DreamRow[]>([])
  const [pattern, setPattern] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: rows } = await supabase
        .from('dream_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: true })
        .limit(90)

      if (!rows) { setLoading(false); return }
      setAllRows(rows)

      const points: DataPoint[] = []
      for (const r of rows) {
        if (r.dreamed === 'no') continue
        const score = getDreamScore(r.quality, r.lucid)
        if (score === null || r.waking_coherence === null) continue
        points.push({
          date: r.entry_date,
          coherence: r.waking_coherence,
          quality: score,
          lucid: r.lucid === 'yes',
          lucidPartial: r.lucid === 'partial',
          closingWord: r.waking_closing_word,
        })
      }
      setData(points)

      // Fetch pattern reading if 7+ entries
      if (points.length >= 7) {
        const last30 = points.slice(-30).map((p) => ({
          coherence: p.coherence,
          quality: p.quality,
          lucid: p.lucid,
          date: p.date,
        }))
        try {
          const res = await fetch('/api/dream-pattern', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataPoints: last30 }),
          })
          const d = await res.json()
          setPattern(d.pattern || null)
        } catch {
          // silent
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  // --- Phase Portrait SVG ---
  const svgW = 600
  const svgH = 360
  const pad = { t: 20, r: 20, b: 36, l: 36 }
  const plotW = svgW - pad.l - pad.r
  const plotH = svgH - pad.t - pad.b

  function sx(coherence: number) {
    return pad.l + (coherence / 100) * plotW
  }
  function sy(quality: number) {
    return pad.t + plotH - (quality / 7) * plotH
  }

  // --- Closing Word Correlation ---
  const paired = allRows
    .filter((r) => r.waking_closing_word)
    .slice(-14)
    .map((r) => {
      const score = getDreamScore(r.quality, r.lucid)
      return {
        date: r.entry_date,
        closingWord: r.waking_closing_word!,
        quality: r.quality || (r.dreamed === 'no' ? 'no dream' : r.dreamed),
        lucid: r.lucid === 'yes',
        score,
      }
    })

  if (loading) {
    return (
      <>
        <Nav />
        <div className="max-w-[520px] mx-auto px-4 pb-24 md:pb-8 pt-8 text-center">
          <p className="font-mono text-[11px] animate-breathe" style={muted}>loading dream data…</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="max-w-[520px] mx-auto px-4 pb-24 md:pb-8 pt-4">
        {/* Page header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-[28px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.78)' }}>
            The Phase Portrait
          </h1>
          <p className="font-mono text-[10px] mt-1" style={muted}>
            waking coherence × dream quality · last 90 days
          </p>
        </div>

        {/* SECTION A — Phase Portrait */}
        <div className="mb-10">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full"
            style={{ maxHeight: 360 }}
          >
            {/* Background */}
            <rect x={0} y={0} width={svgW} height={svgH} fill="var(--sg-bg)" rx={12} />

            {/* Axis lines */}
            <line
              x1={pad.l} y1={pad.t + plotH}
              x2={pad.l + plotW} y2={pad.t + plotH}
              stroke="rgba(var(--sg-text-rgb), 0.08)" strokeWidth={1}
            />
            <line
              x1={pad.l} y1={pad.t}
              x2={pad.l} y2={pad.t + plotH}
              stroke="rgba(var(--sg-text-rgb), 0.08)" strokeWidth={1}
            />

            {/* Axis labels */}
            <text
              x={pad.l + plotW / 2} y={svgH - 4}
              textAnchor="middle"
              fill="rgba(var(--sg-text-rgb), 0.3)"
              fontSize={10}
              fontFamily='"DM Mono", monospace'
            >
              coherence →
            </text>
            <text
              x={8} y={pad.t + plotH / 2}
              textAnchor="middle"
              fill="rgba(var(--sg-text-rgb), 0.3)"
              fontSize={10}
              fontFamily='"DM Mono", monospace'
              transform={`rotate(-90, 8, ${pad.t + plotH / 2})`}
            >
              depth ↑
            </text>

            {/* Connecting line */}
            {data.length > 1 && (
              <polyline
                points={data.map((d) => `${sx(d.coherence)},${sy(d.quality)}`).join(' ')}
                fill="none"
                stroke="rgba(201, 169, 110, 0.15)"
                strokeWidth={1}
              />
            )}

            {/* Data points */}
            {data.map((d, i) => (
              <circle
                key={i}
                cx={sx(d.coherence)}
                cy={sy(d.quality)}
                r={d.lucid ? 7 : 5}
                fill={
                  d.lucid
                    ? '#c9a96e'
                    : d.lucidPartial
                    ? 'rgba(201, 169, 110, 0.5)'
                    : 'rgba(var(--sg-text-rgb), 0.25)'
                }
                stroke={d.lucid ? 'rgba(201, 169, 110, 0.6)' : 'none'}
                strokeWidth={d.lucid ? 1.5 : 0}
              />
            ))}

            {/* Empty state */}
            {data.length === 0 && (
              <text
                x={svgW / 2} y={svgH / 2}
                textAnchor="middle"
                fill="rgba(var(--sg-text-rgb), 0.2)"
                fontSize={12}
                fontFamily='"DM Sans", sans-serif'
              >
                no paired data yet — record your first night
              </text>
            )}
          </svg>

          {/* Data count */}
          <div className="flex justify-between items-center mt-2">
            <p className="font-mono text-[10px]" style={muted}>
              n = {data.length} night{data.length !== 1 ? 's' : ''} recorded
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="inline-block w-[8px] h-[8px] rounded-full" style={{ background: '#c9a96e' }} />
                <span className="font-mono text-[8px]" style={muted}>lucid</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: 'rgba(var(--sg-text-rgb), 0.25)' }} />
                <span className="font-mono text-[8px]" style={muted}>normal</span>
              </span>
            </div>
          </div>

          {/* Lissajous note */}
          <p className="font-display italic text-[11px] mt-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>
            Lissajous patterns emerge when two oscillators couple at simple
            frequency ratios. Circle = 1:1. Figure-eight = 2:1. Trefoil = 3:2.
            No pattern = independence. Minimum 30 nights for interpretation.
          </p>
        </div>

        {/* SECTION B — Pattern Reading */}
        {pattern && (
          <div className="mb-10">
            <div style={label} className="mb-2">PATTERN READING</div>
            <p className="font-display italic text-[16px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.75)' }}>
              {pattern}
            </p>
          </div>
        )}

        {/* SECTION C — Closing Word Correlation */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="font-display text-[22px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.72)' }}>
              The Closing Word as Instruction
            </h2>
            <p className="font-mono text-[10px] mt-1" style={muted}>
              Does what you carry out of the day shape what the night returns?
            </p>
          </div>

          {paired.length > 0 ? (
            <div className="space-y-1.5">
              {paired.map((p, i) => {
                const isLucidPreceder = p.lucid
                const isVoid = p.quality === 'no dream' || p.quality === 'void'
                const wordColor = isLucidPreceder
                  ? '#c9a96e'
                  : isVoid
                  ? 'rgba(var(--sg-text-rgb), 0.2)'
                  : 'rgba(var(--sg-text-rgb), 0.55)'

                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 font-body text-[12px]"
                    style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}
                  >
                    <span className="font-mono text-[10px] shrink-0 w-[72px]">{p.date}</span>
                    <span className="font-mono text-[10px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.2)' }}>·</span>
                    <span
                      className="font-display italic text-[14px] shrink-0"
                      style={{ color: wordColor, minWidth: 60 }}
                    >
                      {p.closingWord}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.15)' }}>→</span>
                    <span
                      className="px-[7px] py-[1px] rounded-full text-[9px] font-mono capitalize"
                      style={{
                        background: isLucidPreceder ? 'rgba(201, 169, 110, 0.1)' : 'rgba(var(--sg-text-rgb), 0.03)',
                        border: `1px solid ${isLucidPreceder ? 'rgba(201, 169, 110, 0.25)' : 'rgba(var(--sg-text-rgb), 0.06)'}`,
                        color: isLucidPreceder ? 'rgba(201, 169, 110, 0.75)' : 'rgba(var(--sg-text-rgb), 0.35)',
                      }}
                    >
                      {p.quality}
                    </span>
                    {p.lucid && (
                      <span className="font-mono text-[8px]" style={{ color: '#c9a96e' }}>lucid</span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="font-body text-[12px]" style={muted}>
              No paired closing-word data yet. Record entries with closing words, then log the following night.
            </p>
          )}

          <p className="font-display italic text-[11px] mt-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>
            Hypothesis: the closing word is not a summary. It is an instruction
            to the integrating brain. Falsification: if closing word valence
            predicts nothing across 90 days, the hypothesis fails.
          </p>
        </div>

        {/* Footer semicolon */}
        <div className="text-center py-8">
          <span className="font-display text-[32px] text-sg-gold animate-breathe inline-block">;</span>
        </div>
      </div>
    </>
  )
}
