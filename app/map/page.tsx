import Nav from '@/components/Nav'

const labelStyle = {
  fontSize: '8px',
  color: 'rgba(var(--sg-text-rgb), 0.34)',
  fontFamily: '"DM Mono", monospace',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
  fontWeight: 500,
}

const cardStyle = {
  background: 'rgba(var(--sg-text-rgb), 0.02)',
  border: '1px solid rgba(var(--sg-text-rgb), 0.06)',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div style={labelStyle} className="mb-3">{title}</div>
      {children}
    </div>
  )
}

const SPIRAL = [
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
  { year: '2026', text: 'Structure replaces overextension. Build rails so love doesn\u2019t require collapse.' },
]

export default function MapPage() {
  return (
    <>
      <Nav />
      <div className="max-w-[520px] mx-auto px-4 pb-24 md:pb-8 pt-4">
        <div className="text-center mb-10">
          <h1 className="font-display text-[28px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.7)' }}>
            The Map
          </h1>
          <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>
            Anchors for reading the days
          </p>
        </div>

        {/* 1. THE CORRECTION */}
        <Section title="THE CORRECTION">
          <p className="font-display text-[22px] italic leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.65)' }}>
            &ldquo;Seek to understand <span className="text-sg-gold">;</span> and then to be understood.&rdquo;
          </p>
        </Section>

        {/* 2. THE GROUND */}
        <Section title="THE GROUND">
          <p className="font-display text-[16px] italic leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.55)' }}>
            Be completely humble and gentle; be patient, bearing with one another in love.
          </p>
          <p className="font-mono text-[10px] mt-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.25)' }}>
            Ephesians 4:2
          </p>
        </Section>

        {/* 3. TRUST */}
        <Section title="TRUST">
          <div className="grid grid-cols-2 gap-3">
            {['Candor', 'Competence', 'Care', 'Control'].map((t) => (
              <div key={t} className="rounded-[12px] p-4 text-center" style={cardStyle}>
                <span className="font-display text-[16px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.55)' }}>
                  {t}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. THE TWO ARCS */}
        <Section title="THE TWO ARCS">
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-[12px] p-5" style={cardStyle}>
              <div className="font-display text-[18px] mb-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.6)' }}>OB</div>
              <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>
                possibility &middot; allowing &middot; arrival
              </p>
            </div>
            <div className="rounded-[12px] p-5" style={cardStyle}>
              <div className="font-display text-[18px] mb-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.6)' }}>NICU</div>
              <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>
                becoming &middot; tools &middot; trajectory
              </p>
            </div>
          </div>
        </Section>

        {/* 5. THE TRINITY */}
        <Section title="THE TRINITY">
          <div className="flex justify-center gap-8">
            {[
              { name: 'Pride', sub: 'Identity' },
              { name: 'Hope', sub: 'Direction' },
              { name: 'Conviction', sub: 'Action' },
            ].map((t) => (
              <div key={t.name} className="text-center">
                <div className="font-display text-[18px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.6)' }}>
                  {t.name}
                </div>
                <div className="font-mono text-[9px] mt-0.5" style={{ color: 'rgba(201, 169, 110, 0.5)' }}>
                  = {t.sub}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. THE ARC */}
        <Section title="THE ARC (2022\u20132026)">
          <div className="space-y-3">
            {ARC_YEARS.map((a) => (
              <div key={a.year} className="flex gap-4">
                <span className="font-mono text-[12px] shrink-0 w-[40px]" style={{ color: 'rgba(201, 169, 110, 0.6)' }}>
                  {a.year}
                </span>
                <p className="font-display text-[14px] italic" style={{ color: 'rgba(var(--sg-text-rgb), 0.5)' }}>
                  {a.text}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* 7. THE THREE GIFTS */}
        <Section title="THE THREE GIFTS">
          <div className="space-y-4">
            {[
              { name: 'Gold', text: 'Worth beyond outcomes. Dignity that survives Plan A.' },
              { name: 'Frankincense', text: 'Reverent uncertainty \u2014 hope that isn\u2019t na\u00EFve. Leave room for unexpected good.' },
              { name: 'Myrrh', text: 'Truthful love \u2014 presence with numbered days. Not abandonment dressed as honesty.' },
            ].map((g) => (
              <div key={g.name} className="rounded-[12px] p-4" style={cardStyle}>
                <div className="font-display text-[16px] mb-1" style={{ color: 'rgba(201, 169, 110, 0.7)' }}>
                  {g.name}
                </div>
                <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.45)' }}>
                  {g.text}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* 8. THE VOW */}
        <Section title="THE VOW">
          <p className="font-display text-[18px] italic leading-relaxed mb-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.6)' }}>
            &ldquo;Build rails so love doesn&rsquo;t require collapse.&rdquo;
          </p>
          <div className="space-y-2">
            <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>
              From being a shock absorber &rarr; to being an engineer.
            </p>
            <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>
              Structure carries what one person shouldn&rsquo;t carry alone.
            </p>
            <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>
              Compassion without collapse. Presence without abandonment.
            </p>
          </div>
        </Section>

        {/* 9. THE SPIRAL */}
        <Section title="THE SPIRAL">
          <p className="font-body text-[10px] mb-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>
            Five-chord progression. Each chord maps to a state, frequency, and sgrounds field.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  {['Chord', 'State', 'Frequency', 'sgrounds field'].map((h) => (
                    <th key={h} className="font-mono text-[8px] uppercase tracking-[0.1em] pb-2 pr-3" style={{ color: 'rgba(var(--sg-text-rgb), 0.25)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SPIRAL.map((row) => (
                  <tr key={row.chord} className="border-t" style={{ borderColor: 'rgba(var(--sg-text-rgb), 0.04)' }}>
                    <td className="font-mono text-[11px] py-2 pr-3" style={{ color: 'rgba(201, 169, 110, 0.65)' }}>{row.chord}</td>
                    <td className="font-body text-[11px] py-2 pr-3" style={{ color: 'rgba(var(--sg-text-rgb), 0.45)' }}>{row.state}</td>
                    <td className="font-mono text-[10px] py-2 pr-3" style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>{row.freq}</td>
                    <td className="font-display italic text-[11px] py-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>{row.field}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-display italic text-[10px] mt-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.25)' }}>
            The return shares Gamma with the mirror &mdash; because you do not return to who you were. Integration and insight are the same frequency.
          </p>
        </Section>

        {/* 10. THE PILLARS */}
        <Section title="THE PILLARS">
          <p className="font-body text-[10px] mb-1" style={{ color: 'rgba(var(--sg-text-rgb), 0.28)' }}>
            The S-framework.
          </p>
          <p className="font-mono text-[9px] mb-5" style={{ color: 'rgba(var(--sg-text-rgb), 0.2)' }}>
            A Weber-Rinne diagnostic for a life lived under pressure.
          </p>
          <div className="space-y-3">
            {PILLARS.map((p) => {
              const isLast = p.num === '13'
              return (
                <div key={p.num} className="flex gap-3">
                  <span
                    className="font-mono text-[11px] shrink-0 w-[28px] text-right"
                    style={{ color: isLast ? '#c9a96e' : 'rgba(var(--sg-text-rgb), 0.2)' }}
                  >
                    {p.num}
                  </span>
                  <div>
                    <span
                      className="font-display text-[15px]"
                      style={{ color: isLast ? '#c9a96e' : 'rgba(var(--sg-text-rgb), 0.5)' }}
                    >
                      {p.name}
                    </span>
                    <p
                      className="font-body text-[11px] mt-0.5"
                      style={{ color: isLast ? 'rgba(201, 169, 110, 0.6)' : 'rgba(var(--sg-text-rgb), 0.3)' }}
                    >
                      {p.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* 11. THE ALCHEMIST */}
        <Section title="THE ALCHEMIST">
          <p className="font-body text-[12px] mb-4" style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>
            The strategist optimizes outcomes. The alchemist transforms: pressure into presence, complexity into coherence, grief into meaning.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Becoming', text: 'I\u2019m learning to save lives.' },
              { label: 'Being', text: 'I\u2019m the one responsible.' },
              { label: 'Integration', text: 'I build the structures that let this work stay human \u2014 for families and for me.' },
            ].map((a) => (
              <div key={a.label} className="flex gap-3 items-baseline">
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] shrink-0 w-[80px]" style={{ color: 'rgba(201, 169, 110, 0.5)' }}>
                  {a.label}
                </span>
                <p className="font-display italic text-[14px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.5)' }}>
                  &ldquo;{a.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer semicolon */}
        <div className="text-center py-8">
          <span className="font-display text-[40px] text-sg-gold animate-breathe inline-block">;</span>
        </div>
      </div>
    </>
  )
}
