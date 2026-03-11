'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { InspoType, Archetype, LandingType } from '@/lib/types'
import { todayKey, todayLabel, currentTime, dailyPrompt, passageFontSize, computeCoherence } from '@/lib/utils'
import { color, font, fontSize, radius, transition, inputStyle, eyebrowStyle, space } from '@/lib/theme'
import SignalCoherence from './SignalCoherence'
import SongCard from './SongCard'
import ReflectionModal from './ReflectionModal'
import DaySignalImage from './DaySignalImage'
import DayMelody from './DayMelody'
import SectionLabel from './ui/SectionLabel'
import Pill from './ui/Pill'
import ImageFrame from './ui/ImageFrame'
import RitualButton from './ui/RitualButton'
import ReflectiveTextarea from './ui/ReflectiveTextarea'
import Disclosure from './ui/Disclosure'
import LissajousBackground from './LissajousBackground'

const CLOSING_SUGGESTIONS = [
  'enduring', 'suspended', 'load-bearing', 'clarifying', 'faithful',
  'still', 'held', 'present', 'steady', 'returned', 'thin', 'enough', 'witness',
]

const INSPO_TYPES: InspoType[] = ['lyric', 'scripture', 'film', 'poem', 'news', 'quote']
const NEWS_TAGS = ['world', 'local', 'personal'] as const
const ARCHETYPES: Archetype[] = [
  'spouse', 'parent', 'their child', 'therapist', 'mentor', 'pastor', 'future self', 'inner critic', 'investor', 'clinical witness',
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
  const [echoReason, setEchoReason] = useState('')
  const [landingType, setLandingType] = useState<LandingType>('')

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
  const [saveFlash, setSaveFlash] = useState(false)

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
        setEchoReason(data.echo_reason || '')
        setLandingType((data.landing_type as LandingType) || '')
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
    }
    load()
  }, [dk])

  const handleSave = useCallback(async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const coh = passage
      ? computeCoherence({ passage, arcNote, picture: pictureUrl, inspoType, inspoText, closingWord })
      : null
    const gap = coh ? coh.momentClarity - coh.emotionalUnity : 0
    const overall = coh
      ? Math.round((coh.momentClarity + coh.arcContinuity + coh.imageResonance + coh.echoFit + coh.emotionalUnity) / 5)
      : 0

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
      attunement_gap: gap,
      echo_reason: echoReason,
      landing_type: landingType,
      signal_coherence: overall,
      updated_at: new Date().toISOString(),
    }

    await supabase.from('entries').upsert(entry, { onConflict: 'user_id,date_key' })
    setSaved(true)
    setSaving(false)
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 1600)

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
  }, [dk, dl, passage, arcNote, closingWord, pictureUrl, inspoType, inspoText, inspoArtist, inspoSong, inspoPreviewUrl, newsTag, echoReason, landingType, dayGift])

  async function handleReflect() {
    if (!passage) return
    setReflecting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setReflecting(false); return }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

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
          echoText: inspoText || null,
          echoType: inspoType || null,
          arcText: arcNote || null,
          imageUrl: pictureUrl || null,
          echoReason: echoReason || null,
          landingType: landingType || null,
          attunementGap: coherence ? coherence.momentClarity - coherence.emotionalUnity : 0,
          signalCoherence: coherence ? Math.round((coherence.momentClarity + coherence.arcContinuity + coherence.imageResonance + coherence.echoFit + coherence.emotionalUnity) / 5) : 0,
        }),
      })
      const data = await res.json()
      setReflection(data.reflection)
      setShowModal(true)

      await supabase.from('entries').update({ reflection: data.reflection }).eq('user_id', user.id).eq('date_key', dk)

      const tMatch = data.reflection?.match(/TOMORROW::\s*(.+?)$/m)
      if (tMatch) {
        await supabase.from('entries').update({ tomorrow_q: tMatch[1].trim() }).eq('user_id', user.id).eq('date_key', dk)
      }

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

    const { error } = await supabase.storage
      .from('entry-images')
      .upload(`dev-user/${dk}.jpg`, file, { upsert: true, contentType: file.type })

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('entry-images')
        .getPublicUrl(`dev-user/${dk}.jpg`)
      setPictureUrl(publicUrl)
    }
  }

  const coherence = passage
    ? computeCoherence({ passage, arcNote, picture: pictureUrl, inspoType, inspoText, closingWord })
    : null

  const charCountStyle: React.CSSProperties = {
    fontFamily: font.mono,
    fontSize: fontSize.xs,
    color: passage.length > 238 ? color.gold : color.text20,
    transition: `color ${transition.normal}`,
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: `0 ${space[4]} ${space[16]}` }}
      className="sg-thread-page"
    >
      {!saved && !passage && <LissajousBackground />}
      {/* ─── Header ─── */}
      <header style={{ textAlign: 'center', paddingTop: space[6], paddingBottom: space[10] }}>
        <div style={{ ...eyebrowStyle, marginBottom: space[4] }}>{dl.toUpperCase()}</div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space[3],
          flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: font.mono, fontSize: fontSize.md, color: color.text38 }}>
            {time}
          </span>
          <span
            className="animate-breathe"
            style={{
              fontFamily: font.display,
              fontSize: fontSize['5xl'],
              color: color.gold,
              lineHeight: '1',
            }}
          >
            ;
          </span>
          <span style={{
            fontFamily: font.display,
            fontSize: fontSize['3xl'],
            fontStyle: 'italic',
            color: color.text55,
            maxWidth: '420px',
          }}>
            {dailyPrompt()}
          </span>
        </div>
        <p style={{
          fontFamily: font.display,
          fontSize: fontSize.base,
          fontStyle: 'italic',
          color: color.text25,
          marginTop: space[2],
        }}>
          and what did it continue?
        </p>
      </header>

      {/* ─── Two-column layout ─── */}
      <div className="sg-two-col">
        {/* ─── LEFT COLUMN ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[6] }}>

          {/* A. THE ; MOMENT — Image */}
          <section>
            <SectionLabel
              label="THE ; MOMENT"
              helper="The frame you would keep if the day had only one image."
            />
            <ImageFrame src={pictureUrl} onUpload={handleImageUpload} />
          </section>

          {/* B. WHAT HAPPENED */}
          <section>
            <SectionLabel
              label="WHAT HAPPENED — AND WHAT I THINK IT MEANT"
              right={<span style={charCountStyle}>{passage.length}/280</span>}
            />
            <ReflectiveTextarea
              value={passage}
              onChange={(v) => { setPassage(v); setSaved(false) }}
              placeholder="Name the event. Then name the meaning you felt forming."
              maxLength={280}
              fontSize={passageFontSize(passage.length)}
              minHeight={120}
              autoResize
              ariaLabel="Today's passage"
            />
          </section>

          {/* C. CLOSING WORD */}
          <section>
            <SectionLabel label="CLOSING WORD" />
            <input
              type="text"
              value={closingWord}
              onChange={(e) => { setClosingWord(e.target.value); setSaved(false) }}
              aria-label="Closing word"
              className="sg-textarea"
              style={{
                ...inputStyle,
                width: '100%',
                borderRadius: radius.md,
                padding: '10px 13px',
                textAlign: 'center',
                fontFamily: font.display,
                fontSize: fontSize['4xl'],
                outline: 'none',
                transition: `all ${transition.normal}`,
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: space[1], marginTop: space[2] }}>
              {CLOSING_SUGGESTIONS.map((w) => (
                <Pill
                  key={w}
                  label={w}
                  selected={closingWord === w}
                  onClick={() => { setClosingWord(w); setSaved(false) }}
                />
              ))}
            </div>
          </section>

          {/* Save button */}
          <div style={{ position: 'relative' }}>
            <RitualButton
              onClick={handleSave}
              disabled={!passage}
              loading={saving}
              loadingText="Saving…"
              variant={saved ? 'ghost' : 'primary'}
              style={saved ? {
                background: color.gold08,
                border: `1.5px solid ${color.gold22}`,
                color: color.gold50,
              } : undefined}
            >
              {saved ? 'Saved \u2713' : 'Save the semicolon page'}
            </RitualButton>
            {saveFlash && (
              <div className="sg-save-flash" style={{
                position: 'absolute',
                inset: 0,
                borderRadius: radius.xl,
                border: `1.5px solid ${color.gold38}`,
                pointerEvents: 'none',
              }} />
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[6] }}>

          {/* D. WHAT ECHOED IT */}
          <section>
            <SectionLabel
              label="WHAT ECHOED IT"
              helper="Song, lyric, scripture, film, poem, quote, headline, or news."
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: space[1], marginBottom: space[3] }}>
              {INSPO_TYPES.map((t) => (
                <Pill
                  key={t}
                  label={t}
                  selected={inspoType === t}
                  onClick={() => setInspoType(inspoType === t ? null : t)}
                />
              ))}
            </div>

            {inspoType ? (
              <div className="animate-slideUp">
                <ReflectiveTextarea
                  value={inspoText}
                  onChange={setInspoText}
                  placeholder="The line, verse, or quote that echoed today"
                  fontFamily="display"
                  italic
                  fontSize={fontSize.lg}
                  minHeight={60}
                  ariaLabel="Echo source text"
                />

                {inspoType === 'lyric' && (
                  <div style={{ marginTop: space[2] }}>
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
                  <div style={{ display: 'flex', gap: space[1], marginTop: space[2] }}>
                    {NEWS_TAGS.map((t) => (
                      <Pill
                        key={t}
                        label={t === 'world' ? '\uD83C\uDF0D world' : t === 'local' ? '\uD83D\uDCCD local' : '\uD83E\uDEC0 personal'}
                        selected={newsTag === t}
                        onClick={() => setNewsTag(newsTag === t ? null : t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p style={{
                fontFamily: font.display,
                fontSize: fontSize.lg,
                fontStyle: 'italic',
                color: color.text15,
                padding: '12px 0',
              }}>
                choose a source above to begin
              </p>
            )}
          </section>

          {/* D2. WHY THIS TODAY + LANDED AS */}
          {inspoText && (
            <section className="animate-slideUp">
              <SectionLabel label="WHY THIS TODAY" />
              <input
                type="text"
                value={echoReason}
                onChange={(e) => { setEchoReason(e.target.value); setSaved(false) }}
                maxLength={100}
                placeholder="why this signal on this day"
                aria-label="Why this today"
                className="sg-textarea"
                style={{
                  ...inputStyle,
                  width: '100%',
                  borderRadius: radius.md,
                  padding: '10px 13px',
                  fontFamily: font.body,
                  fontSize: fontSize.md,
                  outline: 'none',
                  transition: `all ${transition.normal}`,
                }}
              />

              <div style={{ marginTop: space[4] }}>
                <SectionLabel label="LANDED AS" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: space[1] }}>
                  {(['as written', 'as metaphor', 'as scripture', 'as warning'] as LandingType[]).map((t) => (
                    <Pill
                      key={t}
                      label={t}
                      selected={landingType === t}
                      onClick={() => { setLandingType(landingType === t ? '' : t); setSaved(false) }}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* E. THE AND */}
          <section>
            <SectionLabel
              label="THE AND"
              helper="The larger arc this moment belongs to."
            />
            <ReflectiveTextarea
              value={arcNote}
              onChange={(v) => { setArcNote(v); setSaved(false) }}
              placeholder={'And what did this continue?\n\ne.g. trust being built \u00B7 time as treatment \u00B7 endurance as area under the curve'}
              minHeight={80}
              ariaLabel="The larger arc"
            />
          </section>

          {/* F. WHAT TODAY GAVE YOU */}
          {dayGift ? (
            <section className="animate-fortuneIn">
              <SectionLabel label="WHAT TODAY GAVE YOU" />
              <p style={{
                fontFamily: font.display,
                fontSize: fontSize.lg,
                fontStyle: 'italic',
                color: color.gold70,
                lineHeight: '1.6',
              }}>
                {dayGift}
              </p>
            </section>
          ) : saved ? (
            <section>
              <SectionLabel label="WHAT TODAY GAVE YOU" />
              <p style={{
                fontFamily: font.display,
                fontSize: fontSize.md,
                fontStyle: 'italic',
                color: color.text15,
              }}>
                appears after you save
              </p>
            </section>
          ) : null}

          {/* G. SIGNAL COHERENCE */}
          {coherence && <SignalCoherence coherence={coherence} />}

          {/* H. SPEAK TO ME AS MY… */}
          <section>
            <SectionLabel label="SPEAK TO ME AS MY…" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: space[1] }}>
              {ARCHETYPES.map((a) => (
                <Pill
                  key={a}
                  label={a}
                  selected={archetype === a}
                  onClick={() => setArchetype(archetype === a ? null : a)}
                />
              ))}
            </div>
          </section>

          {/* I. ASK THE LIGHTHOUSE TO READ */}
          <section>
            <RitualButton
              onClick={handleReflect}
              disabled={!passage}
              loading={reflecting}
              loadingText="The Lighthouse is reading…"
            >
              Ask the Lighthouse to read
            </RitualButton>
            {!passage && (
              <p style={{
                textAlign: 'center',
                fontFamily: font.body,
                fontSize: fontSize.sm,
                color: color.text25,
                marginTop: space[1],
              }}>
                write your moment first
              </p>
            )}
            {reflection && !reflecting && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: '100%',
                  marginTop: space[2],
                  padding: '6px 0',
                  borderRadius: radius.lg,
                  fontFamily: font.mono,
                  fontSize: fontSize.sm,
                  background: color.surface03,
                  border: `1px solid ${color.border06}`,
                  color: color.text30,
                  cursor: 'pointer',
                  transition: `all ${transition.normal}`,
                }}
                aria-label="Open lighthouse reading"
              >
                read again ;
              </button>
            )}
          </section>

          {/* J. DAY SIGNAL IMAGE */}
          {passage && (
            <Disclosure label="Day Signal Image">
              <DaySignalImage passage={passage} closingWord={closingWord} />
            </Disclosure>
          )}

          {/* K. DAY MELODY */}
          {passage && (
            <Disclosure label="Day Melody">
              <DayMelody passage={passage} />
            </Disclosure>
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
