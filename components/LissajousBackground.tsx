'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

export default function LissajousBackground() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)
  const listenedRef = useRef(false)

  // Generate the Lissajous path (2:1 ratio — lemniscate)
  const pathD = useMemo(() => {
    const points: string[] = []
    const steps = 200
    const A = 0.28 // scale to ~60% of viewport
    const B = 0.28
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2
      const x = A * Math.sin(2 * t + Math.PI / 2)
      const y = B * Math.sin(t)
      // Center at 0.5, 0.5 in viewBox coords (0-1 range)
      const px = 0.5 + x
      const py = 0.5 + y
      points.push(`${i === 0 ? 'M' : 'L'}${px},${py}`)
    }
    return points.join(' ')
  }, [])

  // Compute approximate path length for stroke animation
  const pathLength = useMemo(() => {
    // For a 2:1 Lissajous with A=B=0.28, approximate perimeter
    return 2.2
  }, [])

  useEffect(() => {
    if (listenedRef.current) return
    listenedRef.current = true

    function handleKeydown() {
      setFading(true)
      setTimeout(() => setVisible(false), 2000)
      document.removeEventListener('keydown', handleKeydown)
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [])

  if (!visible) return null

  return (
    <svg
      viewBox="0 0 1 1"
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: fading ? 0 : 0.035,
        transition: 'opacity 2000ms ease',
      }}
    >
      <path
        d={pathD}
        fill="none"
        stroke="#c4a882"
        strokeWidth="0.003"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength}
        style={{
          animation: `lissajousDraw 12s linear infinite`,
        }}
      />
      <style>{`
        @keyframes lissajousDraw {
          0% { stroke-dashoffset: ${pathLength}; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -${pathLength}; }
        }
      `}</style>
    </svg>
  )
}
