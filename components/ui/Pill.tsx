'use client'

import { pillStyle } from '@/lib/theme'

interface PillProps {
  label: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}

export default function Pill({ label, selected, onClick, disabled }: PillProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...pillStyle(selected),
        ...(disabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
      }}
      aria-pressed={selected}
    >
      {label}
    </button>
  )
}
