'use client';

// Post-session modal. Four panels:
//   1. Pitch-class histogram (LH, RH, combined)
//   2. Onset IOI PSD (log-log) with fitted slope
//   3. r(t) time series with bar-boundary marks
//   4. Per-bar phase-lock heatmap
//
// Reuses the math modules in /lib/piano. No recharts required for these
// plots — we draw everything directly on SVG/canvas for full control.

import { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { SessionResult } from '@/lib/piano/types';
import type { SaveOutcome } from '@/lib/piano/persistence';
import {
  histogramFromEvents,
  PITCH_CLASS_LABELS,
} from '@/lib/piano/pitchHistogram';
import { interOnsetIntervals, welchPSD } from '@/lib/piano/onsetPSD';

export interface SessionAnalyticsProps {
  result: SessionResult;
  onClose: () => void;
  piecesTitle?: string;
  saveOutcome?: SaveOutcome | null;
}

const LH_COLOR = '#60a5fa';
const RH_COLOR = '#f59e0b';
const GOLD = '#c9a96e';
const RED = '#ef4444';

export default function SessionAnalytics({ result, onClose, piecesTitle, saveOutcome }: SessionAnalyticsProps) {
  const { histData, psdData, psdSlope, rSeriesData, heatmapData } = useMemo(() => {
    // ── Panel 1: pitch histogram ───────────────────────────────────────
    const h = histogramFromEvents(result.events, result.durationSec);
    const histData = PITCH_CLASS_LABELS.map((label, i) => ({
      label,
      lh: h.lh.byClass[i],
      rh: h.rh.byClass[i],
      combined: h.combined.byClass[i],
    }));

    // ── Panel 2: IOI PSD ───────────────────────────────────────────────
    const combinedOnsets = result.events
      .map(e => e.t)
      .sort((a, b) => a - b);
    const iois = interOnsetIntervals(combinedOnsets);
    const psd = welchPSD(iois);
    const psdData: { logF: number; logP: number; fit: number }[] = [];
    for (let i = 1; i < psd.frequencies.length; i++) {
      if (psd.power[i] <= 0) continue;
      const logF = Math.log10(psd.frequencies[i]);
      const logP = Math.log10(psd.power[i]);
      psdData.push({
        logF,
        logP,
        fit: psd.slope * logF + psd.intercept,
      });
    }

    // ── Panel 3: r(t) series ───────────────────────────────────────────
    const rSeriesData = result.rSeries.map(f => ({ t: f.t, r: f.r }));

    // ── Panel 4: per-bar phase-lock heatmap ────────────────────────────
    // Compute one r-average per bar by bucketing rSeries into measure spans.
    // Measure duration = 60/bpm × (beats-per-measure). Assume 4 beats (our
    // bundled scores) as a best-effort default; the heatmap is still
    // descriptive even if the assumption is slightly off for 3/4 pieces.
    const secPerBar = (60 / result.config.tempoBpm) * 4;
    const numBars = Math.max(1, Math.ceil(result.durationSec / secPerBar));
    const barSums = new Array(numBars).fill(0);
    const barCounts = new Array(numBars).fill(0);
    for (const f of result.rSeries) {
      const idx = Math.min(numBars - 1, Math.floor(f.t / secPerBar));
      barSums[idx] += f.r;
      barCounts[idx] += 1;
    }
    const heatmapData = barSums.map((s, i) => ({
      bar: i + 1,
      r: barCounts[i] > 0 ? s / barCounts[i] : 0,
    }));

    return {
      histData,
      psdData,
      psdSlope: psd.slope,
      rSeriesData,
      heatmapData,
    };
  }, [result]);

  const rMean =
    result.rSeries.length > 0
      ? result.rSeries.reduce((a, f) => a + f.r, 0) / result.rSeries.length
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sg-modal-backdrop">
      <div className="sg-modal-card flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0d] text-white/90 shadow-2xl">
        <header className="flex items-start justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="font-display text-2xl leading-none">Session — reading the tapestry</h2>
            {piecesTitle && (
              <p className="mt-1 text-xs font-mono tracking-wide text-white/50">{piecesTitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saveOutcome && (
              <span className={`font-mono text-[10px] uppercase tracking-wider ${
                saveOutcome.mode === 'remote' ? 'text-emerald-300' :
                saveOutcome.mode === 'local' ? 'text-amber-300' :
                'text-white/40'
              }`}>
                {saveOutcome.mode === 'remote' && '● woven into the tapestry'}
                {saveOutcome.mode === 'local' && '○ held locally — sign in to weave'}
                {saveOutcome.mode === 'skipped' && 'archive unavailable'}
              </span>
            )}
            <a
              href="/piano/sessions"
              className="rounded border border-white/10 px-3 py-1 font-mono text-xs tracking-wider text-white/70 hover:bg-white/10"
            >
              tapestry →
            </a>
            <button
              onClick={onClose}
              className="rounded border border-white/10 px-3 py-1 font-mono text-xs tracking-wider text-white/70 hover:bg-white/10"
            >
              close ✕
            </button>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-6 md:grid-cols-2">
          {/* Summary cards */}
          <section className="col-span-1 grid grid-cols-3 gap-3 md:col-span-2">
            <Stat label="accuracy" value={`${result.accuracyPct.toFixed(0)}%`} />
            <Stat label="mean r" value={rMean.toFixed(2)} highlight={rMean >= 0.8} />
            <Stat label="IOI slope" value={Number.isFinite(psdSlope) ? psdSlope.toFixed(2) : '—'} />
          </section>

          <Panel title="Pitch-class histogram" subtitle="duration-weighted · by hand">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={histData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', fontSize: 11 }}
                  formatter={(v: number) => v.toFixed(3)}
                />
                <Area type="step" dataKey="lh" stroke={LH_COLOR} fill={LH_COLOR} fillOpacity={0.2} />
                <Area type="step" dataKey="rh" stroke={RH_COLOR} fill={RH_COLOR} fillOpacity={0.2} />
              </ComposedChart>
            </ResponsiveContainer>
            <Legend items={[
              { color: LH_COLOR, label: 'LH' },
              { color: RH_COLOR, label: 'RH' },
            ]} />
          </Panel>

          <Panel
            title="Inter-onset-interval PSD"
            subtitle={`log-log · slope ≈ ${Number.isFinite(psdSlope) ? psdSlope.toFixed(2) : '—'} · target ≈ −1 (pink / in-the-pocket)`}
          >
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={psdData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="logF"
                  type="number"
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={10}
                  tickFormatter={(v: number) => v.toFixed(1)}
                  label={{ value: 'log f', position: 'insideBottom', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                />
                <YAxis
                  dataKey="logP"
                  type="number"
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={10}
                  tickFormatter={(v: number) => v.toFixed(1)}
                  label={{ value: 'log P', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', fontSize: 11 }}
                  formatter={(v: number) => v.toFixed(2)}
                />
                <Line dataKey="logP" stroke={GOLD} dot={{ r: 2 }} isAnimationActive={false} />
                <Line dataKey="fit" stroke={RED} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="r(t) — phase coupling" subtitle="mean Kuramoto order · 0.8 = locked">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={rSeriesData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="t"
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={10}
                  tickFormatter={(v: number) => `${v.toFixed(0)}s`}
                />
                <YAxis
                  domain={[0, 1]}
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={10}
                  tickFormatter={(v: number) => v.toFixed(1)}
                />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', fontSize: 11 }}
                  formatter={(v: number) => v.toFixed(2)}
                />
                <ReferenceLine y={0.8} stroke={GOLD} strokeDasharray="3 3" />
                <ReferenceLine y={0.4} stroke={RED} strokeDasharray="3 3" />
                <Area type="monotone" dataKey="r" stroke={GOLD} fill={GOLD} fillOpacity={0.18} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Per-bar phase-lock" subtitle="mean r within each bar · where the hands decoupled">
            <BarHeatmap data={heatmapData} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded border border-white/10 bg-white/[0.02] px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div
        className={`mt-1 font-mono text-2xl tabular-nums ${
          highlight ? 'text-[#c9a96e]' : 'text-white/90'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <header className="mb-2">
        <h3 className="font-display text-lg leading-none">{title}</h3>
        {subtitle && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/40">
            {subtitle}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="mt-2 flex gap-4 font-mono text-[10px] uppercase tracking-wider text-white/50">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function BarHeatmap({ data }: { data: { bar: number; r: number }[] }) {
  if (data.length === 0) {
    return <p className="font-mono text-xs text-white/40">no bars played</p>;
  }
  const max = Math.max(0.01, ...data.map(d => d.r));
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(data.length, 16)}, minmax(0, 1fr))` }}>
      {data.map((d) => {
        const pct = d.r / max;
        const bg =
          d.r >= 0.8 ? GOLD : d.r >= 0.4 ? `rgba(201,169,110,${0.3 + pct * 0.4})` : `rgba(239,68,68,${0.2 + pct * 0.4})`;
        return (
          <div key={d.bar} className="flex flex-col items-center">
            <div
              className="h-10 w-full rounded"
              style={{ background: bg }}
              title={`bar ${d.bar}: r=${d.r.toFixed(2)}`}
            />
            <span className="mt-1 font-mono text-[9px] text-white/40">{d.bar}</span>
          </div>
        );
      })}
    </div>
  );
}
