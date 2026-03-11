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

// Section label style — deepened contrast
const sectionLabel = {
  fontSize: '9px',
  color: 'rgba(var(--sg-text-rgb), 0.50)',
  fontFamily: '"DM Mono", monospace',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
  fontWeight: 500,
}

// --- Section type 1: Aphorism / Axiom block ---
function AphorismSection({ id, title, children, className = '' }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mb-12 scroll-mt-20 ${className}`}>
      <div style={sectionLabel} className="mb-3">{title}</div>
      {children}
    </section>
  )
}

// --- Section type 2: Editorial / Rows ---
function EditorialSection({ id, title, children, className = '' }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mb-12 scroll-mt-20 ${className}`}>
      <div style={sectionLabel} className="mb-4">{title}</div>
      {children}
    </section>
  )
}

// --- Section type 3: Contained card block ---
function CardSection({ id, title, children, className = '' }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mb-12 scroll-mt-20 ${className}`}>
      <div style={sectionLabel} className="mb-4">{title}</div>
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
            className="block font-mono text-[9px] text-right transition-colors"
            style={{
              color: active === s.id ? 'rgba(201, 169, 110, 0.8)' : 'rgba(var(--sg-text-rgb), 0.28)',
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
      <div className="max-w-[540px] mx-auto px-5 sm:px-6 pb-28 md:pb-10 pt-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-[28px] sm:text-[32px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.88)' }}>
            The Map
          </h1>
          <p className="font-body text-[13px] mt-1" style={{ color: 'rgba(var(--sg-text-rgb), 0.48)' }}>
            Anchors for reading the days
          </p>
        </div>

        {/* 1. THE CORRECTION — Governing axiom */}
        <AphorismSection id="correction" title="THE CORRECTION">
          <p className="font-display text-[26px] sm:text-[31px] italic leading-snug" style={{ color: 'rgba(var(--sg-text-rgb), 0.90)' }}>
            &ldquo;Seek to understand <span className="text-sg-gold">;</span> and then to be understood.&rdquo;
          </p>
        </AphorismSection>

        {/* 2. THE GROUND — Grounding verse */}
        <AphorismSection id="ground" title="THE GROUND">
          <p className="font-display text-[18px] sm:text-[20px] italic leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.80)' }}>
            Be completely humble and gentle; be patient, bearing with one another in love.
          </p>
          <p className="font-mono text-[11px] mt-2.5" style={{ color: 'rgba(var(--sg-text-rgb), 0.48)' }}>
            Ephesians 4:2
          </p>
        </AphorismSection>

        {/* 3. TRUST — 2x2 card grid */}
        <CardSection id="trust" title="TRUST">
          <div className="grid grid-cols-2 gap-2.5">
            {['Candor', 'Competence', 'Care', 'Composure'].map((t) => (
              <div
                key={t}
                className="rounded-[12px] p-4 sm:p-5 text-center"
                style={{
                  background: 'rgba(var(--sg-text-rgb), 0.025)',
                  border: '1px solid rgba(var(--sg-text-rgb), 0.08)',
                }}
              >
                <span className="font-display text-[17px] sm:text-[18px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.78)' }}>
                  {t}
                </span>
              </div>
            ))}
          </div>
        </CardSection>

        {/* 4. THE TWO ARCS — Editorial split rows */}
        <EditorialSection id="arcs" title="THE TWO ARCS">
          <div className="py-1">
            <div className="flex items-baseline gap-4 py-3">
              <span className="font-mono text-[13px] font-medium shrink-0 w-[42px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.75)' }}>
                OB
              </span>
              <span className="font-body text-[13px] sm:text-[14px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.58)' }}>
                possibility &middot; allowing &middot; arrival
              </span>
            </div>
            <div
              className="border-t"
              style={{ borderColor: 'rgba(var(--sg-text-rgb), 0.07)' }}
            />
            <div className="flex items-baseline gap-4 py-3">
              <span className="font-mono text-[13px] font-medium shrink-0 w-[42px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.75)' }}>
                NICU
              </span>
              <span className="font-body text-[13px] sm:text-[14px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.58)' }}>
                becoming &middot; tools &middot; trajectory
              </span>
            </div>
          </div>
        </EditorialSection>

        {/* 5. THE TRINITY — 3-column horizontal */}
        <EditorialSection id="trinity" title="THE TRINITY">
          <div className="flex justify-center gap-8 sm:gap-10">
            {[
              { name: 'Pride', sub: 'Identity' },
              { name: 'Hope', sub: 'Direction' },
              { name: 'Conviction', sub: 'Action' },
            ].map((t) => (
              <div key={t.name} className="text-center">
                <div className="font-display text-[18px] sm:text-[20px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.85)' }}>
                  {t.name}
                </div>
                <div className="font-mono text-[10px] mt-0.5" style={{ color: '#c9a96e' }}>
                  = {t.sub}
                </div>
              </div>
            ))}
          </div>
        </EditorialSection>

        {/* 6. THE ARC — Biographical editorial list */}
        <EditorialSection id="arc" title="THE ARC (2022\u20132026)">
          <div className="space-y-3">
            {ARC_YEARS.map((a) => (
              <div key={a.year} className="flex gap-4 items-baseline">
                <span className="font-mono text-[11px] shrink-0 w-[38px]" style={{ color: '#c9a96e' }}>
                  {a.year}
                </span>
                <p className="font-body text-[14px] sm:text-[15px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.72)' }}>
                  {a.text}
                </p>
              </div>
            ))}
          </div>
        </EditorialSection>

        {/* 7. THE THREE GIFTS — Contained card blocks */}
        <CardSection id="gifts" title="THE THREE GIFTS">
          <div className="space-y-3">
            {[
              { name: 'Gold', text: 'Worth beyond outcomes. Dignity that survives Plan A.' },
              { name: 'Frankincense', text: 'Reverent uncertainty \u2014 hope that is not na\u00EFve. Leave room for unexpected good.' },
              { name: 'Myrrh', text: 'Truthful love \u2014 presence with numbered days. Not abandonment dressed as honesty.' },
            ].map((g) => (
              <div
                key={g.name}
                className="rounded-[12px] p-4 sm:p-5"
                style={{
                  background: 'rgba(var(--sg-text-rgb), 0.025)',
                  border: '1px solid rgba(var(--sg-text-rgb), 0.08)',
                }}
              >
                <div className="font-display text-[16px] sm:text-[17px] italic mb-1.5" style={{ color: 'rgba(201, 169, 110, 0.88)' }}>
                  {g.name}
                </div>
                <p className="font-body text-[13px] sm:text-[14px] leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.70)' }}>
                  {g.text}
                </p>
              </div>
            ))}
          </div>
        </CardSection>

        {/* 8. THE VOW — Liturgical centerpiece */}
        <section id="vow" className="scroll-mt-20 mt-16 mb-16">
          <div style={sectionLabel} className="mb-4">THE VOW</div>
          <div
            className="rounded-[16px] py-8 sm:py-10 px-6 sm:px-8"
            style={{
              background: 'rgba(201, 169, 110, 0.04)',
              border: '1px solid rgba(201, 169, 110, 0.15)',
            }}
          >
            <p
              className="font-display text-[24px] sm:text-[28px] italic leading-snug mb-6"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.92)' }}
            >
              &ldquo;Build rails so love does not require collapse.&rdquo;
            </p>
            <div
              className="border-t mb-5"
              style={{ borderColor: 'rgba(201, 169, 110, 0.12)' }}
            />
            <div className="space-y-2">
              <p className="font-body text-[13px] sm:text-[14px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.62)' }}>
                From shock absorber to engineer.
              </p>
              <p className="font-body text-[13px] sm:text-[14px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.62)' }}>
                Structure carries what one person should not carry alone.
              </p>
              <p className="font-body text-[13px] sm:text-[14px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.62)' }}>
                Presence without abandonment.
              </p>
            </div>
          </div>
        </section>

        {/* 9. THE SPIRAL — Editorial rows */}
        <EditorialSection id="spiral" title="THE SPIRAL">
          <p className="font-body text-[12px] mb-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.48)' }}>
            One complete cycle &mdash; center to departure to tension to mirror to return changed.
          </p>
          <div className="space-y-1.5">
            {SPIRAL_ROWS.map((row) => (
              <div
                key={row.chord}
                className="rounded-[10px] px-3 sm:px-3.5 py-2.5 flex items-baseline gap-2 sm:gap-3"
                style={{
                  background: 'rgba(var(--sg-text-rgb), 0.025)',
                  border: '1px solid rgba(var(--sg-text-rgb), 0.07)',
                }}
              >
                <span className="font-mono text-[10px] sm:text-[11px] shrink-0 w-[70px] sm:w-[88px]" style={{ color: 'rgba(201, 169, 110, 0.82)' }}>
                  {row.chord}
                </span>
                <span className="font-display text-[13px] sm:text-[14px] italic flex-1" style={{ color: 'rgba(var(--sg-text-rgb), 0.82)' }}>
                  {row.state}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] shrink-0 hidden sm:inline" style={{ color: 'rgba(var(--sg-text-rgb), 0.42)' }}>
                  {row.freq}
                </span>
                <span className="font-body text-[11px] shrink-0 hidden md:inline" style={{ color: 'rgba(var(--sg-text-rgb), 0.48)' }}>
                  {row.field}
                </span>
              </div>
            ))}
          </div>
          <p className="font-display italic text-[12px] mt-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.40)' }}>
            The return shares Gamma with the mirror &mdash; because you do not return to who you were. Insight and integration are the same frequency.
          </p>
        </EditorialSection>

        {/* 10. THE PILLARS — Doctrine list with culmination at 13 */}
        <EditorialSection id="pillars" title="THE PILLARS">
          <p className="font-mono text-[10px] mb-5" style={{ color: 'rgba(var(--sg-text-rgb), 0.42)' }}>
            A Weber-Rinne diagnostic for a life lived under pressure.
          </p>
          <div className="space-y-3">
            {PILLARS.map((p) => {
              const isLast = p.num === '13'
              if (isLast) {
                return (
                  <div
                    key={p.num}
                    className="mt-8 pt-6 rounded-[14px] px-5 sm:px-6 pb-6"
                    style={{
                      background: 'rgba(201, 169, 110, 0.04)',
                      border: '1px solid rgba(201, 169, 110, 0.15)',
                    }}
                  >
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-mono text-[14px] font-medium" style={{ color: '#c9a96e' }}>
                        {p.num}
                      </span>
                      <span className="font-display text-[22px] sm:text-[24px] italic" style={{ color: '#c9a96e' }}>
                        {p.name}
                      </span>
                    </div>
                    <p className="font-body text-[14px] sm:text-[15px] leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.75)' }}>
                      {p.desc}
                    </p>
                  </div>
                )
              }
              return (
                <div key={p.num} className="flex gap-3">
                  <span
                    className="font-mono text-[10px] shrink-0 w-[28px] text-right pt-0.5"
                    style={{ color: 'rgba(var(--sg-text-rgb), 0.38)' }}
                  >
                    {p.num}
                  </span>
                  <div>
                    <span
                      className="font-display text-[15px] sm:text-[16px] italic"
                      style={{ color: 'rgba(var(--sg-text-rgb), 0.68)' }}
                    >
                      {p.name}
                    </span>
                    <p
                      className="font-body text-[12px] sm:text-[13px] mt-0.5"
                      style={{ color: 'rgba(var(--sg-text-rgb), 0.52)' }}
                    >
                      {p.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </EditorialSection>

        {/* 11. THE ALCHEMIST — Coda */}
        <section id="alchemist" className="scroll-mt-20 mb-12">
          <div style={sectionLabel} className="mb-4">THE ALCHEMIST</div>
          <p className="font-body text-[14px] sm:text-[15px] mb-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.60)' }}>
            The strategist optimizes outcomes.
          </p>
          <p className="font-display text-[22px] sm:text-[26px] italic leading-snug mb-8" style={{ color: 'rgba(var(--sg-text-rgb), 0.90)' }}>
            The alchemist transforms: pressure into presence, complexity into coherence, grief into meaning.
          </p>
          <div
            className="rounded-[14px] p-5 sm:p-6 space-y-4"
            style={{
              background: 'rgba(var(--sg-text-rgb), 0.025)',
              border: '1px solid rgba(var(--sg-text-rgb), 0.08)',
            }}
          >
            {[
              { label: 'Becoming', text: 'I am learning to save lives.' },
              { label: 'Being', text: 'I am the one responsible.' },
              { label: 'Integration', text: 'I build the structures that let this work stay human \u2014 for families and for me.' },
            ].map((a) => (
              <div key={a.label} className="flex gap-3 items-baseline">
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] shrink-0 w-[72px] sm:w-[80px]" style={{ color: 'rgba(201, 169, 110, 0.72)' }}>
                  {a.label}
                </span>
                <p className="font-display italic text-[14px] sm:text-[15px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.78)' }}>
                  &ldquo;{a.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer semicolon */}
        <div className="text-center py-10">
          <span className="font-display text-[32px] text-sg-gold animate-breathe inline-block">;</span>
        </div>
      </div>
    </>
  )
}
