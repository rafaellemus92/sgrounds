'use client'

import { useState } from 'react'
import { Coherence } from '@/lib/types'
import { coherenceDescriptor } from '@/lib/utils'

const LABELS: { key: keyof Coherence; label: string; guidance: string }[] = [
  {
    key: 'momentClarity',
    label: 'moment clarity',
    guidance: 'How precisely have you named what happened? A single specific event scores higher than a vague feeling. Try: I [verb] when [moment]. The math reads sentence density.',
  },
  {
    key: 'arcContinuity',
    label: 'arc continuity',
    guidance: 'Does THE AND field connect today to a larger pattern? Name the specific arc \u2014 not I felt tired but the arc of building trust with a new team. What recurring theme does today belong to?',
  },
  {
    key: 'imageResonance',
    label: 'image resonance',
    guidance: 'An image creates a visual anchor. Ask: what would I photograph from today? If you have not uploaded one, the signal is still open.',
  },
  {
    key: 'echoFit',
    label: 'echo fit',
    guidance: 'How specifically does your echo connect to the passage? The more the echo could only be from this day, the higher the signal.',
  },
  {
    key: 'emotionalUnity',
    label: 'emotional unity',
    guidance: 'The closing word is the day\u2019s final calibration. One word that holds the whole. If you have not chosen one, the signal is still open.',
  },
]

export default function SignalCoherence({ coherence }: { coherence: Coherence }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const overall = Math.round(
    (coherence.momentClarity +
      coherence.arcContinuity +
      coherence.imageResonance +
      coherence.echoFit +
      coherence.emotionalUnity) /
      5
  )

  return (
    <div className="animate-slideUp">
      <div className="flex items-center justify-between mb-1">
        <span
          className="font-mono text-[8px] uppercase tracking-[0.15em]"
          style={{ color: 'rgba(var(--sg-text-rgb), 0.48)' }}
        >
          Signal Coherence
        </span>
      </div>
      <p className="font-body text-[10px] mb-3" style={{ color: 'rgba(var(--sg-text-rgb), 0.42)' }}>
        Higher does not mean better. It means clearer.
      </p>

      <div className="flex items-baseline gap-2 mb-4 group/coh relative">
        <span className="font-mono text-[28px] font-medium cursor-default" style={{ color: 'rgba(var(--sg-text-rgb), 0.7)' }}>
          {overall}%
        </span>
        <span className="font-mono text-[11px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.45)' }}>
          {coherenceDescriptor(overall)}
        </span>
        <div
          className="absolute left-0 top-full mt-1 w-[260px] rounded-[9px] px-3 py-2.5 opacity-0 group-hover/coh:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
          style={{
            background: 'rgba(9, 9, 10, 0.95)',
            border: '1px solid rgba(201, 169, 110, 0.15)',
          }}
        >
          <p className="font-body text-[10px] leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>
            Coherence is not optimized. It is recognized. Like cardiorespiratory coupling — the signal was always there. This just names its shape.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {LABELS.map(({ key, label, guidance }) => {
          const val = coherence[key]
          const isExpanded = expanded === key
          return (
            <div key={key}>
              <button
                className="w-full flex items-center gap-3 group"
                onClick={() => setExpanded(isExpanded ? null : key)}
              >
                <span
                  className="font-mono text-[9px] w-[100px] shrink-0 text-left transition-colors"
                  style={{ color: isExpanded ? 'rgba(201, 169, 110, 0.6)' : 'rgba(var(--sg-text-rgb), 0.3)' }}
                >
                  {label}
                </span>
                <div
                  className="flex-1 h-[3px] rounded-full overflow-hidden"
                  style={{ background: 'rgba(var(--sg-text-rgb), 0.05)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${val}%`,
                      background: `rgba(201, 169, 110, ${0.3 + (val / 100) * 0.5})`,
                    }}
                  />
                </div>
                <span
                  className="font-mono text-[9px] w-[24px] text-right"
                  style={{ color: 'rgba(var(--sg-text-rgb), 0.42)' }}
                >
                  {val}
                </span>
              </button>
              {isExpanded && (
                <div className="ml-[100px] pl-3 mt-1 mb-2 animate-slideUp">
                  <p className="font-body text-[10px] leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.45)' }}>
                    {guidance}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="font-display italic text-[10px] mt-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.35)' }}>
        Signal Coherence is not a grade. It is a mirror.
      </p>
    </div>
  )
}
