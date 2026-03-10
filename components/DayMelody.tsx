'use client'

import { useState, useRef } from 'react'

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
      className="w-full py-2 rounded-[12px] font-mono text-[10px] tracking-wide transition-all"
      style={{
        background: playing ? 'rgba(201, 169, 110, 0.1)' : 'rgba(var(--sg-text-rgb), 0.025)',
        border: '1px solid rgba(var(--sg-text-rgb), 0.06)',
        color: playing ? 'rgba(201, 169, 110, 0.7)' : 'rgba(var(--sg-text-rgb), 0.35)',
      }}
    >
      {playing ? 'playing melody…' : '▶ play day melody'}
    </button>
  )
}
