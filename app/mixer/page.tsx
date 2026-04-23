'use client'

import { useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const P = {
  bg: '#0f071a',
  bgCard: 'rgba(40, 18, 68, 0.55)',
  border: 'rgba(178, 132, 255, 0.28)',
  accent: '#b284ff',
  accentStrong: '#c9a4ff',
  accentDim: 'rgba(178, 132, 255, 0.55)',
  text: 'rgba(237, 228, 255, 0.92)',
  textDim: 'rgba(237, 228, 255, 0.55)',
  glow: '0 0 40px rgba(178, 132, 255, 0.18)',
}

export default function MixerPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [videoName, setVideoName] = useState<string>('')
  const [audioName, setAudioName] = useState<string>('')
  const [playing, setPlaying] = useState(false)
  const [videoVol, setVideoVol] = useState(0)
  const [audioVol, setAudioVol] = useState(0.85)
  const [audioIsVideo, setAudioIsVideo] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const audioRef = useRef<HTMLMediaElement | null>(null)

  useEffect(() => {
    let active = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSession(data.session)
      })
      .catch(() => {
        if (active) setSession(null)
      })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (active) setSession(s)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [videoUrl, audioUrl])

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = videoVol
  }, [videoVol, videoUrl])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = audioVol
  }, [audioVol, audioUrl])

  const onVideoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoUrl(URL.createObjectURL(f))
    setVideoName(f.name)
    setPlaying(false)
  }

  const onAudioPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(URL.createObjectURL(f))
    setAudioName(f.name)
    setAudioIsVideo(f.type.startsWith('video/') || /\.mp4$/i.test(f.name))
    setPlaying(false)
  }

  const playBoth = async () => {
    const v = videoRef.current
    const a = audioRef.current
    if (!v && !a) return
    try {
      if (v) {
        v.currentTime = 0
        await v.play()
      }
      if (a) {
        a.currentTime = 0
        await a.play()
      }
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  const pauseBoth = () => {
    videoRef.current?.pause()
    audioRef.current?.pause()
    setPlaying(false)
  }

  const stopBoth = () => {
    const v = videoRef.current
    const a = audioRef.current
    if (v) {
      v.pause()
      v.currentTime = 0
    }
    if (a) {
      a.pause()
      a.currentTime = 0
    }
    setPlaying(false)
  }

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (session === undefined) {
    return (
      <Shell>
        <div style={{ color: P.textDim, fontSize: 13, letterSpacing: 0.5 }}>loading…</div>
      </Shell>
    )
  }

  if (session === null) {
    return (
      <Shell>
        <div
          style={{
            maxWidth: 360,
            width: '100%',
            padding: 28,
            borderRadius: 18,
            background: P.bgCard,
            border: `1px solid ${P.border}`,
            boxShadow: P.glow,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontSize: 40,
              color: P.accentStrong,
              letterSpacing: 1,
            }}
          >
            mixup
          </div>
          <div style={{ color: P.textDim, fontSize: 13, marginTop: 6 }}>
            video from your phone · sound from anywhere
          </div>
          <button
            onClick={signIn}
            style={{
              marginTop: 24,
              width: '100%',
              padding: '12px 18px',
              borderRadius: 14,
              border: `1px solid ${P.border}`,
              background: 'rgba(178, 132, 255, 0.14)',
              color: P.accentStrong,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Continue with Google
          </button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontFamily: 'Instrument Serif, serif',
                fontSize: 34,
                color: P.accentStrong,
                lineHeight: 1,
              }}
            >
              mixup
            </div>
            <div style={{ color: P.textDim, fontSize: 12, marginTop: 4 }}>
              {session.user.email}
            </div>
          </div>
          <button
            onClick={signOut}
            style={{
              background: 'transparent',
              border: `1px solid ${P.border}`,
              color: P.textDim,
              padding: '6px 12px',
              borderRadius: 12,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            sign out
          </button>
        </header>

        <Card>
          <Label>1 · video from your phone</Label>
          <FilePicker
            id="video-input"
            accept="video/*"
            capture="environment"
            onChange={onVideoPick}
            label={videoName || 'Choose or record video'}
          />
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              playsInline
              controls={false}
              style={{
                width: '100%',
                marginTop: 14,
                borderRadius: 12,
                background: '#000',
                border: `1px solid ${P.border}`,
              }}
              onEnded={() => setPlaying(false)}
            />
          )}
          {videoUrl && (
            <Slider
              label="video audio"
              value={videoVol}
              onChange={setVideoVol}
            />
          )}
        </Card>

        <Card>
          <Label>2 · mp3 or mp4 from your computer</Label>
          <FilePicker
            id="audio-input"
            accept="audio/*,video/mp4,.mp3,.mp4"
            onChange={onAudioPick}
            label={audioName || 'Choose audio (mp3) or video (mp4)'}
          />
          {audioUrl && audioIsVideo && (
            <video
              ref={(el) => {
                audioRef.current = el
              }}
              src={audioUrl}
              controls={false}
              style={{ display: 'none' }}
              onEnded={() => setPlaying(false)}
            />
          )}
          {audioUrl && !audioIsVideo && (
            <audio
              ref={(el) => {
                audioRef.current = el
              }}
              src={audioUrl}
              onEnded={() => setPlaying(false)}
            />
          )}
          {audioUrl && (
            <Slider
              label="track"
              value={audioVol}
              onChange={setAudioVol}
            />
          )}
        </Card>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={playing ? pauseBoth : playBoth}
            disabled={!videoUrl && !audioUrl}
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: 16,
              border: `1px solid ${P.accentDim}`,
              background: playing
                ? 'rgba(178, 132, 255, 0.12)'
                : 'rgba(178, 132, 255, 0.28)',
              color: P.accentStrong,
              fontSize: 15,
              cursor: videoUrl || audioUrl ? 'pointer' : 'not-allowed',
              opacity: videoUrl || audioUrl ? 1 : 0.4,
              letterSpacing: 0.5,
            }}
          >
            {playing ? 'pause' : 'play the mixup ;'}
          </button>
          <button
            onClick={stopBoth}
            disabled={!videoUrl && !audioUrl}
            style={{
              padding: '14px 18px',
              borderRadius: 16,
              border: `1px solid ${P.border}`,
              background: 'transparent',
              color: P.textDim,
              fontSize: 15,
              cursor: videoUrl || audioUrl ? 'pointer' : 'not-allowed',
              opacity: videoUrl || audioUrl ? 1 : 0.4,
            }}
          >
            stop
          </button>
        </div>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: `radial-gradient(1200px 600px at 50% -10%, rgba(178, 132, 255, 0.18), transparent 60%), ${P.bg}`,
        color: P.text,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '48px 20px 80px',
        fontFamily: 'DM Sans, system-ui, sans-serif',
      }}
    >
      {children}
    </main>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        padding: 18,
        borderRadius: 16,
        background: P.bgCard,
        border: `1px solid ${P.border}`,
        boxShadow: P.glow,
      }}
    >
      {children}
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        color: P.accent,
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  )
}

function FilePicker({
  id,
  accept,
  capture,
  onChange,
  label,
}: {
  id: string
  accept: string
  capture?: 'environment' | 'user'
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label: string
}) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'block',
        padding: '14px 16px',
        borderRadius: 12,
        border: `1px dashed ${P.accentDim}`,
        background: 'rgba(178, 132, 255, 0.06)',
        color: P.text,
        fontSize: 14,
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      {label}
      <input
        id={id}
        type="file"
        accept={accept}
        {...(capture ? { capture } : {})}
        onChange={onChange}
        style={{ display: 'none' }}
      />
    </label>
  )
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ color: P.textDim, fontSize: 11, width: 72 }}>{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          flex: 1,
          accentColor: P.accent,
        }}
      />
      <span style={{ color: P.textDim, fontSize: 11, width: 32, textAlign: 'right' }}>
        {Math.round(value * 100)}
      </span>
    </div>
  )
}
