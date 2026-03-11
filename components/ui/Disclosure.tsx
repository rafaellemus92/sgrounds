'use client'

import { useState, useRef, useEffect } from 'react'
import { eyebrowStyle, color, transition } from '@/lib/theme'

interface DisclosureProps {
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function Disclosure({ label, children, defaultOpen = false }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? contentRef.current.scrollHeight : 0)
    }
  }, [open])

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          ...eyebrowStyle,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          marginBottom: open ? '8px' : '0',
          transition: `margin ${transition.normal}`,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: `transform ${transition.normal}`,
            fontSize: '8px',
            color: color.text25,
          }}
        >
          ▸
        </span>
        {label}
      </button>
      <div
        ref={contentRef}
        style={{
          height: height !== undefined ? `${height}px` : 'auto',
          overflow: 'hidden',
          transition: `height ${transition.slow}, opacity ${transition.slow}`,
          opacity: open ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  )
}
