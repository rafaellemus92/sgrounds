'use client'

import { color, radius, font, fontSize, transition } from '@/lib/theme'

interface RitualButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  loadingText?: string
  style?: React.CSSProperties
}

export default function RitualButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
  loading,
  loadingText,
  style: customStyle,
}: RitualButtonProps) {
  const isDisabled = disabled || loading

  const base: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: radius.xl,
    fontFamily: font.body,
    fontSize: fontSize.lg,
    letterSpacing: '0.02em',
    transition: `all ${transition.normal}`,
    cursor: isDisabled ? 'default' : 'pointer',
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: isDisabled ? color.gold08 : color.gold22,
      border: `1.5px solid ${isDisabled ? color.gold22 : color.gold38}`,
      color: isDisabled ? color.gold50 : color.gold90,
    },
    secondary: {
      background: color.surface03,
      border: `1px solid ${color.border08}`,
      color: color.text38,
    },
    ghost: {
      background: 'transparent',
      border: `1px solid ${color.border06}`,
      color: color.text30,
    },
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{ ...base, ...variants[variant], ...customStyle }}
      aria-busy={loading}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span className="sg-loading-dots" aria-hidden="true" />
          {loadingText || children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
