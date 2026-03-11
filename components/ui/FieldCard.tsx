'use client'

import { color, radius, border as borderTokens, transition } from '@/lib/theme'

interface FieldCardProps {
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}

export default function FieldCard({ children, onClick, style }: FieldCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
      style={{
        background: color.surface03,
        border: borderTokens.medium,
        borderRadius: radius.lg,
        overflow: 'hidden',
        transition: `all ${transition.normal}`,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
