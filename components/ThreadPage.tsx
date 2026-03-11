'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Entry, InspoType, Archetype, DreamState, LucidState, DreamQuality, ContinuityState } from '@/lib/types'
import { todayKey, todayLabel, currentTime, dailyPrompt, passageFontSize, computeCoherence } from '@/lib/utils'
import SignalCoherence from './SignalCoherence'
import SongCard from './SongCard'
import ReflectionModal from './ReflectionModal'
import DaySignalImage from './DaySignalImage'
import DayMelody from './DayMelody'
import LissajousBackground from './LissajousBackground'

const CLOSING_SUGGESTIONS = [
  'enduring', 'suspended', 'load-bearing', 'clarifying', 'faithful',
  'still', 'held', 'present', 'steady', 'returned', 'thin', 'enough', 'witness',
  'coupled', 'entrained', 'phase', 'cycling', 'amplitude',
]

const INSPO_TYPES: InspoType[] = ['lyric', 'scripture', 'film', 'poem', 'news', 'quote']
const NEWS_TAGS = ['world', 'local', 'personal'] as const
const SCRIPTURE_TRADITIONS = ['Bible', 'Torah', 'Quran', 'Vedas', 'Egyptian Book of the Dead', 'Tao Te Ching', 'Upanishads', 'Bhagavad Gita'] as const
const SCRIPTURE_PLACEHOLDERS: Record<string, string> = {
  'Bible': 'e.g. Ephesians 4:2 \u2014 Be completely humble and gentle...',
  'Quran': 'e.g. Surah 2:286 \u2014 God does not burden a soul beyond that it can bear...',
  'Tao Te Ching': 'e.g. Chapter 16 \u2014 Return to the root is called stillness...',
}
const ARCHETYPES: Archetype[] = [
  'spouse', 'parent', 'their child', 'therapist', 'mentor', 'pastor', 'future self', 'inner critic', 'investor', 'clinical witness',
]

const DREAM_STATES: { value: DreamState; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'fragments', label: 'Fragments only' },
]

const LUCID_STATES: { value: LucidState; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'partial', label: 'Partially' },
  { value: 'no', label: 'No' },
]

const DREAM_QUALITIES: { value: DreamQuality; label: string }[] = [
  { value: 'threat', label: 'Threat' },
  { value: 'resolution', label: 'Resolution' },
  { value: 'flight', label: 'Flight' },
  { value: 'presence', label: 'Presence' },
  { value: 'void', label: 'Void' },
  { value: 'light', label: 'Light' },
]

const CONTINUITY_STATES: { value: ContinuityState; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unclear', label: 'Unclear' },
]

export default function ThreadPage() {
  const dk = todayKey()
  const dl = todayLabel()
  const [time, setTime] = useState(currentTime())

  // Entry state
  const [passage, setPassage] = useState('')
  const [arcNote, setArcNote] = useState('')
  const [closingWord, setClosingWord] = useState('')
  const [pictureUrl, setPictureUrl] = useState<string | null>(null)
  const [inspoType, setInspoType] = useState<InspoType | null>(null)
  const [inspoText, setInspoText] = useState('')
  const [inspoArtist, setInspoArtist] = useState('')
  const [inspoSong, setInspoSong] = useState('')
  const [inspoPreviewUrl, setInspoPreviewUrl] = useState<string | null>(null)
  const [newsTag, setNewsTag] = useState<string | null>(null)

  // Song state
  const [selectedSong, setSelectedSong] = useState<{
    trackName: string; artistName: string; previewUrl: string | null; trackViewUrl: string
  } | null>(null)

  // AI state
  const [reflection, setReflection] = useState<string | null>(null)
  const [dayGift, setDayGift] = useState<string | null>(null)
  const [weave, setWeave] = useState<string | null>(null)
  const [archetype, setArchetype] = useState<Archetype | null>(null)
  const [reflecting, setReflecting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // UI state
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSignal, setShowSignal] = useState(false)
  const [showMelody, setShowMelody] = useState(false)
  const [imgPosition, setImgPosition] = useState(50)
  const [inspoTradition, setInspoTradition] = useState<string | null>(null)

  // Dream state
  const [dreamOpen, setDreamOpen] = useState(false)
  const [hasDreamEntry, setHasDreamEntry] = useState(false)
  const [dreamed, setDreamed] = useState<DreamState | null>(null)
  const [lucid, setLucid] = useState<LucidState | null>(null)
  const [dreamQuality, setDreamQuality] = useState<DreamQuality | null>(null)
  const [closingImage, setClosingImage] = useState('')
  const [continuity, setContinuity] = useState<ContinuityState | null>(null)
  const [dreamSaving, setDreamSaving] = useState(false)
  const [dreamSaved, setDreamSaved] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const draggingRef = useRef(false)
  const dragStartYRef = useRef(0)
  const dragStartPosRef = useRef(50)

  // Update time every minute
  useEffect(() => {
    const t = setInterval(() => setTime(currentTime()), 60000)
    return () => clearInterval(t)
  }, [])

  // Load today's entry
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date_key', dk)
        .single()
      if (data) {
        setPassage(data.passage || '')
        setArcNote(data.arc_note || '')
        setClosingWord(data.closing_word || '')
        setPictureUrl(data.picture_url || null)
        setInspoType(data.inspo_type as InspoType | null)
        setInspoText(data.inspo_text || '')
        setInspoArtist(data.inspo_artist || '')
        setInspoSong(data.inspo_song || '')
        setInspoPreviewUrl(data.inspo_preview_url || null)
        setNewsTag(data.news_tag || null)
        setReflection(data.reflection || null)
        setDayGift(data.day_gift || null)
        if (data.inspo_song && data.inspo_artist) {
          setSelectedSong({
            trackName: data.inspo_song,
            artistName: data.inspo_artist,
            previewUrl: data.inspo_preview_url,
            trackViewUrl: '',
          })
        }
        if (data.passage) setSaved(true)
      }

      // Check for existing dream entry today
      const { data: dreamData } = await supabase
        .from('dream_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', dk)
        .single()
      if (dreamData) {
        setHasDreamEntry(true)
        setDreamed(dreamData.dreamed === true ? 'yes' : dreamData.dreamed === false ? 'no' : 'fragments')
        setLucid(dreamData.lucid as LucidState | null)
        setDreamQuality(dreamData.quality as DreamQuality | null)
        setClosingImage(dreamData.closing_image || '')
        setContinuity(dreamData.continuity as ContinuityState | null)
        setDreamSaved(true)
      }
    }
    load()
  }, [dk])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const entry = {
      user_id: user.id,
      date_key: dk,
      date_label: dl,
      passage,
      arc_note: arcNote,
      closing_word: closingWord,
      picture_url: pictureUrl,
      inspo_type: inspoType,
      inspo_text: inspoText,
      inspo_artist: inspoArtist,
      inspo_song: inspoSong,
      inspo_preview_url: inspoPreviewUrl,
      news_tag: newsTag,
      updated_at: new Date().toISOString(),
    }

    await supabase.from('entries').upsert(entry, { onConflict: 'user_id,date_key' })
    setSaved(true)
    setSaving(false)

    // Fetch day gift
    if (passage && !dayGift) {
      fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage, closingWord }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.gift) {
            setDayGift(d.gift)
            supabase.from('entries').update({ day_gift: d.gift }).eq('user_id', user.id).eq('date_key', dk)
          }
        })
        .catch(() => {})
    }
  }

  async function handleReflect() {
    if (!passage) return
    setReflecting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setReflecting(false); return }

    // Get profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    // Get previous entries
    const { data: prevEntries } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .neq('date_key', dk)
      .order('date_key', { ascending: false })
      .limit(10)

    const inspoCtx = inspoText ? `Echo (${inspoType || 'general'}): "${inspoText}"${inspoArtist ? ` — ${inspoArtist}` : ''}` : ''
    const newsCtx = newsTag ? `News context: ${newsTag}` : ''
    const arcCtx = arcNote ? `The And (larger arc): "${arcNote}"` : ''

    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage,
          closingWord,
          profile,
          prevEntries: prevEntries || [],
          inspoCtx,
          newsCtx,
          arcCtx,
          archetype,
        }),
      })
      const data = await res.json()
      setReflection(data.reflection)
      setShowModal(true)

      // Save reflection
      await supabase.from('entries').update({ reflection: data.reflection }).eq('user_id', user.id).eq('date_key', dk)

      // Extract tomorrow question
      const tMatch = data.reflection?.match(/TOMORROW::\s*(.+?)$/m)
      if (tMatch) {
        await supabase.from('entries').update({ tomorrow_q: tMatch[1].trim() }).eq('user_id', user.id).eq('date_key', dk)
      }

      // Weave if 5+ entries
      if (prevEntries && prevEntries.length >= 4) {
        const weaveRes = await fetch('/api/weave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries: [...(prevEntries || []), { date_key: dk, passage, closing_word: closingWord, arc_note: arcNote }] }),
        })
        const weaveData = await weaveRes.json()
        setWeave(weaveData.weave || null)
      }
    } catch {
      setReflection('The lighthouse received your signal. Sometimes that\'s enough.')
      setShowModal(true)
    }
    setReflecting(false)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${user.id}/${dk}.${ext}`

    const { error } = await supabase.storage
      .from('moments')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('moments')
        .getPublicUrl(path)
      setPictureUrl(publicUrl)
      setSaved(false)

      // Persist the image URL to the database immediately
      await supabase
        .from('entries')
        .upsert(
          { user_id: user.id, date_key: dk, date_label: dl, picture_url: publicUrl, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,date_key' }
        )
    }
  }

  async function handleDreamSave() {
    setDreamSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setDreamSaving(false); return }

    // Get previous day's coherence score
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.toISOString().slice(0, 10)
    const { data: prevEntry } = await supabase
      .from('entries')
      .select('coherence_score')
      .eq('user_id', user.id)
      .eq('date_key', yesterdayKey)
      .single()

    const dreamEntry = {
      user_id: user.id,
      entry_date: dk,
      dreamed: dreamed === 'yes' || dreamed === 'fragments',
      lucid: dreamed === 'yes' ? lucid : null,
      quality: dreamQuality,
      closing_image: closingImage,
      continuity,
      waking_coherence: prevEntry?.coherence_score ?? null,
    }

    await supabase.from('dream_entries').upsert(dreamEntry, { onConflict: 'user_id,entry_date' })
    setDreamSaved(true)
    setHasDreamEntry(true)
    setDreamSaving(false)
  }

  const coherence = passage
    ? computeCoherence({ passage, arcNote, picture: pictureUrl, inspoType, inspoText, closingWord })
    : null

  const inputStyle = {
    background: 'rgba(var(--sg-text-rgb), 0.035)',
    border: '1px solid rgba(var(--sg-text-rgb), 0.13)',
    color: 'rgba(var(--sg-text-rgb), 0.88)',
  }

  const labelStyle = {
    fontSize: '9px',
    color: 'rgba(var(--sg-text-rgb), 0.48)',
    fontFamily: 'var(--font-mono, "DM Mono", monospace)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.14em',
    fontWeight: 500 as const,
  }

  return (
    <div className="max-w-[820px] mx-auto px-4 sm:px-6 pb-28 md:pb-8 relative">
      {/* Lissajous background — visible only when empty */}
      <LissajousBackground visible={!passage && !pictureUrl} />

      {/* Header */}
      <div className="text-center pt-6 pb-8">
        <div style={labelStyle} className="mb-3">{dl.toUpperCase()}</div>
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-2">
          <span className="font-mono text-[13px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.48)' }}>
            {time}
          </span>
          <span className="font-display text-[40px] sm:text-[46px] text-sg-gold animate-breathe leading-none">;</span>
          <span className="font-display text-[18px] sm:text-[22px] italic" style={{ color: 'rgba(var(--sg-text-rgb), 0.65)' }}>
            {dailyPrompt()}
          </span>
        </div>
        <p className="font-display text-[12px] italic mt-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.38)' }}>
          and what did it continue?
        </p>
      </div>

      {/* LAST NIGHT — Morning dream entry */}
      {!hasDreamEntry && (
        <div className="mb-6 animate-slideUp">
          <button
            onClick={() => setDreamOpen(!dreamOpen)}
            className="flex items-center gap-2 w-full"
          >
            <span style={labelStyle}>LAST NIGHT</span>
            <span
              className="font-mono text-[10px] transition-transform"
              style={{
                color: 'rgba(var(--sg-text-rgb), 0.2)',
                transform: dreamOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              {dreamOpen ? '−' : '+'}
            </span>
          </button>

          {dreamOpen && (
            <div className="mt-3 space-y-4 animate-slideUp max-w-[480px]">
              {/* Did you dream? */}
              <div>
                <div className="font-body text-[11px] mb-1.5" style={{ color: 'rgba(var(--sg-text-rgb), 0.48)' }}>
                  Did you dream?
                </div>
                <div className="flex gap-1.5">
                  {DREAM_STATES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => { setDreamed(s.value); setDreamSaved(false) }}
                      className="px-[10px] py-[3px] rounded-full text-[10px] font-body transition-all"
                      style={{
                        background: dreamed === s.value ? 'rgba(201, 169, 110, 0.12)' : 'rgba(var(--sg-text-rgb), 0.025)',
                        border: `1.5px solid ${dreamed === s.value ? 'rgba(201, 169, 110, 0.38)' : 'rgba(var(--sg-text-rgb), 0.08)'}`,
                        color: dreamed === s.value ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.48)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Was it lucid? */}
              {dreamed === 'yes' && (
                <div className="animate-slideUp">
                  <div className="font-body text-[11px] mb-1.5" style={{ color: 'rgba(var(--sg-text-rgb), 0.48)' }}>
                    Was it lucid?
                  </div>
                  <div className="flex gap-1.5">
                    {LUCID_STATES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => { setLucid(s.value); setDreamSaved(false) }}
                        className="px-[10px] py-[3px] rounded-full text-[10px] font-body transition-all"
                        style={{
                          background: lucid === s.value ? 'rgba(201, 169, 110, 0.12)' : 'rgba(var(--sg-text-rgb), 0.025)',
                          border: `1.5px solid ${lucid === s.value ? 'rgba(201, 169, 110, 0.38)' : 'rgba(var(--sg-text-rgb), 0.08)'}`,
                          color: lucid === s.value ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.48)',
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dominant quality */}
              {(dreamed === 'yes' || dreamed === 'fragments') && (
                <div className="animate-slideUp">
                  <div className="font-body text-[11px] mb-1.5" style={{ color: 'rgba(var(--sg-text-rgb), 0.48)' }}>
                    Dominant quality
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DREAM_QUALITIES.map((q) => (
                      <button
                        key={q.value}
                        onClick={() => { setDreamQuality(q.value); setDreamSaved(false) }}
                        className="px-[10px] py-[3px] rounded-full text-[10px] font-body transition-all"
                        style={{
                          background: dreamQuality === q.value ? 'rgba(201, 169, 110, 0.12)' : 'rgba(var(--sg-text-rgb), 0.025)',
                          border: `1.5px solid ${dreamQuality === q.value ? 'rgba(201, 169, 110, 0.38)' : 'rgba(var(--sg-text-rgb), 0.08)'}`,
                          color: dreamQuality === q.value ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.48)',
                        }}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Closing image */}
              {(dreamed === 'yes' || dreamed === 'fragments') && (
                <div className="animate-slideUp">
                  <div className="font-body text-[11px] mb-1.5" style={{ color: 'rgba(var(--sg-text-rgb), 0.48)' }}>
                    Closing image
                  </div>
                  <input
                    type="text"
                    value={closingImage}
                    onChange={(e) => { setClosingImage(e.target.value); setDreamSaved(false) }}
                    placeholder="one word"
                    className="w-full max-w-[200px] rounded-[9px] px-[13px] py-[8px] text-center font-display text-[18px] outline-none transition-all focus:ring-2 focus:ring-sg-gold/50 focus:ring-offset-2"
                    style={{
                      background: 'rgba(var(--sg-text-rgb), 0.032)',
                      border: '1px solid rgba(var(--sg-text-rgb), 0.11)',
                      color: 'rgba(var(--sg-text-rgb), 0.85)',
                    }}
                  />
                </div>
              )}

              {/* Continuity with yesterday? */}
              {(dreamed === 'yes' || dreamed === 'fragments') && (
                <div className="animate-slideUp">
                  <div className="font-body text-[11px] mb-1.5" style={{ color: 'rgba(var(--sg-text-rgb), 0.48)' }}>
                    Connected to yesterday&apos;s passage?
                  </div>
                  <div className="flex gap-1.5">
                    {CONTINUITY_STATES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => { setContinuity(s.value); setDreamSaved(false) }}
                        className="px-[10px] py-[3px] rounded-full text-[10px] font-body transition-all"
                        style={{
                          background: continuity === s.value ? 'rgba(201, 169, 110, 0.12)' : 'rgba(var(--sg-text-rgb), 0.025)',
                          border: `1.5px solid ${continuity === s.value ? 'rgba(201, 169, 110, 0.38)' : 'rgba(var(--sg-text-rgb), 0.08)'}`,
                          color: continuity === s.value ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.48)',
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Save dream */}
              {dreamed && (
                <button
                  onClick={handleDreamSave}
                  disabled={dreamSaving}
                  className="py-[8px] px-6 rounded-[18px] font-body text-[12px] tracking-wide transition-all"
                  style={{
                    background: dreamSaved ? 'rgba(201, 169, 110, 0.08)' : 'rgba(201, 169, 110, 0.15)',
                    border: '1.5px solid rgba(201, 169, 110, 0.3)',
                    color: dreamSaved ? 'rgba(201, 169, 110, 0.5)' : 'rgba(201, 169, 110, 0.85)',
                  }}
                >
                  {dreamSaving ? 'Saving…' : dreamSaved ? 'Saved' : 'Save last night'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* A. THE ; MOMENT */}
          <div>
            <div style={labelStyle} className="mb-1">THE ; MOMENT</div>
            <p className="font-body text-[10px] mb-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.42)' }}>
              The frame you would keep if the day had only one image.
            </p>
            <div
              className="rounded-[12px] overflow-hidden cursor-pointer transition-all"
              style={{
                minHeight: pictureUrl ? 'auto' : '140px',
                ...inputStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => { if (!pictureUrl) fileRef.current?.click() }}
            >
              {pictureUrl ? (
                <div
                  className="w-full relative select-none"
                  style={{ height: 260, cursor: 'grab' }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    draggingRef.current = true
                    dragStartYRef.current = e.clientY
                    dragStartPosRef.current = imgPosition
                  }}
                  onMouseMove={(e) => {
                    if (!draggingRef.current) return
                    const delta = e.clientY - dragStartYRef.current
                    const newPos = Math.max(0, Math.min(100, dragStartPosRef.current - delta * 0.3))
                    setImgPosition(newPos)
                  }}
                  onMouseUp={() => { draggingRef.current = false }}
                  onMouseLeave={() => { draggingRef.current = false }}
                  onTouchStart={(e) => {
                    draggingRef.current = true
                    dragStartYRef.current = e.touches[0].clientY
                    dragStartPosRef.current = imgPosition
                  }}
                  onTouchMove={(e) => {
                    if (!draggingRef.current) return
                    const delta = e.touches[0].clientY - dragStartYRef.current
                    const newPos = Math.max(0, Math.min(100, dragStartPosRef.current - delta * 0.3))
                    setImgPosition(newPos)
                  }}
                  onTouchEnd={() => { draggingRef.current = false }}
                >
                  <img
                    src={pictureUrl}
                    alt="day moment"
                    className="w-full h-full object-cover pointer-events-none"
                    style={{ objectPosition: `center ${imgPosition}%` }}
                    draggable={false}
                  />
                </div>
              ) : (
                <span className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.35)' }}>
                  tap to add image
                </span>
              )}
            </div>
            {pictureUrl && (
              <div className="flex justify-between items-center mt-1">
                <p className="font-mono text-[9px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.35)' }}>
                  drag to reframe
                </p>
                <button
                  className="font-mono text-[9px]"
                  style={{ color: 'rgba(var(--sg-text-rgb), 0.35)' }}
                  onClick={() => fileRef.current?.click()}
                >
                  change image
                </button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* B. WHAT HAPPENED */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span style={labelStyle}>WHAT HAPPENED — AND WHAT I THINK IT MEANT</span>
              <span
                className="font-mono text-[9px]"
                style={{ color: passage.length > 238 ? '#c9a96e' : 'rgba(var(--sg-text-rgb), 0.2)' }}
              >
                {passage.length}/280
              </span>
            </div>
            <textarea
              value={passage}
              onChange={(e) => { if (e.target.value.length <= 280) { setPassage(e.target.value); setSaved(false) } }}
              placeholder="Name the event. Then name the meaning you felt forming."
              className="w-full rounded-[9px] px-[13px] py-[10px] outline-none resize-none transition-all focus:ring-2 focus:ring-sg-gold/50 focus:ring-offset-2"
              style={{
                ...inputStyle,
                fontFamily: 'var(--font-body, "DM Sans", system-ui, sans-serif)',
                fontSize: passageFontSize(passage.length),
                minHeight: 120,
              }}
            />
          </div>

          {/* C. CLOSING WORD */}
          <div>
            <div style={labelStyle} className="mb-1">CLOSING WORD</div>
            <input
              type="text"
              value={closingWord}
              onChange={(e) => { setClosingWord(e.target.value); setSaved(false) }}
              className="w-full rounded-[9px] px-[13px] py-[10px] text-center font-display text-[26px] outline-none transition-all focus:ring-2 focus:ring-sg-gold/50 focus:ring-offset-2"
              style={inputStyle}
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {CLOSING_SUGGESTIONS.map((w) => (
                <button
                  key={w}
                  onClick={() => { setClosingWord(w); setSaved(false) }}
                  className="px-[10px] py-[2px] rounded-full text-[10px] font-body transition-all"
                  style={{
                    background: closingWord === w ? 'rgba(201, 169, 110, 0.12)' : 'rgba(var(--sg-text-rgb), 0.025)',
                    border: `1.5px solid ${closingWord === w ? 'rgba(201, 169, 110, 0.38)' : 'rgba(var(--sg-text-rgb), 0.08)'}`,
                    color: closingWord === w ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.48)',
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !passage}
            className="w-full py-[12px] rounded-[18px] font-body text-[14px] tracking-wide transition-all"
            style={{
              background: saved ? 'rgba(201, 169, 110, 0.08)' : 'rgba(201, 169, 110, 0.18)',
              border: '1.5px solid rgba(201, 169, 110, 0.35)',
              color: saved ? 'rgba(201, 169, 110, 0.5)' : 'rgba(201, 169, 110, 0.9)',
            }}
          >
            {saving ? 'Saving…' : saved ? 'Saved \u2713' : 'Save the semicolon page'}
          </button>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* D. WHAT ECHOED IT */}
          <div>
            <div style={labelStyle} className="mb-1">WHAT ECHOED IT</div>
            <p className="font-body text-[10px] mb-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.42)' }}>
              Song, lyric, scripture, film, poem, quote, headline, or news.
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {INSPO_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setInspoType(inspoType === t ? null : t)}
                  className="px-[10px] py-[2px] rounded-full text-[10px] font-body transition-all"
                  style={{
                    background: inspoType === t ? 'rgba(201, 169, 110, 0.12)' : 'rgba(var(--sg-text-rgb), 0.025)',
                    border: `1.5px solid ${inspoType === t ? 'rgba(201, 169, 110, 0.38)' : 'rgba(var(--sg-text-rgb), 0.08)'}`,
                    color: inspoType === t ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.48)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={inspoText}
              onChange={(e) => setInspoText(e.target.value)}
              placeholder="The line, verse, or quote that echoed today"
              rows={2}
              className="w-full rounded-[9px] px-[13px] py-[10px] font-display italic text-[14px] outline-none resize-none transition-all focus:ring-2 focus:ring-sg-gold/50 focus:ring-offset-2"
              style={inputStyle}
            />

            {inspoType === 'scripture' && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {SCRIPTURE_TRADITIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setInspoTradition(inspoTradition === t ? null : t)}
                      className="px-[10px] py-[2px] rounded-full text-[10px] font-body transition-all"
                      style={{
                        background: inspoTradition === t ? 'rgba(201, 169, 110, 0.12)' : 'rgba(var(--sg-text-rgb), 0.025)',
                        border: `1.5px solid ${inspoTradition === t ? 'rgba(201, 169, 110, 0.38)' : 'rgba(var(--sg-text-rgb), 0.08)'}`,
                        color: inspoTradition === t ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.48)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {inspoTradition && (
                  <p className="font-body text-[10px] italic" style={{ color: 'rgba(var(--sg-text-rgb), 0.38)' }}>
                    {SCRIPTURE_PLACEHOLDERS[inspoTradition] || 'Paste or type the verse or passage...'}
                  </p>
                )}
              </div>
            )}

            {inspoType === 'lyric' && (
              <div className="mt-2">
                <SongCard
                  song={selectedSong}
                  onSelect={(s) => {
                    setSelectedSong(s)
                    setInspoArtist(s.artistName)
                    setInspoSong(s.trackName)
                    setInspoPreviewUrl(s.previewUrl || null)
                  }}
                />
              </div>
            )}

            {inspoType === 'news' && (
              <div className="flex gap-1 mt-2">
                {NEWS_TAGS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewsTag(newsTag === t ? null : t)}
                    className="px-[10px] py-[2px] rounded-full text-[10px] font-body transition-all"
                    style={{
                      background: newsTag === t ? 'rgba(201, 169, 110, 0.12)' : 'rgba(var(--sg-text-rgb), 0.025)',
                      border: `1.5px solid ${newsTag === t ? 'rgba(201, 169, 110, 0.38)' : 'rgba(var(--sg-text-rgb), 0.08)'}`,
                      color: newsTag === t ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.48)',
                    }}
                  >
                    {t === 'world' ? '\uD83C\uDF0D world' : t === 'local' ? '\uD83D\uDCCD local' : '\uD83E\uDEC0 personal'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* E. THE AND */}
          <div>
            <div style={labelStyle} className="mb-1">THE AND</div>
            <p className="font-body text-[10px] mb-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.42)' }}>
              The larger arc this moment belongs to.
            </p>
            <textarea
              value={arcNote}
              onChange={(e) => { setArcNote(e.target.value); setSaved(false) }}
              placeholder={'And what did this continue?\n\ne.g. trust being built \u00B7 time as treatment \u00B7 endurance as area under the curve \u00B7 identity becoming action'}
              rows={3}
              className="w-full rounded-[9px] px-[13px] py-[10px] font-body text-[13px] outline-none resize-none transition-all focus:ring-2 focus:ring-sg-gold/50 focus:ring-offset-2"
              style={inputStyle}
            />
          </div>

          {/* F. WHAT TODAY GAVE YOU */}
          {dayGift && (
            <div className="animate-fortuneIn">
              <div style={labelStyle} className="mb-1">WHAT TODAY GAVE YOU</div>
              <p className="font-display italic text-[14px]" style={{ color: 'rgba(201, 169, 110, 0.7)' }}>
                {dayGift}
              </p>
            </div>
          )}

          {/* G. SIGNAL COHERENCE */}
          {coherence && <SignalCoherence coherence={coherence} />}

          {/* H. SPEAK TO ME AS MY… */}
          <div>
            <div style={labelStyle} className="mb-2">SPEAK TO ME AS MY…</div>
            <div className="flex flex-wrap gap-1">
              {ARCHETYPES.map((a) => (
                <button
                  key={a}
                  onClick={() => setArchetype(archetype === a ? null : a)}
                  className="px-[10px] py-[2px] rounded-full text-[10px] font-body transition-all"
                  style={{
                    background: archetype === a ? 'rgba(201, 169, 110, 0.12)' : 'rgba(var(--sg-text-rgb), 0.025)',
                    border: `1.5px solid ${archetype === a ? 'rgba(201, 169, 110, 0.38)' : 'rgba(var(--sg-text-rgb), 0.08)'}`,
                    color: archetype === a ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.48)',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* I. ASK THE LIGHTHOUSE TO READ */}
          <div>
            <button
              onClick={handleReflect}
              disabled={reflecting || !passage}
              className="w-full py-[12px] rounded-[18px] font-body text-[14px] tracking-wide transition-all"
              style={{
                background: reflecting
                  ? 'rgba(201, 169, 110, 0.08)'
                  : passage
                  ? 'rgba(201, 169, 110, 0.22)'
                  : 'rgba(var(--sg-text-rgb), 0.04)',
                border: `1.5px solid ${passage ? 'rgba(201, 169, 110, 0.4)' : 'rgba(var(--sg-text-rgb), 0.08)'}`,
                color: passage ? 'rgba(201, 169, 110, 0.9)' : 'rgba(var(--sg-text-rgb), 0.25)',
              }}
            >
              {reflecting ? 'The Lighthouse is reading…' : 'Ask the Lighthouse to read'}
            </button>
            {!passage && (
              <p className="text-center font-body text-[10px] mt-1" style={{ color: 'rgba(var(--sg-text-rgb), 0.38)' }}>
                write your moment first
              </p>
            )}
            {reflection && !reflecting && (
              <button
                onClick={() => setShowModal(true)}
                className="w-full mt-2 py-[6px] rounded-[12px] font-mono text-[10px] transition-all"
                style={{
                  background: 'rgba(var(--sg-text-rgb), 0.02)',
                  border: '1px solid rgba(var(--sg-text-rgb), 0.06)',
                  color: 'rgba(var(--sg-text-rgb), 0.3)',
                }}
              >
                read again ;
              </button>
            )}
          </div>

          {/* J. DAY SIGNAL IMAGE */}
          {passage && (
            <details>
              <summary
                className="font-mono text-[9px] uppercase tracking-[0.15em] cursor-pointer mb-2"
                style={{ color: 'rgba(var(--sg-text-rgb), 0.42)' }}
              >
                Day Signal Image
              </summary>
              <DaySignalImage passage={passage} closingWord={closingWord} />
            </details>
          )}

          {/* K. DAY MELODY */}
          {passage && (
            <details>
              <summary
                className="font-mono text-[9px] uppercase tracking-[0.15em] cursor-pointer mb-2"
                style={{ color: 'rgba(var(--sg-text-rgb), 0.42)' }}
              >
                Day Melody
              </summary>
              <DayMelody passage={passage} />
            </details>
          )}
        </div>
      </div>

      {/* Reflection Modal */}
      {showModal && reflection && (
        <ReflectionModal
          reflection={reflection}
          weave={weave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
