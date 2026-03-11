'use client'

import { useEffect, useRef } from 'react'
import { radius } from '@/lib/theme'

export default function DaySignalImage({
  passage,
  closingWord,
}: {
  passage: string
  closingWord: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !passage) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const cc = [...passage].map((c) => c.charCodeAt(0))

    ctx.fillStyle = 'rgb(248, 242, 225)'
    ctx.fillRect(0, 0, w, h)

    const lineCount = Math.min(cc.length, 40)
    for (let i = 0; i < lineCount; i++) {
      const code = cc[i % cc.length]
      ctx.beginPath()
      ctx.strokeStyle = `rgba(201, 169, 110, ${0.08 + (code % 20) / 100})`
      ctx.lineWidth = 0.5 + (code % 3) * 0.3

      const startX = (code % w)
      const startY = (cc[(i + 1) % cc.length] % h)
      ctx.moveTo(startX, startY)

      for (let j = 1; j < 5; j++) {
        const ci = cc[(i + j) % cc.length]
        const cpx = startX + ((ci * 3) % w) - w / 2
        const cpy = startY + ((ci * 7) % h) - h / 2
        const ex = (ci * 11) % w
        const ey = (ci * 13) % h
        ctx.quadraticCurveTo(cpx, cpy, ex, ey)
      }
      ctx.stroke()
    }

    const words = passage.split(/\s+/).filter((w) => w.length > 3).slice(0, 8)
    ctx.font = '9px "DM Mono", monospace'
    words.forEach((word, i) => {
      const code = [...word].reduce((a, c) => a + c.charCodeAt(0), 0)
      const x = 30 + (code % (w - 60))
      const y = 30 + ((code * 7) % (h - 60))
      ctx.fillStyle = 'rgba(38, 32, 22, 0.15)'
      ctx.fillText(word, x, y)

      ctx.beginPath()
      ctx.arc(x - 4, y - 3, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(201, 169, 110, ${0.2 + (i * 0.05)})`
      ctx.fill()
    })

    if (closingWord) {
      ctx.font = '28px "Instrument Serif", Georgia, serif'
      ctx.fillStyle = 'rgba(201, 169, 110, 0.06)'
      ctx.textAlign = 'center'
      ctx.fillText(closingWord, w / 2, h / 2 + 10)
      ctx.textAlign = 'start'
    }
  }, [passage, closingWord])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={260}
      aria-label="Generative signal image derived from your passage"
      style={{
        width: '100%',
        borderRadius: radius.lg,
        border: `1px solid rgba(var(--sg-text-rgb), 0.04)`,
        display: 'block',
      }}
    />
  )
}
