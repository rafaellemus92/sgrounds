'use client'

import { useEffect, useRef, useCallback } from 'react'
import { color, font, fontSize, radius, shadow, transition, eyebrowStyle, space } from '@/lib/theme'

interface ReflectionModalProps {
  reflection: string
  weave: string | null
  onClose: () => void
}

function parseReflection(text: string) {
  const sections: { label: string; content: string }[] = []
  const labels = ['SIGNAL', 'READING', 'AND', 'TOMORROW']
  let remaining = text

  for (const label of labels) {
    const marker = `${label}::`
    const idx = remaining.indexOf(marker)
    if (idx !== -1) {
      const afterMarker = remaining.slice(idx + marker.length)
      const nextLabel = labels.find((l) => l !== label && afterMarker.indexOf(`${l}::`) !== -1)
      let content: string
      if (nextLabel) {
        const nextIdx = afterMarker.indexOf(`${nextLabel}::`)
        content = afterMarker.slice(0, nextIdx).trim()
        remaining = afterMarker.slice(nextIdx)
      } else {
        content = afterMarker.trim()
        remaining = ''
      }
      sections.push({ label, content })
    }
  }
  return sections
}

function parseWeave(text: string) {
  const sections: { label: string; content: string }[] = []
  const labels = ['THREAD', 'DRIFT', 'RHYME', 'UNSAID']
  let remaining = text

  for (const label of labels) {
    const marker = `${label}::`
    const idx = remaining.indexOf(marker)
    if (idx !== -1) {
      const afterMarker = remaining.slice(idx + marker.length)
      const nextLabel = labels.find((l) => l !== label && afterMarker.indexOf(`${l}::`) !== -1)
      let content: string
      if (nextLabel) {
        const nextIdx = afterMarker.indexOf(`${nextLabel}::`)
        content = afterMarker.slice(0, nextIdx).trim()
        remaining = afterMarker.slice(nextIdx)
      } else {
        content = afterMarker.trim()
        remaining = ''
      }
      sections.push({ label, content })
    }
  }
  return sections
}

const sectionStyles: Record<string, React.CSSProperties> = {
  SIGNAL: {
    fontFamily: font.mono,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: color.text38,
    lineHeight: '1.5',
  },
  READING: {
    fontFamily: font.display,
    fontSize: fontSize['2xl'],
    color: color.text75,
    lineHeight: '1.65',
    letterSpacing: '-0.01em',
  },
  AND: {
    fontFamily: font.body,
    fontSize: fontSize.lg,
    color: color.gold70,
    lineHeight: '1.6',
  },
  TOMORROW: {
    fontFamily: font.display,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: color.text38,
    lineHeight: '1.5',
  },
}

export default function ReflectionModal({ reflection, weave, onClose }: ReflectionModalProps) {
  const sections = parseReflection(reflection)
  const weaveSections = weave ? parseWeave(weave) : []
  const modalRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    modalRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prev
    }
  }, [handleKeyDown])

  return (
    <div
      ref={backdropRef}
      className="sg-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Lighthouse reading"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: space[6],
        background: 'rgba(var(--sg-text-rgb), 0.06)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="sg-modal-card"
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: radius.xl,
          padding: space[8],
          background: 'var(--sg-bg)',
          border: `1px solid ${color.border08}`,
          boxShadow: shadow.modal,
          outline: 'none',
        }}
      >
        {sections.map(({ label, content }) => (
          <div key={label} style={{ marginBottom: space[6] }}>
            {label !== 'SIGNAL' && (
              <div style={{
                ...eyebrowStyle,
                fontSize: fontSize['2xs'],
                color: color.gold50,
                marginBottom: space[1],
              }}>
                {label}
              </div>
            )}
            <p style={sectionStyles[label] || { color: color.text55 }}>
              {content}
            </p>
          </div>
        ))}

        {weaveSections.length > 0 && (
          <div style={{
            height: '1px',
            background: color.border06,
            margin: `${space[4]} 0`,
          }} />
        )}

        {weaveSections.length > 0 && (
          <details style={{ marginTop: space[4] }}>
            <summary
              style={{
                ...eyebrowStyle,
                fontSize: fontSize.xs,
                cursor: 'pointer',
                marginBottom: space[3],
                color: color.text30,
              }}
            >
              The Weave
            </summary>
            <div className="animate-slideUp" style={{ display: 'flex', flexDirection: 'column', gap: space[4] }}>
              {weaveSections.map(({ label, content }) => (
                <div key={label}>
                  <span style={{
                    ...eyebrowStyle,
                    fontSize: fontSize['2xs'],
                    color: color.gold50,
                  }}>
                    {label}
                  </span>
                  <p style={{
                    fontFamily: font.body,
                    fontSize: fontSize.md,
                    color: color.text55,
                    marginTop: space[1],
                    lineHeight: '1.6',
                  }}>
                    {content}
                  </p>
                </div>
              ))}
            </div>
          </details>
        )}

        <button
          onClick={onClose}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            fontFamily: font.mono,
            fontSize: fontSize.xs,
            color: color.text20,
            marginTop: space[6],
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: space[2],
            transition: `color ${transition.normal}`,
          }}
          aria-label="Close reading"
        >
          tap anywhere to close
        </button>
      </div>
    </div>
  )
}
