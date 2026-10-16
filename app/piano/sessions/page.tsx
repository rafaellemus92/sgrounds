'use client';

// The tapestry — session archive.
//
// Lists every finished practice session for the signed-in player (or the
// local-only archive on this device, when Supabase isn't configured or the
// player isn't signed in). Each row surfaces the headline numbers that
// matter for seeing patterns across sessions: accuracy, mean r (phase-
// coupling strength), PSD slope (how "in-the-pocket" the IOI series was),
// and tempo.
//
// Framing from CLAUDE.md: the archive is the Norns' tapestry — every
// session is a thread, and the pattern across threads is the wyrd being
// revealed. Keep the copy in that register.

import { useEffect, useState } from 'react';
import {
  deleteSession,
  isSupabaseConfigured,
  listSessions,
  type SessionRow,
} from '@/lib/piano/persistence';

export default function SessionsPage() {
  const [rows, setRows] = useState<SessionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // Lighthouse reflection state.
  const [reflection, setReflection] = useState<string | null>(null);
  const [reflecting, setReflecting] = useState(false);
  const [reflectError, setReflectError] = useState<string | null>(null);

  useEffect(() => {
    listSessions(100)
      .then(setRows)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
        setRows([]);
      });
  }, []);

  async function handleDelete(id: string) {
    setRemoving(id);
    const ok = await deleteSession(id);
    if (ok && rows) setRows(rows.filter(r => r.id !== id));
    setRemoving(null);
  }

  async function handleAskLighthouse() {
    if (!rows || rows.length === 0) return;
    setReflecting(true);
    setReflectError(null);
    setReflection(null);
    try {
      const res = await fetch('/api/piano/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setReflectError(data.error ?? `HTTP ${res.status}`);
      } else {
        setReflection(data.reflection ?? null);
      }
    } catch (e) {
      setReflectError(e instanceof Error ? e.message : String(e));
    } finally {
      setReflecting(false);
    }
  }

  // Count rows that have any reflection content — the Lighthouse needs
  // at least one, but it reads the math on empty-reflection rows too.
  const reflectedCount = rows?.filter(r => r.intention || r.passage || r.last_word || r.mood).length ?? 0;

  return (
    <main className="min-h-screen bg-[#09090a] text-white/90">
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl leading-none md:text-4xl">
              the tapestry<span className="text-[#c9a96e]">.</span>
            </h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-white/40">
              every session is a thread · wyrd is the pattern across threads
            </p>
          </div>
          <nav className="flex items-center gap-3 font-mono text-xs text-white/60">
            <a href="/piano" className="hover:text-white/90">← trainer</a>
            <a href="/" className="hover:text-white/90">sgrounds</a>
          </nav>
        </header>

        {!isSupabaseConfigured() && (
          <div className="mb-4 rounded border border-amber-400/20 bg-amber-900/10 p-3 font-mono text-xs text-amber-100/80">
            Supabase isn&apos;t configured on this deployment — sessions below are
            held in this browser only. Set NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY and sign in to weave them into
            the server tapestry.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded bg-red-900/30 p-3 font-mono text-xs text-red-200">
            {error}
          </div>
        )}

        {rows === null && (
          <div className="font-mono text-xs text-white/40">reading the tapestry…</div>
        )}

        {/* Lighthouse reflection — reads across the whole archive and names one pattern. */}
        {rows !== null && rows.length > 0 && (
          <section className="mb-5 rounded-lg border border-[#c9a96e]/20 bg-[#c9a96e]/[0.04] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl leading-none">the Lighthouse</h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/50">
                  reads across your threads · names one pattern · {reflectedCount} of {rows.length} sessions have reflection
                </p>
              </div>
              <button
                onClick={handleAskLighthouse}
                disabled={reflecting}
                className="rounded border border-[#c9a96e]/50 bg-[#c9a96e]/10 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-[#c9a96e] transition hover:bg-[#c9a96e]/20 disabled:opacity-50"
              >
                {reflecting ? 'reading the tapestry…' : reflection ? 'read again' : 'ask the Lighthouse'}
              </button>
            </div>
            {reflectError && (
              <p className="mt-3 font-mono text-xs text-red-300">
                lighthouse unreachable: {reflectError}
              </p>
            )}
            {reflection && (
              <blockquote className="mt-3 animate-fortuneIn whitespace-pre-wrap border-l-2 border-[#c9a96e]/60 pl-3 font-display text-base leading-relaxed text-white/85">
                {reflection}
              </blockquote>
            )}
          </section>
        )}

        {rows !== null && rows.length === 0 && (
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-8 text-center">
            <p className="font-mono text-sm text-white/50">
              no threads yet. return to <a href="/piano" className="text-[#c9a96e] underline">the trainer</a> and begin.
            </p>
          </div>
        )}

        {rows !== null && rows.length > 0 && (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-lg leading-tight">
                      {row.piece_title ?? row.piece_id}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/40">
                      {new Date(row.started_at).toLocaleString()} ·
                      {row.id.startsWith('local-') ? ' local' : ' remote'}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-x-5 gap-y-1 font-mono text-xs tabular-nums">
                    <Metric label="acc" value={`${row.accuracy_pct.toFixed(0)}%`} />
                    <Metric
                      label="r̄"
                      value={row.mean_r.toFixed(2)}
                      highlight={row.mean_r >= 0.8}
                    />
                    <Metric label="slope" value={row.psd_slope.toFixed(2)} />
                    <Metric label="bpm" value={row.tempo_bpm.toFixed(0)} />
                  </div>
                  <button
                    onClick={() => handleDelete(row.id)}
                    disabled={removing === row.id}
                    className="rounded border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                  >
                    {removing === row.id ? '…' : 'unweave'}
                  </button>
                </div>
                <RSparkline series={row.r_series} />
                <ReflectionDisplay row={row} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

// Inline reflection — immediate, next to the metrics. Hidden when the row
// has no reflection content; this keeps the archive dense without hiding
// what's there.
function ReflectionDisplay({ row }: { row: SessionRow }) {
  const hasAny = row.intention || row.passage || row.last_word || row.mood;
  if (!hasAny) return null;
  return (
    <div className="mt-3 border-t border-white/5 pt-3 text-sm leading-snug text-white/70">
      {row.intention && (
        <div className="mb-2">
          <span className="mr-2 font-mono text-[9px] uppercase tracking-wider text-white/35">brought</span>
          <span className="italic text-white/55">{row.intention}</span>
        </div>
      )}
      {row.passage && (
        <p className="mb-2 whitespace-pre-wrap text-white/80">{row.passage}</p>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider">
        {row.last_word && (
          <span className="text-[#c9a96e]">{row.last_word}</span>
        )}
        {row.mood && (
          <span className="text-white/45">· {row.mood}</span>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
      <span className={highlight ? 'text-[#c9a96e]' : 'text-white/80'}>{value}</span>
    </div>
  );
}

// Inline SVG sparkline of the r(t) trace. 160×24, no axes — the shape alone
// communicates "did the phase stay locked or did it drift?".
function RSparkline({ series }: { series: { t: number; r: number }[] }) {
  if (!series || series.length < 2) return null;
  const w = 160;
  const h = 24;
  const tMin = series[0].t;
  const tMax = series[series.length - 1].t;
  const tRange = tMax - tMin || 1;
  const points = series
    .map((p) => {
      const x = ((p.t - tMin) / tRange) * w;
      const y = h - p.r * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg className="mt-3" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <line x1={0} x2={w} y1={h - 0.8 * h} y2={h - 0.8 * h} stroke="#c9a96e" strokeDasharray="2 2" strokeOpacity={0.35} strokeWidth={0.5} />
      <polyline points={points} fill="none" stroke="#c9a96e" strokeWidth={1.2} strokeOpacity={0.8} />
    </svg>
  );
}
