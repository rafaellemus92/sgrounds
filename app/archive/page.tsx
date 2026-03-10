'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Entry } from '@/lib/types'
import Nav from '@/components/Nav'
import ReflectionModal from '@/components/ReflectionModal'

export default function ArchivePage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selected, setSelected] = useState<Entry | null>(null)
  const [weaving, setWeaving] = useState(false)
  const [weave, setWeave] = useState<string | null>(null)
  const [showWeave, setShowWeave] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date_key', { ascending: false })
      if (data) setEntries(data as Entry[])
    }
    load()
  }, [])

  async function handleWeave() {
    if (entries.length < 5) return
    setWeaving(true)
    try {
      const res = await fetch('/api/weave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: entries.slice(0, 20) }),
      })
      const data = await res.json()
      setWeave(data.weave || null)
      setShowWeave(true)
    } catch {}
    setWeaving(false)
  }

  const closingWords = entries.filter((e) => e.closing_word).map((e) => e.closing_word)

  const labelStyle = {
    fontSize: '8px' as const,
    color: 'rgba(var(--sg-text-rgb), 0.34)',
    fontFamily: '"DM Mono", monospace',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    fontWeight: 500 as const,
  }

  return (
    <>
      <Nav />
      <div className="max-w-[820px] mx-auto px-4 pb-24 md:pb-8 pt-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-[28px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.7)' }}>
            The Book
          </h1>
          <p className="font-body text-[12px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.3)' }}>
            {entries.length} {entries.length === 1 ? 'page' : 'pages'} written
          </p>
        </div>

        {/* Closing words cloud */}
        {closingWords.length > 0 && (
          <div className="mb-8">
            <div style={labelStyle} className="mb-2">closing words</div>
            <div className="flex flex-wrap gap-1.5">
              {closingWords.map((w, i) => (
                <span
                  key={i}
                  className="font-display italic text-[13px] px-2"
                  style={{ color: `rgba(201, 169, 110, ${0.3 + (1 - i / closingWords.length) * 0.5})` }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weave CTA */}
        {entries.length >= 5 && (
          <button
            onClick={handleWeave}
            disabled={weaving}
            className="w-full mb-8 py-[10px] rounded-[18px] font-body text-[13px] tracking-wide transition-all"
            style={{
              background: 'rgba(201, 169, 110, 0.1)',
              border: '1.5px solid rgba(201, 169, 110, 0.25)',
              color: 'rgba(201, 169, 110, 0.7)',
            }}
          >
            {weaving ? 'Reading the weave…' : 'Read the Weave'}
          </button>
        )}

        {/* Entry cards */}
        <div className="space-y-3">
          {entries.map((entry) => (
            <button
              key={entry.date_key}
              onClick={() => setSelected(entry)}
              className="w-full text-left p-4 rounded-[12px] transition-all animate-slideUp"
              style={{
                background: 'rgba(var(--sg-text-rgb), 0.02)',
                border: '1px solid rgba(var(--sg-text-rgb), 0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px]" style={{ color: 'rgba(var(--sg-text-rgb), 0.35)' }}>
                  {entry.date_label || entry.date_key}
                </span>
                {entry.closing_word && (
                  <span className="font-display italic text-[12px] text-sg-gold">{entry.closing_word}</span>
                )}
              </div>
              {entry.passage && (
                <p className="font-body text-[13px] line-clamp-2" style={{ color: 'rgba(var(--sg-text-rgb), 0.5)' }}>
                  {entry.passage.slice(0, 60)}{entry.passage.length > 60 ? '…' : ''}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {entry.inspo_type && (
                  <span className="font-mono text-[8px] uppercase" style={{ color: 'rgba(var(--sg-text-rgb), 0.2)' }}>
                    {entry.inspo_type}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {entries.length === 0 && (
          <p className="text-center font-display italic text-[16px] mt-16" style={{ color: 'rgba(var(--sg-text-rgb), 0.25)' }}>
            No pages yet. Begin today.
          </p>
        )}
      </div>

      {/* Entry detail modal */}
      {selected && selected.reflection && (
        <ReflectionModal
          reflection={selected.reflection}
          weave={null}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Weave modal */}
      {showWeave && weave && (
        <ReflectionModal
          reflection={weave}
          weave={null}
          onClose={() => setShowWeave(false)}
        />
      )}
    </>
  )
}
