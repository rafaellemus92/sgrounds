// Session persistence for the piano trainer.
//
// Primary path: Supabase, authenticated. The `piano_sessions` table carries
// the headline numbers and compressed traces for every finished practice
// session, and RLS keeps each player's threads to themselves.
//
// Fallback: when the Supabase env vars are missing or the user isn't signed
// in, we persist to `localStorage` under `sg-piano-sessions`. The archive
// still works; it just lives on the device until the user signs in. On the
// first authenticated save we migrate anything local up to the server
// (one-shot, best-effort — nothing fails loudly here).
//
// Field discipline follows the migration SQL in supabase/migrations: every
// field in the row is derivable from a SessionResult, and the raw event
// stream deliberately isn't stored (too big, and the summaries we keep are
// what the player actually looks at).

import { createClient } from '@/lib/supabase/client';
import { histogramFromEvents } from './pitchHistogram';
import { interOnsetIntervals, welchPSD } from './onsetPSD';
import type { SessionReflection, SessionResult } from './types';

const LOCAL_KEY = 'sg-piano-sessions';

// A row as it lives in Supabase (and localStorage). Keep this flat so a
// listing page can render it without re-parsing anything heavy.
export interface SessionRow {
  id: string;
  user_id: string | null;
  piece_id: string;
  piece_title: string | null;
  started_at: string;           // ISO
  duration_sec: number;
  tempo_bpm: number;
  accuracy_pct: number;
  mean_r: number;
  psd_slope: number;
  r_series: { t: number; r: number }[];
  pitch_hist: {
    lh: number[];
    rh: number[];
    combined: number[];
  };
  // Reflection — nullable; set via updateReflection() after save.
  intention: string | null;
  passage: string | null;
  last_word: string | null;
  mood: string | null;
  created_at: string;
}

// Compress a dense r(t) series (we sample ~20Hz live) down to ~2Hz for
// storage. The viewer only ever renders this at ~200px wide anyway.
function downsampleRSeries(frames: SessionResult['rSeries'], hz = 2): { t: number; r: number }[] {
  if (frames.length === 0) return [];
  const dt = 1 / hz;
  const out: { t: number; r: number }[] = [];
  let bucketStart = frames[0].t;
  let sum = 0;
  let count = 0;
  for (const f of frames) {
    if (f.t - bucketStart >= dt) {
      out.push({ t: bucketStart + dt / 2, r: count > 0 ? sum / count : 0 });
      bucketStart = f.t;
      sum = 0;
      count = 0;
    }
    sum += f.r;
    count++;
  }
  if (count > 0) out.push({ t: bucketStart + dt / 2, r: sum / count });
  return out;
}

export interface SessionContext {
  pieceId: string;
  pieceTitle?: string;
}

export function buildRowFromResult(
  result: SessionResult,
  ctx: SessionContext,
  userId: string | null,
): Omit<SessionRow, 'id' | 'created_at'> {
  const hist = histogramFromEvents(result.events, result.durationSec);
  const iois = interOnsetIntervals(
    result.events.map(e => e.t).sort((a, b) => a - b),
  );
  const psd = welchPSD(iois);
  const meanR =
    result.rSeries.length > 0
      ? result.rSeries.reduce((a, f) => a + f.r, 0) / result.rSeries.length
      : 0;

  const refl = result.reflection ?? {};
  return {
    user_id: userId,
    piece_id: ctx.pieceId,
    piece_title: ctx.pieceTitle ?? null,
    started_at: new Date(
      Date.now() - result.durationSec * 1000,
    ).toISOString(),
    duration_sec: result.durationSec,
    tempo_bpm: result.config.tempoBpm,
    accuracy_pct: result.accuracyPct,
    mean_r: meanR,
    psd_slope: Number.isFinite(psd.slope) ? psd.slope : 0,
    r_series: downsampleRSeries(result.rSeries),
    pitch_hist: {
      lh: Array.from(hist.lh.byClass),
      rh: Array.from(hist.rh.byClass),
      combined: Array.from(hist.combined.byClass),
    },
    intention: refl.intention?.trim() || null,
    passage: refl.passage?.trim() || null,
    last_word: refl.lastWord?.trim() || null,
    mood: refl.mood?.trim() || null,
  };
}

// ─── Local storage fallback ──────────────────────────────────────────────

function hasLocalStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.getItem(LOCAL_KEY);
    return true;
  } catch {
    return false;
  }
}

function readLocal(): SessionRow[] {
  if (!hasLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: SessionRow[]): void {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
  } catch {
    // Quota or private mode — drop silently; next save will try again.
  }
}

// ─── Supabase availability probe ─────────────────────────────────────────

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url !== 'your_supabase_url');
}

export interface SaveOutcome {
  ok: boolean;
  mode: 'remote' | 'local' | 'skipped';
  rowId?: string;
  error?: string;
}

// Save a session. Prefers Supabase when a user is signed in; otherwise
// falls back to localStorage. Never throws — all failures land in the
// returned object. Caller decides whether to surface them.
export async function saveSession(
  result: SessionResult,
  ctx: SessionContext,
): Promise<SaveOutcome> {
  if (!isSupabaseConfigured()) {
    return persistLocal(result, ctx);
  }

  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? null;
    if (!userId) {
      return persistLocal(result, ctx);
    }

    const payload = buildRowFromResult(result, ctx, userId);
    const { data, error } = await supabase
      .from('piano_sessions')
      .insert(payload)
      .select('id')
      .single();
    if (error) {
      // Server rejected; keep the user's data by stashing it locally.
      persistLocal(result, ctx);
      return { ok: false, mode: 'local', error: error.message };
    }
    // Opportunistically push any older local rows up for the same user.
    void flushLocalToRemote(userId).catch(() => undefined);
    return { ok: true, mode: 'remote', rowId: data.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const local = persistLocal(result, ctx);
    return { ...local, error: msg };
  }
}

function persistLocal(result: SessionResult, ctx: SessionContext): SaveOutcome {
  if (!hasLocalStorage()) return { ok: false, mode: 'skipped' };
  const row: SessionRow = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...buildRowFromResult(result, ctx, null),
    created_at: new Date().toISOString(),
  };
  const rows = readLocal();
  rows.unshift(row);
  // Keep the local archive bounded — otherwise localStorage quota bites.
  if (rows.length > 50) rows.length = 50;
  writeLocal(rows);
  return { ok: true, mode: 'local', rowId: row.id };
}

// Update a saved row's reflection fields. Handles both remote and local
// rows. Returns the new row (or null on failure). Caller is responsible
// for propagating the new row into any list state they're holding.
export async function updateReflection(
  rowId: string,
  reflection: SessionReflection,
): Promise<SessionRow | null> {
  const patch = {
    intention: reflection.intention?.trim() || null,
    passage: reflection.passage?.trim() || null,
    last_word: reflection.lastWord?.trim() || null,
    mood: reflection.mood?.trim() || null,
  };

  if (rowId.startsWith('local-')) {
    const rows = readLocal();
    const idx = rows.findIndex(r => r.id === rowId);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...patch };
    writeLocal(rows);
    return rows[idx];
  }

  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('piano_sessions')
      .update(patch)
      .eq('id', rowId)
      .select('*')
      .single();
    if (error || !data) return null;
    return data as SessionRow;
  } catch {
    return null;
  }
}

// Push every locally-saved row for this user up to Supabase, then clear
// local. One-shot migration on sign-in. Best-effort — any error leaves the
// local archive intact.
async function flushLocalToRemote(userId: string): Promise<void> {
  const rows = readLocal();
  if (rows.length === 0) return;
  const supabase = createClient();
  const payloads = rows.map(r => ({
    user_id: userId,
    piece_id: r.piece_id,
    piece_title: r.piece_title,
    started_at: r.started_at,
    duration_sec: r.duration_sec,
    tempo_bpm: r.tempo_bpm,
    accuracy_pct: r.accuracy_pct,
    mean_r: r.mean_r,
    psd_slope: r.psd_slope,
    r_series: r.r_series,
    pitch_hist: r.pitch_hist,
    intention: r.intention,
    passage: r.passage,
    last_word: r.last_word,
    mood: r.mood,
  }));
  const { error } = await supabase.from('piano_sessions').insert(payloads);
  if (!error) writeLocal([]);
}

// ─── Reading ────────────────────────────────────────────────────────────

export async function listSessions(limit = 50): Promise<SessionRow[]> {
  if (!isSupabaseConfigured()) return readLocal().slice(0, limit);
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? null;
    if (!userId) return readLocal().slice(0, limit);

    const { data, error } = await supabase
      .from('piano_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);
    if (error) return readLocal().slice(0, limit);
    return (data ?? []) as SessionRow[];
  } catch {
    return readLocal().slice(0, limit);
  }
}

export async function deleteSession(id: string): Promise<boolean> {
  if (id.startsWith('local-')) {
    writeLocal(readLocal().filter(r => r.id !== id));
    return true;
  }
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = createClient();
    const { error } = await supabase.from('piano_sessions').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
