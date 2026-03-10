'use client'

import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'

const SECTIONS = [
  { id: 'correction', label: 'Correction' },
  { id: 'ground', label: 'Ground' },
  { id: 'trust', label: 'Trust' },
  { id: 'arcs', label: 'Arcs' },
  { id: 'trinity', label: 'Trinity' },
  { id: 'arc', label: 'Arc' },
  { id: 'gifts', label: 'Gifts' },
  { id: 'vow', label: 'Vow' },
  { id: 'spiral', label: 'Spiral' },
  { id: 'pillars', label: 'Pillars' },
  { id: 'alchemist', label: 'Alchemist' },
]

const SPIRAL_ROWS = [
  { chord: 'F\u266Fmin11', state: 'I am (Center)', freq: 'Beta ~15Hz', field: 'The passage' },
  { chord: 'Bsus2', state: 'I go out (Departure)', freq: 'Beta ~18Hz', field: 'The image' },
  { chord: 'Dmaj7(\u266F11)', state: 'I see the other (Tension)', freq: 'High Beta ~25Hz', field: 'What echoed it' },
  { chord: 'E7(no5)', state: 'I hear the question (Mirror)', freq: 'Gamma ~40Hz', field: 'The And' },
  { chord: 'F\u266F(add9)/A', state: 'I return, changed (Return)', freq: 'Gamma ~40Hz', field: 'Closing word' },
]

const PILLARS = [
  { num: '0.1', name: 'So', desc: 'The spark, the sung note, the beginning of resonance' },
  { num: '1', name: 'Sex', desc: 'Union, creation, duality expressed in harmony' },
  { num: '2', name: 'Self', desc: 'Reflection, ego, individuality as a sacred structure' },
  { num: '3', name: 'Sever', desc: 'Detachment, thresholds, the necessary ending' },
  { num: '4', name: 'Since', desc: 'Time, memory, the logic of narrative and consequence' },
  { num: '5', name: 'Script', desc: 'The encoded form \u2014 words, DNA, destiny written' },
  { num: '6', name: 'Silence', desc: 'Listening, void, the canvas of awareness' },
  { num: '7', name: 'Sanskrit', desc: 'Sacred sound, ancient language, infinity' },
  { num: '8', name: 'Symphony', desc: 'Collective voice, orchestration, coexistence' },
  { num: '9', name: 'Sympathize', desc: 'Empathy, shared feeling, the moral response' },
  { num: '10', name: 'Sanctum', desc: 'Sacred interior, refuge, holy space within' },
  { num: '11', name: 'Soar', desc: 'Ascension, transcendence, lightness beyond burden' },
  { num: '12', name: 'Spiral', desc: 'Evolution, recursion, the shape of time and return' },
  { num: '13', name: 'Stayed', desc: 'Not arrival. Not mastery. The act of remaining \u2014 through rupture, through what almost broke you. The guardrail that outlasts you is built from every moment you chose not to leave.' },
]

const ARC_YEARS = [
  { year: '2022', text: 'Grief entered the curriculum.' },
  { year: '2023', text: 'Momentum meets limitation \u2014 control meets constraint.' },
  { year: '2024', text: 'Kairos, not chronos. Love coexists with grief.' },
  { year: '2025', text: 'Expansion across thresholds. Presence as therapeutic as intervention.' },
  { year: '2026', text: 'Structure replaces overextension. Build rails so love does not require collapse.' },
]

// Shared styles — deepened contrast per design review
const label = {
  fontSize: '8px',
  color: 'rgba(var(--sg-text-rgb), 0.40)',
  fontFamily: '"DM Mono", monospace',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
  fontWeight: 500,
}

function Section({ id, title, children, className = '' }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mb-10 scroll-mt-20 ${className}`}>
      <div style={label} className="mb-2.5">{title}</div>
      {children}
    </section>
  )
}

function SidebarNav({ active }: { active: string }) {
  return (
    <nav className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-40">
      <div className="space-y-1.5">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="block font-mono text-[8px] text-right transition-colors"
            style={{
              color: active === s.id ? 'rgba(201, 169, 110, 0.75)' : 'rgba(var(--sg-text-rgb), 0.18)',
              letterSpacing: '0.08em',
            }}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

export default function MapPage() {
  const [activeSection, setActiveSection] = useState('correction')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Nav />
      <SidebarNav active={activeSection} />
      <div className="max-w-[520px] mx-auto px-4 pb-24 md:pb-8 pt-4">
        <div className="text-center mb-10">
          <h1 className="font-display text-[28px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.78)' }}>
            The Map
          </h1>
          <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.36)' }}>
            Anchors for reading the days
          </p>
        </div>

        {/* 1. THE CORRECTION — Aphorism block */}
        <Section id="correction" title="THE CORRECTION">
          <p className="font-display text-[31px] italic leading-snug" style={{ color: 'rgba(var(--sg-text-rgb), 0.88)' }}>
            &ldquo;Seek to understand <span className="text-sg-gold">;</span> and then to be understood.&rdquo;
          </p>
        </Section>

        {/* 2. THE GROUND — Aphorism block */}
        <Section id="ground" title="THE GROUND">
          <p className="font-display text-[20px] italic leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.75)' }}>
            Be completely humble and gentle; be patient, bearing with one another in love.
          </p>
          <p className="font-mono text-[11px] mt-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.40)' }}>
            Ephesians 4:2
          </p>
        </Section>

        {/* 3. TRUST — 2x2 card grid */}
        <Section id="trust" title="TRUST">
          <div className="grid grid-cols-2 gap-2.5">
            {['Candor', 'Competence', 'Care', 'Composure'].map((t) => (
              <div
                key={t}
                className="rounded-[12px] p-4 text-center"
                style={{
                  background: 'rgba(var(--sg-text-rgb), 0.024)',
                  border: '1px solid rgba(var(--sg-text-rgb), 0.07)',
                }}
              >
                <span className="font-display text-[18px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.72)' }}>
                  {t}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. THE TWO ARCS — Editorial split rows */}
        <Section id="arcs" title="THE TWO ARCS">
          <div className="py-1">
            <div className="flex items-baseline gap-4 py-3">
              <span className="font-mono text-[13px] font-medium shrink-0 w-[42px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.70)' }}>
                OB
              </span>
              <span className="font-body text-[13px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.45)' }}>
                possibility &middot; allowing &middot; arrival
              </span>
            </div>
            <div
              className="border-t"
              style={{ borderColor: 'rgba(var(--sg-text-rgb), 0.06)' }}
            />
            <div className="flex items-baseline gap-4 py-3">
              <span className="font-mono text-[13px] font-medium shrink-0 w-[42px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.70)' }}>
                NICU
              </span>
              <span className="font-body text-[13px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.45)' }}>
                becoming &middot; tools &middot; trajectory
              </span>
            </div>
          </div>
        </Section>

        {/* 5. THE TRINITY — 3-column horizontal */}
        <Section id="trinity" title="THE TRINITY">
          <div className="flex justify-center gap-10">
            {[
              { name: 'Pride', sub: 'Identity' },
              { name: 'Hope', sub: 'Direction' },
              { name: 'Conviction', sub: 'Action' },
            ].map((t) => (
              <div key={t.name} className="text-center">
                <div className="font-display text-[20px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.80)' }}>
                  {t.name}
                </div>
                <div className="font-mono text-[10px] mt-0.5" style={{ color: '#c9a96e' }}>
                  = {t.sub}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. THE ARC — Editorial list */}
        <Section id="arc" title="THE ARC (2022\u20132026)">
          <div className="space-y-2.5">
            {ARC_YEARS.map((a) => (
              <div key={a.year} className="flex gap-4 items-baseline">
                <span className="font-mono text-[11px] shrink-0 w-[38px]" style={{ color: '#c9a96e' }}>
                  {a.year}
                </span>
                <p className="font-body text-[14px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.65)' }}>
                  {a.text}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* 7. THE THREE GIFTS — Stacked cards */}
        <Section id="gifts" title="THE THREE GIFTS">
          <div className="space-y-2.5">
            {[
              { name: 'Gold', text: 'Worth beyond outcomes. Dignity that survives Plan A.' },
              { name: 'Frankincense', text: 'Reverent uncertainty \u2014 hope that is not na\u00EFve. Leave room for unexpected good.' },
              { name: 'Myrrh', text: 'Truthful love \u2014 presence with numbered days. Not abandonment dressed as honesty.' },
            ].map((g) => (
              <div
                key={g.name}
                className="rounded-[12px] p-4"
                style={{
                  background: 'rgba(var(--sg-text-rgb), 0.024)',
                  border: '1px solid rgba(var(--sg-text-rgb), 0.07)',
                }}
              >
                <div className="font-display text-[16px] italic mb-1" style={{ color: 'rgba(201, 169, 110, 0.85)' }}>
                  {g.name}
                </div>
                <p className="font-body text-[13px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.62)' }}>
                  {g.text}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* 8. THE VOW — Liturgical centerpiece */}
        <Section id="vow" title="THE VOW" className="mt-14 mb-14">
          <p
            className="font-display text-[27px] italic leading-snug mb-6"
            style={{ color: 'rgba(var(--sg-text-rgb), 0.88)', maxWidth: 520 }}
          >
            &ldquo;Build rails so love does not require collapse.&rdquo;
          </p>
          <div className="space-y-1.5">
            <p className="font-body text-[13px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.50)' }}>
              From shock absorber to engineer.
            </p>
            <p className="font-body text-[13px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.50)' }}>
              Structure carries what one person should not carry alone.
            </p>
            <p className="font-body text-[13px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.50)' }}>
              Presence without abandonment.
            </p>
          </div>
        </Section>

        {/* 9. THE SPIRAL — Stacked cards */}
        <Section id="spiral" title="THE SPIRAL">
          <p className="font-body text-[11px] mb-3" style={{ color: 'rgba(var(--sg-text-rgb), 0.38)' }}>
            One complete cycle &mdash; center to departure to tension to mirror to return changed.
          </p>
          <div className="space-y-1.5">
            {SPIRAL_ROWS.map((row) => (
              <div
                key={row.chord}
                className="rounded-[10px] px-3.5 py-2.5 flex items-baseline gap-3"
                style={{
                  background: 'rgba(var(--sg-text-rgb), 0.024)',
                  border: '1px solid rgba(var(--sg-text-rgb), 0.06)',
                }}
              >
                <span className="font-mono text-[11px] shrink-0 w-[88px]" style={{ color: 'rgba(201, 169, 110, 0.78)' }}>
                  {row.chord}
                </span>
                <span className="font-display text-[14px] italic flex-1" style={{ color: 'rgba(var(--sg-text-rgb), 0.78)' }}>
                  {row.state}
                </span>
                <span className="font-mono text-[10px] shrink-0" style={{ color: 'rgba(var(--sg-text-rgb), 0.35)' }}>
                  {row.freq}
                </span>
                <span className="font-body text-[11px] shrink-0 hidden sm:inline" style={{ color: 'rgba(var(--sg-text-rgb), 0.42)' }}>
                  {row.field}
                </span>
              </div>
            ))}
          </div>
          <p className="font-display italic text-[12px] mt-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.30)' }}>
            The return shares Gamma with the mirror &mdash; because you do not return to who you were. Insight and integration are the same frequency.
          </p>
        </Section>

        {/* 10. THE PILLARS — Doctrine list */}
        <Section id="pillars" title="THE PILLARS">
          <p className="font-mono text-[9px] mb-5" style={{ color: 'rgba(var(--sg-text-rgb), 0.28)' }}>
            A Weber-Rinne diagnostic for a life lived under pressure.
          </p>
          <div className="space-y-2.5">
            {PILLARS.map((p) => {
              const isLast = p.num === '13'
              return (
                <div
                  key={p.num}
                  className="flex gap-3"
                  style={isLast ? { marginTop: '2rem' } : undefined}
                >
                  <span
                    className="font-mono text-[10px] shrink-0 w-[28px] text-right pt-0.5"
                    style={{ color: isLast ? '#c9a96e' : 'rgba(var(--sg-text-rgb), 0.30)' }}
                  >
                    {p.num}
                  </span>
                  <div>
                    <span
                      className="font-display text-[15px] italic"
                      style={{ color: isLast ? '#c9a96e' : 'rgba(var(--sg-text-rgb), 0.58)' }}
                    >
                      {p.name}
                    </span>
                    <p
                      className="font-body text-[12px] mt-0.5"
                      style={{ color: isLast ? 'rgba(var(--sg-text-rgb), 0.65)' : 'rgba(var(--sg-text-rgb), 0.44)' }}
                    >
                      {p.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* 11. THE ALCHEMIST — Editorial coda */}
        <Section id="alchemist" title="THE ALCHEMIST">
          <p className="font-body text-[14px] mb-3" style={{ color: 'rgba(var(--sg-text-rgb), 0.55)' }}>
            The strategist optimizes outcomes.
          </p>
          <p className="font-display text-[21px] italic leading-snug mb-6" style={{ color: 'rgba(var(--sg-text-rgb), 0.85)' }}>
            The alchemist transforms: pressure into presence, complexity into coherence, grief into meaning.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Becoming', text: 'I am learning to save lives.' },
              { label: 'Being', text: 'I am the one responsible.' },
              { label: 'Integration', text: 'I build the structures that let this work stay human \u2014 for families and for me.' },
            ].map((a) => (
              <div key={a.label} className="flex gap-3 items-baseline">
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] shrink-0 w-[80px]" style={{ color: 'rgba(201, 169, 110, 0.65)' }}>
                  {a.label}
                </span>
                <p className="font-display italic text-[15px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.70)' }}>
                  &ldquo;{a.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer semicolon */}
        <div className="text-center py-8">
          <span className="font-display text-[32px] text-sg-gold animate-breathe inline-block">;</span>
        </div>
      </div>
    </>
  )
}
