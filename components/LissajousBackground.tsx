'use client'

import { useEffect, useRef } from 'react'

export default function LissajousBackground({ visible }: { visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    let t = 0
    const A = 3
    const B = 2
    const delta = Math.PI / 4

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(201, 169, 110, 0.05)'
      ctx.lineWidth = 1.2
      ctx.beginPath()

      for (let i = 0; i <= 600; i++) {
        const angle = (i / 600) * Math.PI * 2 + t * 0.003
        const x = w / 2 + (w * 0.35) * Math.sin(A * angle + delta)
        const y = h / 2 + (h * 0.35) * Math.sin(B * angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      ctx.stroke()
      t++
      frameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000"
      style={{ opacity: visible ? 1 : 0 }}
    />
  )
}
