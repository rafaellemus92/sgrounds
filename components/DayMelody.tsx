'use client'

import { useState, useRef } from 'react'
import { color, font, fontSize, radius, transition } from '@/lib/theme'

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]

export default function DayMelody({ passage }: { passage: string }) {
  const [playing, setPlaying] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)

  function play() {
    if (playing) return
    setPlaying(true)
    const cc = [...passage].map((c) => c.charCodeAt(0))

    const audioCtx = new AudioContext()
    ctxRef.current = audioCtx
    const noteCount = Math.min(cc.length, 16)
    const noteDuration = 0.25

    for (let i = 0; i < noteCount; i++) {
      const freq = PENTATONIC[cc[i] % PENTATONIC.length]
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.value = 0.08
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (i + 1) * noteDuration)

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.start(audioCtx.currentTime + i * noteDuration)
      osc.stop(audioCtx.currentTime + (i + 1) * noteDuration)
    }

    setTimeout(() => {
      setPlaying(false)
      audioCtx.close()
    }, noteCount * noteDuration * 1000 + 200)
  }

  return (
    <button
      onClick={play}
      disabled={playing || !passage}
      aria-label={playing ? 'Playing melody' : 'Play day melody'}
      style={{
        width: '100%',
        padding: '8px 0',
        borderRadius: radius.lg,
        fontFamily: font.mono,
        fontSize: fontSize.sm,
        letterSpacing: '0.04em',
        background: playing ? color.gold08 : color.surface03,
        border: `1px solid ${color.border06}`,
        color: playing ? color.gold70 : color.text34,
        cursor: playing || !passage ? 'default' : 'pointer',
        transition: `all ${transition.normal}`,
      }}
    >
      {playing ? 'playing melody\u2026' : '\u25B6 play day melody'}
    </button>
  )
}
