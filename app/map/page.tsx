'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'

const DOMINANT_MODES = ['clarity-led', 'feeling-led', 'image-led', 'echo-led', 'arc-led'] as const

function kLabel(v: number): string {
  if (v <= 3) return 'low K — strong autonomy, slow to couple'
  if (v <= 6) return 'moderate K — stable pattern formation'
  return 'high K — rapid synchronization'
}

function EditableField({ value, placeholder, label, onSave }: {
  value: string; placeholder: string; label: string; onSave: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing && ref.current) ref.current.focus() }, [editing])

  return (
    <div>
      <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-2"
        style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>{label}</label>
      {editing ? (
        <textarea
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => { setEditing(false); onSave(draft) }}
          placeholder={placeholder}
          rows={2}
          className="w-full rounded-[9px] p-4 font-body text-[14px] leading-relaxed outline-none resize-none"
          style={{
            background: 'rgba(var(--sg-text-rgb), 0.03)',
            border: '1px solid rgba(var(--sg-text-rgb), 0.11)',
            color: 'rgba(var(--sg-text-rgb), 0.75)',
          }}
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full text-left rounded-[9px] p-4 font-body text-[14px] leading-relaxed transition-all"
          style={{
            background: 'rgba(var(--sg-text-rgb), 0.025)',
            border: '1px solid rgba(var(--sg-text-rgb), 0.08)',
            color: value ? 'rgba(var(--sg-text-rgb), 0.65)' : 'rgba(var(--sg-text-rgb), 0.25)',
            minHeight: '52px',
          }}
        >
          {value || placeholder}
        </button>
      )}
    </div>
  )
}

export default function MapPage() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data as Profile)
    }
    load()
  }, [])

  async function saveField(field: string, value: string | number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', user.id)
    setProfile((p) => p ? { ...p, [field]: value } : p)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--sg-bg)' }}>
      <div className="max-w-[820px] mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-[42px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.85)' }}>
            The Map
          </h1>
          <p className="font-body text-[13px] mt-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.38)' }}>
            Anchors for reading the days
          </p>
        </div>

        <div className="space-y-16">

          {/* 1. THE CORRECTION */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-4"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>The Correction</label>
            <p className="font-display text-[28px] italic leading-snug"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.85)' }}>
              &ldquo;Seek to understand <span style={{ color: 'var(--sg-gold)' }}>;</span> and then to be understood.&rdquo;
            </p>
          </section>

          <div style={{ borderTop: '1px solid rgba(var(--sg-text-rgb), 0.07)' }} />

          {/* 2. THE GROUND */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-4"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>The Ground</label>
            <p className="font-display text-[20px] italic leading-relaxed"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.75)' }}>
              Be completely humble and gentle; be patient, bearing with one another in love.
            </p>
            <p className="font-mono text-[11px] mt-3" style={{ color: 'rgba(var(--sg-text-rgb), 0.35)' }}>
              Ephesians 4:2
            </p>
          </section>

          <div style={{ borderTop: '1px solid rgba(var(--sg-text-rgb), 0.07)' }} />

          {/* 3. TRUST */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-6"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>Trust</label>
            <div className="grid grid-cols-2 gap-3">
              {['Candor', 'Competence', 'Care', 'Control'].map(word => (
                <div key={word} className="rounded-[9px] p-5 text-center font-display text-[18px]"
                  style={{
                    background: 'rgba(var(--sg-text-rgb), 0.025)',
                    border: '1px solid rgba(var(--sg-text-rgb), 0.08)',
                    color: 'rgba(var(--sg-text-rgb), 0.7)'
                  }}>
                  {word}
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: '1px solid rgba(var(--sg-text-rgb), 0.07)' }} />

          {/* 4. THE TWO ARCS */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-6"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>The Two Arcs</label>
            <div className="space-y-3">
              {[
                { label: 'OB', items: 'possibility · allowing · arrival' },
                { label: 'NICU', items: 'becoming · tools · trajectory' }
              ].map(arc => (
                <div key={arc.label} className="rounded-[9px] p-5"
                  style={{
                    background: 'rgba(var(--sg-text-rgb), 0.025)',
                    border: '1px solid rgba(var(--sg-text-rgb), 0.08)'
                  }}>
                  <p className="font-mono text-[13px] font-semibold mb-1"
                    style={{ color: 'rgba(var(--sg-text-rgb), 0.7)' }}>{arc.label}</p>
                  <p className="font-body text-[13px]"
                    style={{ color: 'rgba(var(--sg-text-rgb), 0.45)' }}>{arc.items}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: '1px solid rgba(var(--sg-text-rgb), 0.07)' }} />

          {/* 5. THE TRINITY */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-6"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>The Trinity</label>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { word: 'Pride', sub: '= Identity' },
                { word: 'Hope', sub: '= Direction' },
                { word: 'Conviction', sub: '= Action' }
              ].map(item => (
                <div key={item.word}>
                  <p className="font-display text-[20px]"
                    style={{ color: 'rgba(var(--sg-text-rgb), 0.8)' }}>{item.word}</p>
                  <p className="font-mono text-[10px] mt-1"
                    style={{ color: 'var(--sg-gold)' }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: '1px solid rgba(var(--sg-text-rgb), 0.07)' }} />

          {/* 6. THE ARC */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-6"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>The Arc · 2022–2026</label>
            <div className="space-y-4">
              {[
                { year: '2022', theme: 'Grief entered the curriculum.' },
                { year: '2023', theme: 'Momentum meets limitation — control meets constraint.' },
                { year: '2024', theme: 'Kairos, not chronos. Love coexists with grief.' },
                { year: '2025', theme: 'Expansion across thresholds. Presence as therapeutic as intervention.' },
                { year: '2026', theme: 'Structure replaces overextension. Build rails so love doesn\'t require collapse.' },
              ].map(item => (
                <div key={item.year} className="flex gap-5 items-start">
                  <span className="font-mono text-[11px] pt-[3px] shrink-0"
                    style={{ color: 'var(--sg-gold)' }}>{item.year}</span>
                  <p className="font-body text-[14px] leading-relaxed"
                    style={{ color: 'rgba(var(--sg-text-rgb), 0.65)' }}>{item.theme}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: '1px solid rgba(var(--sg-text-rgb), 0.07)' }} />

          {/* 7. THE THREE GIFTS */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-6"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>The Three Gifts</label>
            <div className="space-y-4">
              {[
                { gift: 'Gold', meaning: 'Worth beyond outcomes. Dignity that survives Plan A.' },
                { gift: 'Frankincense', meaning: 'Reverent uncertainty — hope that isn\'t naïve. Leave room for unexpected good.' },
                { gift: 'Myrrh', meaning: 'Truthful love — presence with numbered days. Not abandonment dressed as honesty.' },
              ].map(item => (
                <div key={item.gift} className="rounded-[9px] p-5"
                  style={{
                    background: 'rgba(var(--sg-text-rgb), 0.025)',
                    border: '1px solid rgba(var(--sg-text-rgb), 0.08)'
                  }}>
                  <p className="font-display text-[16px] italic mb-1"
                    style={{ color: 'var(--sg-gold)' }}>{item.gift}</p>
                  <p className="font-body text-[13px] leading-relaxed"
                    style={{ color: 'rgba(var(--sg-text-rgb), 0.6)' }}>{item.meaning}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: '1px solid rgba(var(--sg-text-rgb), 0.07)' }} />

          {/* 8. THE VOW */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-4"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>The Vow</label>
            <p className="font-display text-[24px] italic leading-snug"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.85)' }}>
              &ldquo;Build rails so love doesn&rsquo;t require collapse.&rdquo;
            </p>
            <p className="font-body text-[12px] mt-4 leading-relaxed"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>
              From being a shock absorber → to being an engineer. Structure carries what one person shouldn&rsquo;t carry alone. Compassion without collapse. Presence without abandonment.
            </p>
          </section>

          <div style={{ borderTop: '1px solid rgba(var(--sg-text-rgb), 0.07)' }} />

          {/* 9. THE SPIRAL */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-2"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>The Spiral</label>
            <p className="font-body text-[12px] mb-6"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.38)' }}>
              One complete cycle — center to departure to tension to mirror to return changed.
            </p>
            <div className="space-y-3">
              {[
                { chord: 'F♯min11', state: 'I am', freq: 'Beta ~15Hz', note: 'The passage — who you are today' },
                { chord: 'Bsus2', state: 'I go out', freq: 'Beta ~18Hz', note: 'The image — what you brought outward' },
                { chord: 'Dmaj7(♯11)', state: 'I see the other', freq: 'High Beta ~25Hz', note: 'What echoed it — the tension of recognition' },
                { chord: 'E7(no5)', state: 'I hear the question', freq: 'Gamma ~40Hz', note: 'The And — the mirror moment' },
                { chord: 'F♯(add9)/A', state: 'I return, changed', freq: 'Gamma ~40Hz', note: 'Closing word — integration' },
              ].map((row, i) => (
                <div key={i} className="rounded-[9px] p-4 flex gap-4 items-start"
                  style={{
                    background: 'rgba(var(--sg-text-rgb), 0.02)',
                    border: '1px solid rgba(var(--sg-text-rgb), 0.07)'
                  }}>
                  <div className="shrink-0 w-[110px]">
                    <p className="font-mono text-[10px]" style={{ color: 'var(--sg-gold)' }}>{row.chord}</p>
                    <p className="font-mono text-[9px] mt-1" style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>{row.freq}</p>
                  </div>
                  <div>
                    <p className="font-display text-[14px] italic" style={{ color: 'rgba(var(--sg-text-rgb), 0.75)' }}>{row.state}</p>
                    <p className="font-body text-[11px] mt-1" style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>{row.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="font-body text-[11px] mt-4 italic"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>
              The return shares Gamma with the mirror — because you do not return to who you were. Integration and insight are the same frequency.
            </p>
          </section>

          <div style={{ borderTop: '1px solid rgba(var(--sg-text-rgb), 0.07)' }} />

          {/* 10. THE PILLARS */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-2"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>The Pillars</label>
            <p className="font-body text-[12px] mb-6"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.38)' }}>
              The S-framework. A Weber-Rinne diagnostic for a life lived under pressure.
            </p>
            <div className="space-y-2">
              {[
                { n: '0.1', s: 'So', meaning: 'The spark, the sung note, the beginning of resonance' },
                { n: '1', s: 'Sex', meaning: 'Union, creation, duality expressed in harmony' },
                { n: '2', s: 'Self', meaning: 'Reflection, ego, individuality as a sacred structure' },
                { n: '3', s: 'Sever', meaning: 'Detachment, thresholds, the necessary ending' },
                { n: '4', s: 'Since', meaning: 'Time, memory, the logic of narrative and consequence' },
                { n: '5', s: 'Script', meaning: 'The encoded form — words, DNA, destiny written' },
                { n: '6', s: 'Silence', meaning: 'Listening, void, the canvas of awareness' },
                { n: '7', s: 'Sanskrit', meaning: 'Sacred sound, ancient language, infinity' },
                { n: '8', s: 'Symphony', meaning: 'Collective voice, orchestration, coexistence' },
                { n: '9', s: 'Sympathize', meaning: 'Empathy, shared feeling, the moral response' },
                { n: '10', s: 'Sanctum', meaning: 'Sacred interior, refuge, holy space within' },
                { n: '11', s: 'Soar', meaning: 'Ascension, transcendence, lightness beyond burden' },
                { n: '12', s: 'Spiral', meaning: 'Evolution, recursion, the shape of time and return' },
                { n: '13', s: 'Stayed', meaning: 'Not arrival. Not mastery. The act of remaining — through rupture, through what almost broke you. The guardrail that outlasts you is built from every moment you chose not to leave.' },
              ].map(item => (
                <div key={item.n} className="flex gap-4 items-start py-2"
                  style={{ borderBottom: '1px solid rgba(var(--sg-text-rgb), 0.05)' }}>
                  <span className="font-mono text-[10px] w-8 shrink-0 pt-[2px]"
                    style={{ color: item.n === '13' ? 'var(--sg-gold)' : 'rgba(var(--sg-text-rgb), 0.28)' }}>
                    {item.n}
                  </span>
                  <span className="font-display text-[15px] italic w-24 shrink-0"
                    style={{ color: item.n === '13' ? 'var(--sg-gold)' : 'rgba(var(--sg-text-rgb), 0.75)' }}>
                    {item.s}
                  </span>
                  <span className="font-body text-[12px] leading-relaxed"
                    style={{ color: item.n === '13' ? 'rgba(var(--sg-text-rgb), 0.65)' : 'rgba(var(--sg-text-rgb), 0.42)' }}>
                    {item.meaning}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: '1px solid rgba(var(--sg-text-rgb), 0.07)' }} />

          {/* 11. THE ALCHEMIST */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-4"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>The Alchemist</label>
            <div className="space-y-3">
              <p className="font-body text-[14px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.55)' }}>
                The strategist optimizes outcomes.
              </p>
              <p className="font-display text-[18px] italic" style={{ color: 'rgba(var(--sg-text-rgb), 0.85)' }}>
                The alchemist transforms: pressure into presence, complexity into coherence, grief into meaning.
              </p>
              <div className="mt-4 space-y-2">
                {[
                  'Becoming: "I\'m learning to save lives."',
                  'Being: "I\'m the one responsible."',
                  'Integration: "I build the structures that let this work stay human — for families and for me."'
                ].map((line, i) => (
                  <p key={i} className="font-body text-[13px]"
                    style={{ color: 'rgba(var(--sg-text-rgb), 0.5)' }}>{line}</p>
                ))}
              </div>
            </div>
          </section>

          <div style={{ borderTop: '1px solid rgba(var(--sg-text-rgb), 0.07)' }} />

          {/* 12. MY WAVELENGTH */}
          <section>
            <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-1"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>My Wavelength</label>
            <p className="font-body text-[12px] mb-6"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.38)' }}>
              your dynamical signature
            </p>

            <div className="space-y-5">
              <EditableField
                label="NATURAL FREQUENCY"
                value={profile?.natural_frequency || ''}
                placeholder="when and how you process best"
                onSave={(v) => saveField('natural_frequency', v)}
              />

              <EditableField
                label="COUPLING CONDITION"
                value={profile?.coupling_condition || ''}
                placeholder="what changes your internal frequency"
                onSave={(v) => saveField('coupling_condition', v)}
              />

              <div>
                <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-2"
                  style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>DOMINANT MODE</label>
                <p className="font-body text-[10px] mb-2"
                  style={{ color: 'rgba(var(--sg-text-rgb), 0.25)' }}>
                  which channel arrives first for you
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DOMINANT_MODES.map((mode) => {
                    const selected = profile?.dominant_mode === mode
                    return (
                      <button
                        key={mode}
                        onClick={() => saveField('dominant_mode', selected ? '' : mode)}
                        className="rounded-full px-3 py-1 font-body text-[10px] transition-all"
                        style={{
                          background: selected ? 'rgba(201, 169, 110, 0.12)' : 'rgba(var(--sg-text-rgb), 0.03)',
                          border: `1px solid ${selected ? 'rgba(201, 169, 110, 0.38)' : 'rgba(var(--sg-text-rgb), 0.08)'}`,
                          color: selected ? 'rgba(201, 169, 110, 0.85)' : 'rgba(var(--sg-text-rgb), 0.38)',
                        }}
                      >
                        {mode}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[8px] tracking-[0.15em] uppercase mb-2"
                  style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>K — COUPLING STRENGTH</label>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>protected</span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={profile?.k_value ?? 5}
                    onChange={(e) => saveField('k_value', parseInt(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: 'rgba(201, 169, 110, 0.7)' }}
                  />
                  <span className="font-mono text-[9px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>open</span>
                </div>
                <p className="font-mono text-[9px] mt-1"
                  style={{ color: 'rgba(var(--sg-text-rgb), 0.25)' }}>
                  how much you let others change your frequency
                </p>
                <p className="font-mono text-[9px] mt-1"
                  style={{ color: 'rgba(201, 169, 110, 0.5)' }}>
                  {kLabel(profile?.k_value ?? 5)}
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-8 pb-4">
            <span className="font-display text-[32px] animate-breathe inline-block"
              style={{ color: 'var(--sg-gold)' }}>s;</span>
          </div>

        </div>
      </div>
    </div>
  )
}
