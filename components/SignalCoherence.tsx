'use client'

import { useState } from 'react'
import { Coherence } from '@/lib/types'
import { coherenceDescriptor } from '@/lib/utils'

const LABELS: { key: keyof Coherence; label: string; guidance: string }[] = [
  {
    key: 'momentClarity',
    label: 'moment clarity',
    guidance: 'How precisely have you named what happened? A single, specific event scores higher than a vague feeling. Try: \u201CI [verb] when [moment].\u201D The math reads sentence density.',
  },
  {
    key: 'arcContinuity',
    label: 'arc continuity',
    guidance: 'Does THE AND field connect today to a larger pattern? The score rises when you name the specific arc \u2014 not \u201CI felt tired\u201D but \u201Cthe arc of building trust with a new team.\u201D What recurring theme does today belong to?',
  },
  {
    key: 'imageResonance',
    label: 'image resonance',
    guidance: 'An image uploaded creates a visual anchor. The score reflects whether the day has a frame \u2014 a single image that could hold it. If you haven\u2019t uploaded one, ask: what would I photograph from today?',
  },
  {
    key: 'echoFit',
    label: 'echo fit',
    guidance: 'How specifically does your echo (song, scripture, quote, poem) connect to the passage? Generic echoes score lower. The more the echo could only be from this day, the higher the signal.',
  },
  {
    key: 'emotionalUnity',
    label: 'emotional unity',
    guidance: 'The closing word is the day\u2019s final calibration. One word that holds the whole. If you haven\u2019t chosen one, the signal is still open. What single word names what you\u2019re carrying out of today?',
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
          style={{ color: 'rgba(var(--sg-text-rgb), 0.34)' }}
        >
          Signal Coherence
        </span>
      </div>
      <p className="font-body text-[10px] mb-3" style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>
        Higher does not mean better. It means clearer.
      </p>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-mono text-[28px] font-medium" style={{ color: 'rgba(var(--sg-text-rgb), 0.7)' }}>
          {overall}%
        </span>
        <span className="font-mono text-[11px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.35)' }}>
          {coherenceDescriptor(overall)}
        </span>
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
                  style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}
                >
                  {val}
                </span>
              </button>
              {isExpanded && (
                <div className="ml-[100px] pl-3 mt-1 mb-2 animate-slideUp">
                  <p className="font-body text-[10px] leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.35)' }}>
                    {guidance}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="font-display italic text-[10px] mt-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.2)' }}>
        Signal Coherence is not a grade. It is a mirror.
      </p>
    </div>
  )
}
