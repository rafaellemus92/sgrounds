'use client';

// Metronome + tempo / hand-split controls.
//
// Click scheduling is done via Tone.js's Transport so ticks stay on the
// audio clock instead of drifting with setInterval. On the first play,
// we start the audio context (Tone requires a user gesture).

import { useEffect, useRef, useState } from 'react';
import type * as ToneType from 'tone';

export interface MetronomeBarProps {
  tempoBpm: number;
  onTempoChange: (bpm: number) => void;
  handSplitPitch: number;
  onHandSplitChange: (midi: number) => void;
  timingWindowMs: number;
  onTimingWindowChange: (ms: number) => void;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  metronomeEnabled: boolean;
  onMetronomeEnabledChange: (on: boolean) => void;
}

type ToneMod = typeof ToneType;

export default function MetronomeBar(props: MetronomeBarProps) {
  const {
    tempoBpm,
    onTempoChange,
    handSplitPitch,
    onHandSplitChange,
    timingWindowMs,
    onTimingWindowChange,
    playing,
    onPlayingChange,
    metronomeEnabled,
    onMetronomeEnabledChange,
  } = props;

  const toneRef = useRef<ToneMod | null>(null);
  const synthRef = useRef<InstanceType<ToneMod['MembraneSynth']> | null>(null);
  const loopIdRef = useRef<number | null>(null);
  const [beat, setBeat] = useState(0);

  // Keep Tone.Transport tempo in sync.
  useEffect(() => {
    const tone = toneRef.current;
    if (tone) tone.getTransport().bpm.value = tempoBpm;
  }, [tempoBpm]);

  useEffect(() => {
    let disposed = false;
    (async () => {
      const mod = await import('tone');
      if (disposed) return;
      toneRef.current = mod;
      mod.getTransport().bpm.value = tempoBpm;
    })();
    return () => {
      disposed = true;
      const tone = toneRef.current;
      if (tone && loopIdRef.current != null) {
        tone.getTransport().clear(loopIdRef.current);
      }
      if (synthRef.current) {
        try { synthRef.current.dispose(); } catch { /* ignore */ }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start / stop the click scheduling.
  useEffect(() => {
    const tone = toneRef.current;
    if (!tone) return;

    if (!playing) {
      if (loopIdRef.current != null) {
        tone.getTransport().clear(loopIdRef.current);
        loopIdRef.current = null;
      }
      tone.getTransport().stop();
      setBeat(0);
      return;
    }

    // Ensure the audio context is started (requires user gesture upstream).
    tone.start();

    if (!synthRef.current) {
      synthRef.current = new tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
      }).toDestination();
      synthRef.current.volume.value = -12;
    }

    let counter = 0;
    loopIdRef.current = tone.getTransport().scheduleRepeat((time) => {
      const isDownbeat = counter % 4 === 0;
      if (metronomeEnabled) {
        synthRef.current!.triggerAttackRelease(
          isDownbeat ? 'C5' : 'G4',
          '32n',
          time,
          isDownbeat ? 0.7 : 0.4,
        );
      }
      tone.getDraw().schedule(() => setBeat(counter % 4), time);
      counter++;
    }, '4n');

    tone.getTransport().start();

    return () => {
      const t = toneRef.current;
      if (!t) return;
      if (loopIdRef.current != null) {
        t.getTransport().clear(loopIdRef.current);
        loopIdRef.current = null;
      }
      t.getTransport().stop();
      setBeat(0);
    };
  }, [playing, metronomeEnabled]);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-mono">
      <button
        type="button"
        onClick={() => onPlayingChange(!playing)}
        className={`rounded px-3 py-1.5 text-xs uppercase tracking-wider transition ${
          playing
            ? 'bg-[#c9a96e] text-black'
            : 'border border-white/20 text-white/80 hover:bg-white/10'
        }`}
      >
        {playing ? '◼ stop' : '▶ start'}
      </button>

      {/* Beat pips */}
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition ${
              playing && beat === i
                ? i === 0 ? 'bg-[#c9a96e]' : 'bg-white/70'
                : 'bg-white/15'
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="opacity-60">tempo</label>
        <input
          type="range"
          min={40}
          max={180}
          step={1}
          value={tempoBpm}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          className="w-28 accent-[#c9a96e]"
        />
        <span className="tabular-nums">{tempoBpm} bpm</span>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={metronomeEnabled}
          onChange={(e) => onMetronomeEnabledChange(e.target.checked)}
          className="accent-[#c9a96e]"
        />
        <span className="opacity-70">click</span>
      </label>

      <div className="flex items-center gap-2">
        <label className="opacity-60">split</label>
        <input
          type="number"
          min={36}
          max={84}
          value={handSplitPitch}
          onChange={(e) => onHandSplitChange(Number(e.target.value))}
          className="w-14 rounded border border-white/10 bg-white/5 px-1 py-0.5 tabular-nums"
        />
        <span className="opacity-60">&lt; LH · RH ≥</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="opacity-60">window</label>
        <input
          type="range"
          min={20}
          max={200}
          step={5}
          value={timingWindowMs}
          onChange={(e) => onTimingWindowChange(Number(e.target.value))}
          className="w-20 accent-[#c9a96e]"
        />
        <span className="tabular-nums">±{timingWindowMs}ms</span>
      </div>
    </div>
  );
}
