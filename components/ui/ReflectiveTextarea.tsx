'use client'

import { useRef, useEffect, useCallback } from 'react'
import { color, radius, font, fontSize as fontSizes, transition, inputStyle as baseInputStyle } from '@/lib/theme'

interface ReflectiveTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  fontSize?: number | string
  fontFamily?: 'display' | 'body'
  italic?: boolean
  minHeight?: number
  autoResize?: boolean
  ariaLabel?: string
}

export default function ReflectiveTextarea({
  value,
  onChange,
  placeholder,
  maxLength,
  fontSize: customFontSize,
  fontFamily = 'body',
  italic,
  minHeight = 100,
  autoResize = true,
  ariaLabel,
}: ReflectiveTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    if (!autoResize || !ref.current) return
    ref.current.style.height = 'auto'
    ref.current.style.height = `${Math.max(minHeight, ref.current.scrollHeight)}px`
  }, [autoResize, minHeight])

  useEffect(() => {
    resize()
  }, [value, resize])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        if (maxLength && e.target.value.length > maxLength) return
        onChange(e.target.value)
      }}
      placeholder={placeholder}
      aria-label={ariaLabel || placeholder}
      className="sg-textarea"
      style={{
        ...baseInputStyle,
        width: '100%',
        borderRadius: radius.md,
        padding: '10px 13px',
        fontFamily: fontFamily === 'display' ? font.display : font.body,
        fontSize: customFontSize || fontSizes.md,
        fontStyle: italic ? 'italic' : 'normal',
        minHeight,
        resize: 'none',
        outline: 'none',
        transition: `all ${transition.normal}`,
        lineHeight: '1.6',
        display: 'block',
      }}
    />
  )
}
