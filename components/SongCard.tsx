'use client'

import { useState, useRef } from 'react'
import { color, font, fontSize, radius, transition, inputStyle, space } from '@/lib/theme'

interface SongResult {
  trackName: string
  artistName: string
  previewUrl: string | null
  trackViewUrl: string
  artworkUrl100?: string
}

export default function SongCard({
  song,
  onSelect,
}: {
  song: SongResult | null
  onSelect?: (song: SongResult) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SongResult[]>([])
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  async function search(q: string) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=5`
      )
      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setResults([])
    }
  }

  function togglePlay() {
    if (!song?.previewUrl) return
    if (!audioRef.current) {
      audioRef.current = new Audio(song.previewUrl)
      audioRef.current.onended = () => setPlaying(false)
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  if (song) {
    return (
      <div
        className="animate-slideUp"
        style={{
          borderRadius: radius.lg,
          padding: space[3],
          background: color.surface03,
          border: `1px solid ${color.border06}`,
        }}
      >
        <div style={{ fontFamily: font.display, fontSize: '17px', color: color.text75 }}>
          {song.trackName}
        </div>
        <div style={{ fontFamily: font.body, fontSize: fontSize.base, color: color.gold70, marginTop: '2px' }}>
          {song.artistName}
        </div>
        {song.previewUrl && (
          <button
            onClick={togglePlay}
            style={{
              marginTop: space[2],
              fontFamily: font.mono,
              fontSize: fontSize.sm,
              padding: '4px 12px',
              borderRadius: radius.pill,
              background: playing ? color.gold15 : color.surface04,
              border: `1px solid ${color.border08}`,
              color: color.text45,
              cursor: 'pointer',
              transition: `all ${transition.normal}`,
            }}
          >
            {playing ? '\u25AE\u25AE pause' : '\u25B6 preview'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="search artist or song"
        className="sg-textarea"
        aria-label="Search for a song"
        style={{
          ...inputStyle,
          width: '100%',
          padding: '8px 13px',
          borderRadius: radius.md,
          fontFamily: font.body,
          fontSize: fontSize.md,
          outline: 'none',
          transition: `all ${transition.normal}`,
        }}
      />
      {results.length > 0 && (
        <div style={{
          marginTop: space[1],
          borderRadius: radius.md,
          overflow: 'hidden',
          border: `1px solid ${color.border08}`,
        }}>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => { onSelect?.(r); setResults([]); setQuery('') }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                fontFamily: font.body,
                fontSize: fontSize.base,
                background: 'transparent',
                border: 'none',
                borderBottom: i < results.length - 1 ? `1px solid ${color.surface04}` : 'none',
                color: color.text55,
                cursor: 'pointer',
                transition: `background ${transition.fast}`,
              }}
            >
              <span style={{ fontWeight: 500 }}>{r.trackName}</span>
              <span style={{ marginLeft: '4px', color: color.gold70 }}>— {r.artistName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
