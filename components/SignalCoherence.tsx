'use client'

import { Coherence } from '@/lib/types'
import { coherenceDescriptor } from '@/lib/utils'
import { color, font, fontSize, radius, space } from '@/lib/theme'
import SectionLabel from './ui/SectionLabel'

const LABELS = [
  { key: 'momentClarity', label: 'moment clarity' },
  { key: 'arcContinuity', label: 'arc continuity' },
  { key: 'imageResonance', label: 'image resonance' },
  { key: 'echoFit', label: 'echo fit' },
  { key: 'emotionalUnity', label: 'emotional unity' },
] as const

export default function SignalCoherence({ coherence }: { coherence: Coherence }) {
  const overall = Math.round(
    (coherence.momentClarity +
      coherence.arcContinuity +
      coherence.imageResonance +
      coherence.echoFit +
      coherence.emotionalUnity) /
      5
  )

  const attunementGap = coherence.momentClarity - coherence.emotionalUnity

  const gapDisplay = attunementGap > 5
    ? { text: `named before felt  \u2191${attunementGap}`, sub: 'air conduction' }
    : attunementGap < -5
    ? { text: `felt before named  \u2193${Math.abs(attunementGap)}`, sub: 'bone conduction' }
    : { text: 'arrived together', sub: 'both channels' }

  return (
    <section className="animate-slideUp">
      <SectionLabel
        label="Signal Coherence"
        helper="Higher does not mean better. It means clearer."
      />

      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: space[2],
        marginBottom: space[5],
      }}>
        <span style={{
          fontFamily: font.mono,
          fontSize: fontSize['4xl'],
          fontWeight: 500,
          color: color.text75,
          lineHeight: '1',
        }}>
          {overall}%
        </span>
        <span style={{
          fontFamily: font.mono,
          fontSize: fontSize.base,
          color: color.text34,
        }}>
          {coherenceDescriptor(overall)}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
        {LABELS.map(({ key, label }) => {
          const val = coherence[key]
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: space[3] }}>
              <span style={{
                fontFamily: font.mono,
                fontSize: fontSize.xs,
                color: color.text30,
                width: '100px',
                flexShrink: 0,
              }}>
                {label}
              </span>
              <div style={{
                flex: 1,
                height: '3px',
                borderRadius: radius.pill,
                overflow: 'hidden',
                background: color.surface05,
              }}>
                <div style={{
                  height: '100%',
                  borderRadius: radius.pill,
                  width: `${val}%`,
                  background: `rgba(201, 169, 110, ${0.3 + (val / 100) * 0.5})`,
                  transition: 'width 700ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                }} />
              </div>
              <span style={{
                fontFamily: font.mono,
                fontSize: fontSize.xs,
                color: color.text30,
                width: '28px',
                textAlign: 'right',
              }}>
                {val}
              </span>
            </div>
          )
        })}

        {/* Conduction route (attunement gap) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: space[3],
          marginTop: space[2],
          paddingTop: space[2],
          borderTop: '1px solid rgba(var(--sg-text-rgb), 0.05)',
        }}>
          <span style={{
            fontFamily: font.mono,
            fontSize: fontSize.xs,
            color: color.text30,
            width: '100px',
            flexShrink: 0,
          }}>
            conduction route
          </span>
          <span style={{
            fontFamily: font.mono,
            fontSize: fontSize.xs,
            color: color.gold70,
            flex: 1,
          }}>
            {gapDisplay.text}
          </span>
          <span style={{
            fontFamily: font.mono,
            fontSize: fontSize.xs,
            color: color.text25,
          }}>
            {gapDisplay.sub}
          </span>
        </div>
      </div>
    </section>
  )
}
