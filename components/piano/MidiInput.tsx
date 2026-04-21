'use client';

// Web MIDI + keyboard fallback. Emits typed OnsetEvents on key-down.
//
// - On Chromium-based browsers: uses navigator.requestMIDIAccess and picks
//   up all connected keyboards. Multiple devices merge into a single stream.
// - On Firefox (no Web MIDI): falls back to a computer-keyboard mapping of
//   rows A–K to pitches. The fallback is indicated in the status banner.
//
// This component renders a small device picker and a status line; the event
// stream is consumed by a parent via the `onOnset` callback. We intentionally
// keep this a plain client component (not a hook) so the device list can be
// rendered standalone.

import { useEffect, useRef, useState } from 'react';
import type { Hand, OnsetEvent } from '@/lib/piano/types';

export interface MidiInputProps {
  onOnset: (ev: OnsetEvent) => void;
  handSplitPitch: number;
  enabled?: boolean;
}

type MidiStatus =
  | { kind: 'pending' }
  | { kind: 'unsupported' }
  | { kind: 'denied'; error: string }
  | { kind: 'ready'; devices: string[] }
  | { kind: 'keyboard' };

// Keyboard fallback mapping. Home row (a–;) + top sharps (w–p) = RH around
// C4–E5; bottom row (z–m) = LH around C3–B3. Sharps/flats only where a
// standard QWERTY layout makes it unambiguous.
const FALLBACK_KEY_MAP: Record<string, number> = {
  a: 60, // C4
  w: 61, // C#4
  s: 62, // D4
  e: 63, // D#4
  d: 64, // E4
  f: 65, // F4
  t: 66, // F#4
  g: 67, // G4
  y: 68, // G#4
  h: 69, // A4
  u: 70, // A#4
  j: 71, // B4
  k: 72, // C5
  o: 73, // C#5
  l: 74, // D5
  p: 75, // D#5
  ';': 76, // E5
  z: 48, // C3
  x: 50, // D3
  c: 52, // E3
  v: 53, // F3
  b: 55, // G3
  n: 57, // A3
  m: 59, // B3
};

export default function MidiInput({ onOnset, handSplitPitch, enabled = true }: MidiInputProps) {
  const [status, setStatus] = useState<MidiStatus>({ kind: 'pending' });
  const [selected, setSelected] = useState<string>('');
  const t0Ref = useRef<number>(0);
  const enabledRef = useRef(enabled);
  const onOnsetRef = useRef(onOnset);
  const handSplitRef = useRef(handSplitPitch);
  const pressedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { onOnsetRef.current = onOnset; }, [onOnset]);
  useEffect(() => { handSplitRef.current = handSplitPitch; }, [handSplitPitch]);

  useEffect(() => {
    t0Ref.current = performance.now();
  }, []);

  // ─── Web MIDI setup ──────────────────────────────────────────────────
  useEffect(() => {
    let access: MIDIAccess | null = null;
    const inputHandlers = new Map<MIDIInput, (ev: MIDIMessageEvent) => void>();

    function makeHandler(): (ev: MIDIMessageEvent) => void {
      return (ev) => {
        if (!enabledRef.current) return;
        if (!ev.data || ev.data.length < 3) return;
        const [statusByte, note, velocity] = ev.data;
        const cmd = statusByte & 0xf0;
        // Note-on with velocity 0 is a note-off in MIDI.
        if (cmd !== 0x90 || velocity === 0) return;
        const now = (performance.now() - t0Ref.current) / 1000;
        const hand: Hand = note >= handSplitRef.current ? 'RH' : 'LH';
        onOnsetRef.current({
          pitch: note,
          velocity,
          t: now,
          hand,
          source: 'midi',
        });
      };
    }

    function bindInputs(acc: MIDIAccess) {
      const names: string[] = [];
      acc.inputs.forEach((input) => {
        const handler = makeHandler();
        input.addEventListener('midimessage', handler as EventListener);
        inputHandlers.set(input, handler);
        names.push(input.name ?? input.id);
      });
      setStatus({ kind: 'ready', devices: names });
      setSelected(names[0] ?? '');
    }

    function unbindInputs() {
      inputHandlers.forEach((handler, input) => {
        input.removeEventListener('midimessage', handler as EventListener);
      });
      inputHandlers.clear();
    }

    if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
      setStatus({ kind: 'keyboard' });
      return;
    }

    (navigator as Navigator & { requestMIDIAccess: () => Promise<MIDIAccess> })
      .requestMIDIAccess()
      .then((acc) => {
        access = acc;
        bindInputs(acc);
        acc.onstatechange = () => {
          unbindInputs();
          bindInputs(acc);
        };
      })
      .catch((err: Error) => {
        setStatus({ kind: 'denied', error: err.message || 'MIDI access denied' });
      });

    return () => {
      unbindInputs();
      if (access) access.onstatechange = null;
    };
  }, []);

  // ─── Keyboard fallback ───────────────────────────────────────────────
  useEffect(() => {
    const isFallback =
      status.kind === 'keyboard' ||
      status.kind === 'denied' ||
      status.kind === 'unsupported' ||
      (status.kind === 'ready' && status.devices.length === 0);

    if (!isFallback) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!enabledRef.current) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (pressedKeysRef.current.has(key)) return; // suppress auto-repeat
      const pitch = FALLBACK_KEY_MAP[key];
      if (pitch === undefined) return;
      pressedKeysRef.current.add(key);
      e.preventDefault();
      const now = (performance.now() - t0Ref.current) / 1000;
      const hand: Hand = pitch >= handSplitRef.current ? 'RH' : 'LH';
      onOnsetRef.current({
        pitch,
        velocity: 100,
        t: now,
        hand,
        source: 'keyboard',
      });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      pressedKeysRef.current.clear();
    };
  }, [status]);

  // ─── Rendering ───────────────────────────────────────────────────────
  return (
    <div className="text-xs font-mono tracking-wide">
      {status.kind === 'pending' && (
        <span className="opacity-60">connecting to MIDI…</span>
      )}
      {status.kind === 'unsupported' && (
        <span className="text-amber-300">
          Web MIDI not supported — using keyboard fallback (rows A–K = C4–E5, Z–M = C3–B3).
        </span>
      )}
      {status.kind === 'denied' && (
        <span className="text-amber-300">
          MIDI access denied ({status.error}) — using keyboard fallback.
        </span>
      )}
      {status.kind === 'keyboard' && (
        <span className="text-amber-300">
          Keyboard fallback active (A–K row → C4–E5, Z–M row → C3–B3).
        </span>
      )}
      {status.kind === 'ready' && status.devices.length === 0 && (
        <span className="text-amber-300">No MIDI devices found — keyboard fallback active.</span>
      )}
      {status.kind === 'ready' && status.devices.length > 0 && (
        <span className="text-emerald-300">
          ● {selected || status.devices[0]}
          {status.devices.length > 1 && ` (+${status.devices.length - 1} more)`}
        </span>
      )}
    </div>
  );
}

// Re-export the fallback map so docs / overlays can show the mapping.
export { FALLBACK_KEY_MAP };
