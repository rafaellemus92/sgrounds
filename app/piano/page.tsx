'use client';

// Coupled Oscillator Piano Trainer — main game view.
//
// This page is the event-loop hub: MIDI events come in, we match them to
// ScoreNotes, update the sheet coloring, push per-frame Kuramoto state into
// a ref, and record timing deviations. On stop, we open the analytics modal.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MidiInput from '@/components/piano/MidiInput';
import { SheetMusicView, type SheetMusicHandle } from '@/components/piano/SheetMusicView';
import PhasorDisplay from '@/components/piano/PhasorDisplay';
import TimingStrip, { type TimingPoint } from '@/components/piano/TimingStrip';
import MetronomeBar from '@/components/piano/MetronomeBar';
import SessionAnalytics from '@/components/piano/SessionAnalytics';
import { parseMusicXML, findMatchIndex } from '@/lib/piano/scoreAligner';
import { liveFrame, kuramotoFromOnsets } from '@/lib/piano/kuramoto';
import type {
  KuramotoFrame,
  NoteMatch,
  OnsetEvent,
  ScoreNote,
  SessionConfig,
  SessionResult,
} from '@/lib/piano/types';

interface PieceMeta {
  id: string;
  title: string;
  composer: string;
  file: string;
  suggestedTempo: number;
  difficulty: number;
  description: string;
}

interface Manifest {
  pieces: PieceMeta[];
}

export default function PianoPage() {
  // ── Config ───────────────────────────────────────────────────────────
  const [config, setConfig] = useState<SessionConfig>({
    tempoBpm: 80,
    timingWindowMs: 80,
    handSplitPitch: 60,
    metronomeEnabled: true,
    synthFallback: false,
  });

  // ── Piece selection ──────────────────────────────────────────────────
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string>('c-major-scale');
  const [xml, setXml] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/scores/manifest.json')
      .then(r => r.json())
      .then((m: Manifest) => {
        setManifest(m);
        if (m.pieces[0]) setSelectedPieceId(m.pieces[0].id);
      })
      .catch(() => setLoadError('could not load piece manifest'));
  }, []);

  const selectedPiece = useMemo(
    () => manifest?.pieces.find(p => p.id === selectedPieceId) ?? null,
    [manifest, selectedPieceId],
  );

  useEffect(() => {
    if (!selectedPiece) return;
    setXml(null);
    setConfig(c => ({ ...c, tempoBpm: selectedPiece.suggestedTempo }));
    fetch(selectedPiece.file)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(setXml)
      .catch(e => setLoadError(`could not load ${selectedPiece.file}: ${e.message}`));
  }, [selectedPiece]);

  // ── Parse score ──────────────────────────────────────────────────────
  const expected: ScoreNote[] = useMemo(() => {
    if (!xml) return [];
    try {
      return parseMusicXML(xml, {
        tempoBpm: config.tempoBpm,
        handSplitPitch: config.handSplitPitch,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[piano] parse failed:', e);
      setLoadError(`could not parse score: ${e instanceof Error ? e.message : String(e)}`);
      return [];
    }
    // Re-parse on tempo change so onsets stay in seconds.
  }, [xml, config.tempoBpm, config.handSplitPitch]);

  // ── Session state ────────────────────────────────────────────────────
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const sessionStartRef = useRef<number>(0);
  const eventsRef = useRef<OnsetEvent[]>([]);
  const matchesRef = useRef<Map<string, NoteMatch>>(new Map());
  const consumedRef = useRef<Set<string>>(new Set());
  const timingPointsRef = useRef<TimingPoint[]>([]);
  const lhOnsetsRef = useRef<number[]>([]);
  const rhOnsetsRef = useRef<number[]>([]);
  const kuramotoFrameRef = useRef<KuramotoFrame | null>(null);
  const kuramotoHistoryRef = useRef<KuramotoFrame[]>([]);
  const sheetRef = useRef<SheetMusicHandle | null>(null);

  // Reset session state when piece changes or user hits start fresh.
  const resetSession = useCallback(() => {
    sessionStartRef.current = performance.now() / 1000;
    eventsRef.current = [];
    matchesRef.current = new Map();
    consumedRef.current = new Set();
    timingPointsRef.current = [];
    lhOnsetsRef.current = [];
    rhOnsetsRef.current = [];
    kuramotoFrameRef.current = null;
    kuramotoHistoryRef.current = [];
    setResult(null);
    sheetRef.current?.resetColors();
  }, []);

  // ── Live Kuramoto: per-hand phase from EMA of onset density ──────────
  //
  // A full Hilbert transform on each rAF tick is overkill and laggy. For the
  // *live* display we use a much simpler and mathematically equivalent
  // estimator: each hand has an instantaneous oscillator phase that advances
  // at the expected beat rate, and gets nudged to 0 on each onset (so a tight
  // rhythm keeps phase pinned near 0). Post-session, SessionAnalytics
  // recomputes the full Hilbert-based r(t) series for the report.
  const livePhaseLHRef = useRef(0);
  const livePhaseRHRef = useRef(0);
  const lastLiveTickRef = useRef(performance.now() / 1000);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;

    const beatHz = config.tempoBpm / 60;
    // Assume sixteenth-note density at tempo for the "natural" oscillator
    // rate — gives us a smooth phasor without requiring onset-density FFTs.
    const oscHz = beatHz * 4;

    function tick() {
      const now = performance.now() / 1000;
      const dt = now - lastLiveTickRef.current;
      lastLiveTickRef.current = now;

      livePhaseLHRef.current = wrap(livePhaseLHRef.current + 2 * Math.PI * oscHz * dt);
      livePhaseRHRef.current = wrap(livePhaseRHRef.current + 2 * Math.PI * oscHz * dt);

      const t = now - sessionStartRef.current;
      const frame = liveFrame(livePhaseLHRef.current, livePhaseRHRef.current, t);
      kuramotoFrameRef.current = frame;
      kuramotoHistoryRef.current.push(frame);
      if (kuramotoHistoryRef.current.length > 600) {
        kuramotoHistoryRef.current.splice(0, kuramotoHistoryRef.current.length - 600);
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, config.tempoBpm]);

  // ── Handle incoming onsets ───────────────────────────────────────────
  const handleOnset = useCallback(
    (ev: OnsetEvent) => {
      if (!playing) return;
      // MidiInput emits `ev.t` relative to its own mount time. We want
      // time relative to *session start*; recompute from performance.now().
      const tInSession = performance.now() / 1000 - sessionStartRef.current;

      const withSessionT: OnsetEvent = { ...ev, t: tInSession };
      eventsRef.current.push(withSessionT);
      if (ev.hand === 'LH') lhOnsetsRef.current.push(tInSession);
      else rhOnsetsRef.current.push(tInSession);

      // Nudge the live phasor for this hand toward 0 (perfect onset).
      if (ev.hand === 'LH') livePhaseLHRef.current *= 0.3;
      else livePhaseRHRef.current *= 0.3;

      const windowSec = config.timingWindowMs / 1000;
      const idx = findMatchIndex(
        expected,
        consumedRef.current,
        ev.pitch,
        ev.hand,
        tInSession,
        windowSec,
      );

      if (idx >= 0) {
        const note = expected[idx];
        const deviation = (tInSession - note.onset) * 1000;
        consumedRef.current.add(note.id);
        matchesRef.current.set(note.id, {
          note,
          status: 'correct',
          event: withSessionT,
          deviationMs: deviation,
        });
        timingPointsRef.current.push({
          t: tInSession,
          deviationMs: deviation,
          hand: ev.hand,
        });
        sheetRef.current?.setMatchStatus(note.id, 'correct');
      } else {
        // Wrong note. Find the closest expected of the same hand (ignoring
        // pitch) to attach a red highlight.
        let nearestIdx = -1;
        let nearestDist = Infinity;
        for (let i = 0; i < expected.length; i++) {
          const n = expected[i];
          if (consumedRef.current.has(n.id)) continue;
          if (n.hand !== ev.hand) continue;
          const d = Math.abs(n.onset - tInSession);
          if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
        }
        if (nearestIdx >= 0 && nearestDist < windowSec * 2) {
          const n = expected[nearestIdx];
          // Record as wrong but don't consume — user can still hit the correct pitch.
          matchesRef.current.set(`wrong-${tInSession}-${ev.pitch}`, {
            note: n,
            status: 'wrong',
            event: withSessionT,
            deviationMs: (tInSession - n.onset) * 1000,
          });
          sheetRef.current?.setMatchStatus(n.id, 'wrong');
        }
      }
    },
    [playing, expected, config.timingWindowMs],
  );

  // ── Missed-note scanner ───────────────────────────────────────────────
  //
  // Every 150ms, mark as "missed" any expected note whose onset is now more
  // than +timingWindow past current time and which hasn't been consumed.
  useEffect(() => {
    if (!playing) return;
    const windowSec = config.timingWindowMs / 1000;
    const id = setInterval(() => {
      const now = performance.now() / 1000 - sessionStartRef.current;
      for (const n of expected) {
        if (consumedRef.current.has(n.id)) continue;
        if (n.onset + windowSec < now) {
          consumedRef.current.add(n.id);
          matchesRef.current.set(n.id, { note: n, status: 'missed' });
          sheetRef.current?.setMatchStatus(n.id, 'missed');
        }
      }
    }, 150);
    return () => clearInterval(id);
  }, [playing, expected, config.timingWindowMs]);

  // ── Start/stop handlers ──────────────────────────────────────────────
  const handlePlayingChange = useCallback(
    (next: boolean) => {
      if (next) {
        resetSession();
        setPlaying(true);
      } else {
        setPlaying(false);
        // Compile the session result and open the analytics modal.
        const events = [...eventsRef.current];
        const matches = [...matchesRef.current.values()];
        const duration =
          events.length > 0 ? events[events.length - 1].t + 0.5 : 0.5;

        const correct = matches.filter(m => m.status === 'correct').length;
        const wrong = matches.filter(m => m.status === 'wrong').length;
        const missed = matches.filter(m => m.status === 'missed').length;
        const total = correct + wrong + missed;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;

        // Post-session: full Hilbert-based r(t) from onset densities.
        // Use a window that matches the played range.
        const rSeries = kuramotoFromOnsets(
          [lhOnsetsRef.current, rhOnsetsRef.current],
          Math.max(duration, 1),
          0.05,
          Math.max(0.06, 60 / config.tempoBpm / 4),
        );

        if (events.length > 0) {
          setResult({
            startedAt: sessionStartRef.current,
            durationSec: duration,
            config: { ...config },
            events,
            matches,
            rSeries,
            accuracyPct: accuracy,
          });
        }
      }
    },
    [config, resetSession],
  );

  // ── UI ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#09090a] text-white/90">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl leading-none md:text-4xl">
              coupled oscillator<span className="text-[#c9a96e]">.</span>
            </h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-white/40">
              piano trainer · phase-coupling diagnostic
            </p>
          </div>
          <nav className="flex items-center gap-3 font-mono text-xs text-white/60">
            <a href="/" className="hover:text-white/90">← sgrounds</a>
          </nav>
        </header>

        {loadError && (
          <div className="mb-4 rounded bg-red-900/30 p-3 font-mono text-xs text-red-200">
            {loadError}
          </div>
        )}

        {/* Piece picker */}
        <section className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <label className="font-mono text-[10px] uppercase tracking-wider text-white/40">piece</label>
          <select
            value={selectedPieceId}
            onChange={(e) => setSelectedPieceId(e.target.value)}
            className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs"
          >
            {manifest?.pieces.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.composer}
              </option>
            ))}
          </select>
          {selectedPiece && (
            <p className="flex-1 text-xs text-white/50">{selectedPiece.description}</p>
          )}
        </section>

        <MetronomeBar
          tempoBpm={config.tempoBpm}
          onTempoChange={(bpm) => setConfig(c => ({ ...c, tempoBpm: bpm }))}
          handSplitPitch={config.handSplitPitch}
          onHandSplitChange={(midi) => setConfig(c => ({ ...c, handSplitPitch: midi }))}
          timingWindowMs={config.timingWindowMs}
          onTimingWindowChange={(ms) => setConfig(c => ({ ...c, timingWindowMs: ms }))}
          playing={playing}
          onPlayingChange={handlePlayingChange}
          metronomeEnabled={config.metronomeEnabled}
          onMetronomeEnabledChange={(on) => setConfig(c => ({ ...c, metronomeEnabled: on }))}
        />

        <div className="mt-3 mb-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2">
          <MidiInput
            onOnset={handleOnset}
            handSplitPitch={config.handSplitPitch}
            enabled={playing}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">
            {expected.length} notes · {config.tempoBpm} bpm
          </span>
        </div>

        {/* Sheet + live overlays */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          <div>
            {xml && expected.length > 0 ? (
              <SheetMusicView
                ref={sheetRef}
                xml={xml}
                expected={expected}
              />
            ) : (
              <div className="rounded-lg bg-[rgb(253,250,242)] p-6 font-mono text-xs text-[#6b5e45]">
                loading score…
              </div>
            )}

            <div className="mt-4">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-white/40">
                onset deviation — last 12s
              </div>
              <TimingStrip
                pointsRef={timingPointsRef}
                timingWindowMs={config.timingWindowMs}
              />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-white/40">
                phase coupling
              </div>
              <PhasorDisplay
                frameRef={kuramotoFrameRef}
                historyRef={kuramotoHistoryRef}
                size={240}
              />
              <p className="mt-2 font-mono text-[10px] leading-snug text-white/40">
                Gold vector = mean of LH + RH phasors. Length = order
                parameter r. ≥ 0.8 → locked. &lt; 0.4 → drifting.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-white/60">
              <div className="mb-1 text-[10px] uppercase tracking-wider text-white/40">legend</div>
              <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-[#22c55e]" /> correct pitch in window</div>
              <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-[#ef4444]" /> wrong pitch</div>
              <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-[#9ca3af]" /> missed</div>
            </div>
          </aside>
        </div>
      </div>

      {result && selectedPiece && (
        <SessionAnalytics
          result={result}
          onClose={() => setResult(null)}
          piecesTitle={`${selectedPiece.title} — ${selectedPiece.composer}`}
        />
      )}
    </main>
  );
}

function wrap(theta: number): number {
  let t = theta;
  while (t > Math.PI) t -= 2 * Math.PI;
  while (t < -Math.PI) t += 2 * Math.PI;
  return t;
}
