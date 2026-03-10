import Nav from '@/components/Nav'

const labelStyle = {
  fontSize: '8px',
  color: 'rgba(var(--sg-text-rgb), 0.34)',
  fontFamily: '"DM Mono", monospace',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
  fontWeight: 500,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div style={labelStyle} className="mb-3">
        {title}
      </div>
      {children}
    </div>
  )
}

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

        <Section title="THE CORRECTION">
          <p className="font-display text-[22px] italic leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.65)' }}>
            &ldquo;Seek to understand <span className="text-sg-gold">;</span> and then to be understood.&rdquo;
          </p>
        </Section>

        <Section title="THE GROUND">
          <p className="font-display text-[16px] italic leading-relaxed" style={{ color: 'rgba(var(--sg-text-rgb), 0.55)' }}>
            Be completely humble and gentle; be patient, bearing with one another in love.
          </p>
          <p className="font-mono text-[10px] mt-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.25)' }}>
            Ephesians 4:2
          </p>
        </Section>

        <Section title="TRUST">
          <div className="grid grid-cols-2 gap-3">
            {['Candor', 'Competence', 'Care', 'Control'].map((t) => (
              <div
                key={t}
                className="rounded-[12px] p-4 text-center"
                style={{
                  background: 'rgba(var(--sg-text-rgb), 0.02)',
                  border: '1px solid rgba(var(--sg-text-rgb), 0.06)',
                }}
              >
                <span className="font-display text-[16px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.55)' }}>
                  {t}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="THE TWO ARCS">
          <div className="grid grid-cols-1 gap-3">
            <div
              className="rounded-[12px] p-5"
              style={{
                background: 'rgba(var(--sg-text-rgb), 0.02)',
                border: '1px solid rgba(var(--sg-text-rgb), 0.06)',
              }}
            >
              <div className="font-display text-[18px] mb-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.6)' }}>OB</div>
              <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>
                possibility &middot; allowing &middot; arrival
              </p>
            </div>
            <div
              className="rounded-[12px] p-5"
              style={{
                background: 'rgba(var(--sg-text-rgb), 0.02)',
                border: '1px solid rgba(var(--sg-text-rgb), 0.06)',
              }}
            >
              <div className="font-display text-[18px] mb-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.6)' }}>NICU</div>
              <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.4)' }}>
                becoming &middot; tools &middot; trajectory
              </p>
            </div>
          </div>
        </Section>

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
      </div>
    </>
  )
}
