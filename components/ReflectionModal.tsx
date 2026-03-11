'use client'

interface ReflectionModalProps {
  reflection: string
  weave: string | null
  onClose: () => void
}

function parseReflection(text: string) {
  const sections: { label: string; content: string }[] = []
  const labels = ['SIGNAL', 'READING', 'AND', 'TOMORROW']
  let remaining = text

  for (const label of labels) {
    const marker = `${label}::`
    const idx = remaining.indexOf(marker)
    if (idx !== -1) {
      const afterMarker = remaining.slice(idx + marker.length)
      const nextLabel = labels.find((l) => l !== label && afterMarker.indexOf(`${l}::`) !== -1)
      let content: string
      if (nextLabel) {
        const nextIdx = afterMarker.indexOf(`${nextLabel}::`)
        content = afterMarker.slice(0, nextIdx).trim()
        remaining = afterMarker.slice(nextIdx)
      } else {
        content = afterMarker.trim()
        remaining = ''
      }
      sections.push({ label, content })
    }
  }
  return sections
}

function parseWeave(text: string) {
  const sections: { label: string; content: string }[] = []
  const labels = ['THREAD', 'DRIFT', 'RHYME', 'UNSAID']
  let remaining = text

  for (const label of labels) {
    const marker = `${label}::`
    const idx = remaining.indexOf(marker)
    if (idx !== -1) {
      const afterMarker = remaining.slice(idx + marker.length)
      const nextLabel = labels.find((l) => l !== label && afterMarker.indexOf(`${l}::`) !== -1)
      let content: string
      if (nextLabel) {
        const nextIdx = afterMarker.indexOf(`${nextLabel}::`)
        content = afterMarker.slice(0, nextIdx).trim()
        remaining = afterMarker.slice(nextIdx)
      } else {
        content = afterMarker.trim()
        remaining = ''
      }
      sections.push({ label, content })
    }
  }
  return sections
}

export default function ReflectionModal({ reflection, weave, onClose }: ReflectionModalProps) {
  const sections = parseReflection(reflection)
  const weaveSections = weave ? parseWeave(weave) : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(var(--sg-text-rgb), 0.06)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] max-h-[85vh] overflow-y-auto rounded-[16px] p-8 animate-slideUp"
        style={{
          background: 'var(--sg-bg)',
          border: '1px solid rgba(var(--sg-text-rgb), 0.08)',
          boxShadow: '0 24px 80px rgba(var(--sg-text-rgb), 0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {sections.map(({ label, content }) => {
          if (label === 'SIGNAL') {
            return (
              <div key={label} className="mb-6">
                <p
                  className="font-mono text-[13px] italic"
                  style={{ color: 'rgba(var(--sg-text-rgb), 0.50)' }}
                >
                  {content}
                </p>
              </div>
            )
          }
          if (label === 'READING') {
            return (
              <div key={label} className="mb-6">
                <p
                  className="font-display text-[18px] leading-relaxed"
                  style={{ color: 'rgba(var(--sg-text-rgb), 0.85)' }}
                >
                  {content}
                </p>
              </div>
            )
          }
          if (label === 'AND') {
            return (
              <div key={label} className="mb-6">
                <p
                  className="font-body text-[14px]"
                  style={{ color: 'rgba(201, 169, 110, 0.75)' }}
                >
                  {content}
                </p>
              </div>
            )
          }
          if (label === 'TOMORROW') {
            return (
              <div key={label} className="mb-6">
                <p
                  className="font-display text-[13px] italic"
                  style={{ color: 'rgba(var(--sg-text-rgb), 0.50)' }}
                >
                  {content}
                </p>
              </div>
            )
          }
          return null
        })}

        {weaveSections.length > 0 && (
          <details className="mt-4">
            <summary
              className="font-mono text-[9px] uppercase tracking-[0.15em] cursor-pointer mb-3"
              style={{ color: 'rgba(var(--sg-text-rgb), 0.42)' }}
            >
              The Weave
            </summary>
            <div className="space-y-4 animate-slideUp">
              {weaveSections.map(({ label, content }) => (
                <div key={label}>
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.15em]"
                    style={{ color: 'rgba(201, 169, 110, 0.5)' }}
                  >
                    {label}
                  </span>
                  <p
                    className="font-body text-[13px] mt-1"
                    style={{ color: 'rgba(var(--sg-text-rgb), 0.65)' }}
                  >
                    {content}
                  </p>
                </div>
              ))}
            </div>
          </details>
        )}

        <p
          className="text-center font-mono text-[9px] mt-6 cursor-pointer"
          style={{ color: 'rgba(var(--sg-text-rgb), 0.35)' }}
          onClick={onClose}
        >
          tap anywhere to close
        </p>
      </div>
    </div>
  )
}
