'use client'

import { Coherence } from '@/lib/types'
import { coherenceDescriptor } from '@/lib/utils'

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
        {LABELS.map(({ key, label }) => {
          const val = coherence[key]
          return (
            <div key={key} className="flex items-center gap-3">
              <span
                className="font-mono text-[9px] w-[100px] shrink-0"
                style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
