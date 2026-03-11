'use client'

import { useRef } from 'react'
import { color, radius, border as borderTokens, fontSize, font, transition } from '@/lib/theme'

interface ImageFrameProps {
  src: string | null
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  alt?: string
}

export default function ImageFrame({ src, onUpload, alt = 'day moment' }: ImageFrameProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <div
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={src ? 'Change image' : 'Upload image'}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click() } }}
        style={{
          background: color.surface03,
          border: borderTokens.medium,
          borderRadius: radius.lg,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: `all ${transition.normal}`,
          minHeight: src ? undefined : '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {src ? (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', overflow: 'hidden' }}>
            <img
              src={src}
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, transparent 70%, rgba(var(--sg-text-rgb), 0.04))',
                pointerEvents: 'none',
              }}
            />
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '32px 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color.text20} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            <span style={{
              fontFamily: font.body,
              fontSize: fontSize.base,
              color: color.text20,
              letterSpacing: '0.02em',
            }}>
              the frame you would keep
            </span>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onUpload}
        aria-label="Upload image"
      />
    </>
  )
}
