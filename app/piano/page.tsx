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
import { kuramotoFromOnsets, livePhaseFromOnsets, orderParameter } from '@/lib/piano/kuramoto';
import { saveSession, type SaveOutcome } from '@/lib/piano/persistence';
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
  const [saveOutcome, setSaveOutcome] = useState<SaveOutcome | null>(null);
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
    setSaveOutcome(null);
    sheetRef.current?.resetColors();
  }, []);

  // ── Live Kuramoto: real Hilbert-based phase on a sliding window ──────
  //
  // For each hand, we take the last ~4 seconds of onsets, smooth into an
  // onset-density signal, run the FFT-based analytic signal, and read the
  // instantaneous phase at an index 500ms behind "now" to dodge the
  // Hilbert's endpoint artifacts. This runs at ~20Hz on the main thread —
  // two 256-point FFTs per tick is a few hundred microseconds — and gives
  // a phase estimate consistent with what SessionAnalytics computes
  // post-session. The display is 500ms behind real-time; that's the price
  // of a stable estimator.
  //
  // The sigma matches the tempo: at faster bpm we expect denser onsets, so
  // we shrink the Gaussian so neighboring 16ths stay resolved as separate
  // "spikes" in the density signal.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let lastTick = 0;

    // Density/sigma knobs. 16th-note period = 60/(bpm*4). Set sigma to half
    // that so adjacent 16ths broaden into overlapping humps rather than a
    // flat ridge, which is what the Hilbert needs to extract a clean phase.
    const sixteenthSec = 60 / (config.tempoBpm * 4);
    const sigma = Math.max(0.04, sixteenthSec * 0.5);
    const windowSec = 4;
    const dt = 0.025;
    const marginSec = 0.5;
    const TICK_MS = 50; // ~20Hz

    function tick() {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      if (now - lastTick < TICK_MS) return;
      lastTick = now;

      const tSession = now / 1000 - sessionStartRef.current;
      const phaseLH = livePhaseFromOnsets(lhOnsetsRef.current, tSession, {
        windowSec, dt, sigma, marginSec,
      });
      const phaseRH = livePhaseFromOnsets(rhOnsetsRef.current, tSession, {
        windowSec, dt, sigma, marginSec,
      });

      const { r, meanPhase } = orderParameter([phaseLH, phaseRH]);
      const frame: KuramotoFrame = {
        t: tSession,
        r,
        meanPhase,
        phaseLH: Number.isFinite(phaseLH) ? phaseLH : 0,
        phaseRH: Number.isFinite(phaseRH) ? phaseRH : 0,
      };
      kuramotoFrameRef.current = frame;
      kuramotoHistoryRef.current.push(frame);
      if (kuramotoHistoryRef.current.length > 600) {
        kuramotoHistoryRef.current.splice(0, kuramotoHistoryRef.current.length - 600);
      }
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
          const sessionResult = {
            startedAt: sessionStartRef.current,
            durationSec: duration,
            config: { ...config },
            events,
            matches,
            rSeries,
            accuracyPct: accuracy,
          };
          setResult(sessionResult);

          // Persist the thread: Supabase if the player is signed in,
          // localStorage otherwise. Fire-and-forget — the UI doesn't block
          // on the save, and the archive hides it when it lands.
          if (selectedPiece) {
            saveSession(sessionResult, {
              pieceId: selectedPiece.id,
              pieceTitle: `${selectedPiece.title} — ${selectedPiece.composer}`,
            })
              .then((outcome) => setSaveOutcome(outcome))
              .catch(() => undefined);
          }
        }
      }
    },
    [config, resetSession, selectedPiece],
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
            <a href="/piano/sessions" className="hover:text-white/90">tapestry →</a>
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
                Each hand's phase extracted via Hilbert transform on a 4s
                sliding window (500ms behind real-time). Gold vector = mean;
                length = r. ≥ 0.8 → locked. &lt; 0.4 → the Norns' thread
                frays.
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
          saveOutcome={saveOutcome}
        />
      )}
    </main>
  );
}

