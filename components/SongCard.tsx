'use client'

import { useState, useRef } from 'react'

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
        className="rounded-[12px] p-3 animate-slideUp"
        style={{
          background: 'rgba(var(--sg-text-rgb), 0.025)',
          border: '1px solid rgba(var(--sg-text-rgb), 0.06)',
        }}
      >
        <div className="font-display text-[17px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.75)' }}>
          {song.trackName}
        </div>
        <div className="font-body text-[12px] text-sg-gold mt-0.5">{song.artistName}</div>
        {song.previewUrl && (
          <button
            onClick={togglePlay}
            className="mt-2 font-mono text-[10px] px-3 py-1 rounded-full transition-all"
            style={{
              background: playing ? 'rgba(201, 169, 110, 0.15)' : 'rgba(var(--sg-text-rgb), 0.04)',
              border: '1px solid rgba(var(--sg-text-rgb), 0.08)',
              color: 'rgba(var(--sg-text-rgb), 0.45)',
            }}
          >
            {playing ? '▮▮ pause' : '▶ preview'}
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
        className="w-full px-[13px] py-[8px] rounded-[9px] font-body text-[13px] outline-none transition-all focus:ring-2 focus:ring-sg-gold/50"
        style={{
          background: 'rgba(var(--sg-text-rgb), 0.032)',
          border: '1px solid rgba(var(--sg-text-rgb), 0.11)',
          color: 'rgba(var(--sg-text-rgb), 0.75)',
        }}
      />
      {results.length > 0 && (
        <div className="mt-1 rounded-[9px] overflow-hidden" style={{ border: '1px solid rgba(var(--sg-text-rgb), 0.08)' }}>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => { onSelect?.(r); setResults([]); setQuery('') }}
              className="w-full text-left px-3 py-2 font-body text-[12px] transition-all hover:bg-sg-gold/5"
              style={{
                borderBottom: i < results.length - 1 ? '1px solid rgba(var(--sg-text-rgb), 0.04)' : 'none',
                color: 'rgba(var(--sg-text-rgb), 0.6)',
              }}
            >
              <span className="font-medium">{r.trackName}</span>
              <span className="ml-1" style={{ color: 'rgba(201, 169, 110, 0.7)' }}>— {r.artistName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
