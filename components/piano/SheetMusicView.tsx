'use client';

// OSMD wrapper + note-head coloring.
//
// Given a MusicXML source, render it with OpenSheetMusicDisplay and expose
// a `setMatchStatus(noteId, status)` imperative handle the parent can call
// whenever a live MIDI event resolves against a ScoreNote.
//
// Coloring strategy: after the initial render, walk OSMD's GraphicSheet in
// reading order and pair each GraphicalNote with the ScoreNote at the same
// reading-order index. We set `sourceNote.NoteheadColor` to a status-
// dependent hex, then trigger a lightweight re-render. Re-renders are
// coalesced with requestAnimationFrame so a flurry of matches only causes
// one paint per frame.

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { MatchStatus, ScoreNote } from '@/lib/piano/types';

export interface SheetMusicHandle {
  setMatchStatus: (noteId: string, status: MatchStatus) => void;
  resetColors: () => void;
  getExpectedNotes: () => ScoreNote[];
}

export interface SheetMusicViewProps {
  xml: string;
  expected: ScoreNote[];           // parsed in reading order — index-aligned with OSMD
  onReady?: () => void;
  className?: string;
}

const COLOR_FOR_STATUS: Record<MatchStatus, string> = {
  correct: '#22c55e',    // green-500
  wrong: '#ef4444',      // red-500
  missed: '#9ca3af',     // gray-400
  pending: '#262014',    // default ink
};

const DEFAULT_INK = '#262014';

// Avoid importing OSMD at module top-level — it references `window`, which
// breaks Next.js server-rendering. We dynamic-import inside the effect.
type OsmdModule = typeof import('opensheetmusicdisplay');

export const SheetMusicView = forwardRef<SheetMusicHandle, SheetMusicViewProps>(function SheetMusicView(
  { xml, expected, onReady, className },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const osmdRef = useRef<InstanceType<OsmdModule['OpenSheetMusicDisplay']> | null>(null);
  // noteId → sourceNote (OSMD internal type). Built after each render.
  const noteMapRef = useRef<Map<string, { sourceNote: { NoteheadColor: string | null } }>>(new Map());
  const pendingRenderRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Keep expected around for re-pairing after a re-render.
  const expectedRef = useRef(expected);
  useEffect(() => { expectedRef.current = expected; }, [expected]);

  // Load + render. Reruns if xml changes.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);

    (async () => {
      try {
        const mod = await import('opensheetmusicdisplay');
        if (cancelled || !containerRef.current) return;

        // Dispose old instance so React Fast Refresh doesn't double-render.
        if (osmdRef.current) {
          try { osmdRef.current.clear(); } catch { /* ignore */ }
          osmdRef.current = null;
        }
        containerRef.current.innerHTML = '';

        const osmd = new mod.OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          backend: 'svg',
          drawTitle: true,
          drawComposer: true,
          drawPartNames: false,
          drawMeasureNumbers: true,
          drawCredits: false,
          followCursor: true,
        });
        osmdRef.current = osmd;

        await osmd.load(xml);
        if (cancelled) return;
        osmd.render();
        if (cancelled) return;

        rebuildNoteMap(osmd, expectedRef.current, noteMapRef.current);
        setReady(true);
        onReady?.();
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setError(msg);
          // eslint-disable-next-line no-console
          console.error('[SheetMusicView] OSMD render failed:', e);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (pendingRenderRef.current != null) {
        cancelAnimationFrame(pendingRenderRef.current);
        pendingRenderRef.current = null;
      }
    };
  }, [xml, onReady]);

  // Imperative handle exposed to parent.
  useImperativeHandle(ref, () => ({
    setMatchStatus(noteId: string, status: MatchStatus) {
      const entry = noteMapRef.current.get(noteId);
      if (!entry) return;
      entry.sourceNote.NoteheadColor = COLOR_FOR_STATUS[status];
      scheduleRender();
    },
    resetColors() {
      for (const entry of noteMapRef.current.values()) {
        entry.sourceNote.NoteheadColor = DEFAULT_INK;
      }
      scheduleRender();
    },
    getExpectedNotes() {
      return expectedRef.current;
    },
  }), []);

  function scheduleRender() {
    if (pendingRenderRef.current != null) return;
    pendingRenderRef.current = requestAnimationFrame(() => {
      pendingRenderRef.current = null;
      const osmd = osmdRef.current;
      if (!osmd) return;
      try {
        osmd.render();
        rebuildNoteMap(osmd, expectedRef.current, noteMapRef.current);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[SheetMusicView] re-render failed:', e);
      }
    });
  }

  return (
    <div className={className ?? ''}>
      {error && (
        <div className="rounded bg-red-900/40 p-3 text-xs font-mono text-red-200">
          sheet render error: {error}
        </div>
      )}
      <div
        ref={containerRef}
        className="rounded-lg bg-[rgb(253,250,242)] px-4 py-3 shadow-inner"
        style={{ minHeight: 240 }}
      />
      {!ready && !error && (
        <div className="mt-2 text-xs font-mono text-white/40">rendering…</div>
      )}
    </div>
  );
});

// Walk OSMD's graphical structure in reading order, pairing each graphical
// note with the ScoreNote at the same index. OSMD and our scoreAligner both
// traverse parts → measures → voices → notes (with chord notes grouped into
// a single entry) so index-pairing is stable as long as the MusicXML
// doesn't have elements we skip (grace notes).
//
// The `sourceNote` we store is loosely typed — OSMD's public typings don't
// expose NoteheadColor cleanly, so we cast through `any`. The only operation
// we perform on it is assigning a string to `.NoteheadColor`, which is a
// documented OSMD feature.
function rebuildNoteMap(
  osmd: InstanceType<OsmdModule['OpenSheetMusicDisplay']>,
  expected: ScoreNote[],
  out: Map<string, { sourceNote: { NoteheadColor: string | null } }>,
) {
  out.clear();
  const graphicNotes = collectGraphicalNotes(osmd);
  const count = Math.min(graphicNotes.length, expected.length);
  for (let i = 0; i < count; i++) {
    const sourceNote = graphicNotes[i] as { NoteheadColor: string | null };
    out.set(expected[i].id, { sourceNote });
  }
  if (graphicNotes.length !== expected.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `[SheetMusicView] graphical/score note count mismatch: OSMD=${graphicNotes.length} score=${expected.length}. Coloring may be misaligned.`,
    );
  }
}

// Collect source notes (skipping rests) from OSMD's GraphicSheet in reading
// order. This uses OSMD's public traversal API but with defensive guards —
// internal shape has changed across minor versions.
//
// The shape we rely on:
//   osmd.GraphicSheet.MeasureList: GraphicalMeasure[][]  // [measureIdx][staffIdx]
//   measure.staffEntries: GraphicalStaffEntry[]
//   staffEntry.graphicalVoiceEntries: GraphicalVoiceEntry[]
//   voiceEntry.notes: GraphicalNote[]
//   graphicalNote.sourceNote: Note (with .isRest(), .NoteheadColor)
function collectGraphicalNotes(
  osmd: InstanceType<OsmdModule['OpenSheetMusicDisplay']>,
): unknown[] {
  const out: unknown[] = [];
  // `as any`: OSMD's published types for the graphic tree are incomplete.
  // We walk a stable, public-but-undocumented structure.
  const anyOsmd = osmd as unknown as {
    GraphicSheet?: { MeasureList?: unknown[][] };
    graphic?: { MeasureList?: unknown[][] };
  };
  const measureList =
    anyOsmd.GraphicSheet?.MeasureList ??
    anyOsmd.graphic?.MeasureList ??
    [];

  for (const measureRow of measureList) {
    if (!measureRow) continue;
    // Within a measure, walk *each staff* in reading order. We need to
    // interleave staves by voice-entry time to match our scoreAligner —
    // but since our aligner emits voice 1 first then backs up and emits
    // voice 2, and OSMD organizes staves in parallel, the simplest
    // alignment is: for each measure, emit staff 1 entries in order, then
    // staff 2 entries in order. That matches our scoreAligner exactly.
    for (const measure of measureRow as Array<{
      staffEntries?: Array<{
        graphicalVoiceEntries?: Array<{
          notes?: Array<{ sourceNote?: { isRest?: () => boolean; isRestFlag?: boolean } }>;
        }>;
      }>;
    }>) {
      if (!measure || !measure.staffEntries) continue;
      for (const se of measure.staffEntries) {
        if (!se.graphicalVoiceEntries) continue;
        for (const gve of se.graphicalVoiceEntries) {
          if (!gve.notes) continue;
          for (const gn of gve.notes) {
            const sn = gn.sourceNote;
            if (!sn) continue;
            const isRest =
              typeof sn.isRest === 'function'
                ? sn.isRest()
                : Boolean(sn.isRestFlag);
            if (isRest) continue;
            out.push(sn);
          }
        }
      }
    }
  }
  return out;
}

export default SheetMusicView;
