'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { color, font, fontSize, radius, transition, space } from '@/lib/theme'

const VIEW = 600
const R = 70
const CENTER_MIN = 190
const CENTER_MAX = 410
const EPS = 3

type Pt = { x: number; y: number }

// Seven petals, first is the seed itself.
const PALETTE = [
  '#c9a96e', // I — the seed
  '#b97a63', // II
  '#7f9b7c', // III
  '#6c8ba6', // IV
  '#a97ba0', // V
  '#c7b06a', // VI
  '#8b7ea3', // VII
]

const STEP_COPY = [
  'Draw one circle.',
  'Choose one point on the circumference. Draw a second equal circle centered there.',
  'Select one intersection. Draw the third circle there.',
  'Repeat.',
  'Repeat.',
  'Repeat.',
  'Repeat.',
]

function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

// Intersections of two equal-radius circles.
function intersections(c1: Pt, c2: Pt, r: number): Pt[] {
  const d = dist(c1, c2)
  if (d === 0 || d > 2 * r) return []
  const mx = (c1.x + c2.x) / 2
  const my = (c1.y + c2.y) / 2
  const h = Math.sqrt(Math.max(0, r * r - (d / 2) * (d / 2)))
  const ux = (c2.x - c1.x) / d
  const uy = (c2.y - c1.y) / d
  const px = -uy
  const py = ux
  return [
    { x: mx + h * px, y: my + h * py },
    { x: mx - h * px, y: my - h * py },
  ]
}

export default function EG001Page() {
  const [circles, setCircles] = useState<Pt[]>([])
  const [phase, setPhase] = useState<'construct' | 'observe' | 'color'>('construct')
  const [canColor, setCanColor] = useState(false)
  const [colored, setColored] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const toSvgPoint = useCallback((e: React.MouseEvent): Pt => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEW,
      y: ((e.clientY - rect.top) / rect.height) * VIEW,
    }
  }, [])

  const candidates: Pt[] =
    circles.length >= 2 && circles.length < 7
      ? intersections(circles[circles.length - 2], circles[circles.length - 1], R).filter(
          (p) => !circles.some((c) => dist(c, p) < EPS)
        )
      : []

  function handleCanvasClick(e: React.MouseEvent) {
    if (phase !== 'construct' || circles.length >= 7) return
    if (circles.length >= 2) return // steps 3–7 require clicking a marked intersection

    const p = toSvgPoint(e)

    if (circles.length === 0) {
      setCircles([{ x: clamp(p.x, CENTER_MIN, CENTER_MAX), y: clamp(p.y, CENTER_MIN, CENTER_MAX) }])
      return
    }

    // circles.length === 1 — choose a point on the first circle's circumference
    const c0 = circles[0]
    const angle = Math.atan2(p.y - c0.y, p.x - c0.x)
    setCircles([...circles, { x: c0.x + R * Math.cos(angle), y: c0.y + R * Math.sin(angle) }])
  }

  function chooseCandidate(p: Pt) {
    const next = [...circles, p]
    setCircles(next)
    if (next.length === 7) {
      setTimeout(() => setPhase('observe'), 700)
      setTimeout(() => setCanColor(true), 4200)
    }
  }

  function reset() {
    setCircles([])
    setPhase('construct')
    setCanColor(false)
    setColored(false)
  }

  const stepIndex = Math.min(circles.length, STEP_COPY.length - 1)

  return (
    <div className="min-h-screen" style={{ background: 'var(--sg-bg)' }}>
      <Nav />
      <div className="max-w-[480px] mx-auto px-4 pb-24 md:pb-8 pt-4">
        <div className="text-center mb-2">
          <Link href="/map" style={{ fontFamily: font.mono, fontSize: fontSize.xs, color: color.text30, textDecoration: 'none' }}>
            ← the map
          </Link>
        </div>

        <div className="text-center mb-8">
          <p style={{ fontFamily: font.mono, fontSize: fontSize.xs, letterSpacing: '0.15em', color: color.gold70, textTransform: 'uppercase' }}>
            EG-001
          </p>
          <h1 className="font-display" style={{ fontSize: fontSize['5xl'], color: color.text85 }}>
            Seven Circles
          </h1>
          <p className="font-body mt-2" style={{ fontSize: fontSize.md, color: color.text38 }}>
            One circle. Then another, centered where the first is touched.
            Then the intersections, one after another, until seven.
          </p>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          onClick={handleCanvasClick}
          className="w-full"
          style={{
            aspectRatio: '1 / 1',
            borderRadius: radius.lg,
            background: color.surface03,
            border: `1px solid ${color.border08}`,
            cursor: phase === 'construct' && circles.length < 2 ? 'crosshair' : 'default',
          }}
        >
          {circles.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={R}
              fill={phase === 'color' ? PALETTE[i] : 'none'}
              fillOpacity={phase === 'color' ? 0.4 : 0}
              stroke={phase === 'color' ? PALETTE[i] : color.gold70}
              strokeOpacity={phase === 'color' ? 0.85 : 0.55}
              strokeWidth={1.25}
              style={{
                mixBlendMode: phase === 'color' ? 'multiply' : 'normal',
                transition: `fill-opacity ${transition.slow}, stroke ${transition.slow}`,
              }}
            />
          ))}

          {phase === 'construct' &&
            candidates.map((p, i) => (
              <g key={i} onClick={(e) => { e.stopPropagation(); chooseCandidate(p) }} style={{ cursor: 'pointer' }}>
                <circle cx={p.x} cy={p.y} r={14} fill={color.gold12} />
                <circle cx={p.x} cy={p.y} r={4} fill="var(--sg-gold)" />
              </g>
            ))}
        </svg>

        <div className="text-center mt-6" style={{ minHeight: '64px' }}>
          {phase === 'construct' && (
            <>
              <p className="font-display italic" style={{ fontSize: fontSize['3xl'], color: color.text75 }}>
                {STEP_COPY[stepIndex]}
              </p>
              <p className="font-mono mt-2" style={{ fontSize: fontSize.xs, color: color.text25, letterSpacing: '0.1em' }}>
                {circles.length} / 7
              </p>
            </>
          )}

          {phase === 'observe' && (
            <p
              className="font-display italic animate-breathe inline-block"
              style={{ fontSize: fontSize['4xl'], color: color.text75 }}
            >
              Observe.
            </p>
          )}

          {phase === 'color' && (
            <p className="font-display italic" style={{ fontSize: fontSize['4xl'], color: color.gold85 }}>
              Only then color.
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 mt-6">
          {phase === 'observe' && canColor && (
            <button
              onClick={() => setPhase('color')}
              className="font-body"
              style={{
                padding: '10px 24px',
                borderRadius: radius.pill,
                background: color.gold12,
                border: `1.5px solid ${color.gold38}`,
                color: color.gold90,
                fontSize: fontSize.lg,
                cursor: 'pointer',
                transition: `all ${transition.normal}`,
              }}
            >
              Color →
            </button>
          )}

          {circles.length > 0 && (
            <button
              onClick={reset}
              className="font-body"
              style={{
                padding: '6px 16px',
                borderRadius: radius.pill,
                background: 'transparent',
                border: `1px solid ${color.border08}`,
                color: color.text30,
                fontSize: fontSize.base,
                cursor: 'pointer',
              }}
            >
              Begin again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
