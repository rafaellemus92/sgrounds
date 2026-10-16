-- Piano trainer session persistence.
--
-- Each row records one practice session: which piece, how it went, and the
-- compressed r(t) + pitch-histogram traces for post-hoc analytics.
--
-- Mythological framing (per CLAUDE.md): each session is a thread spun by
-- the Norns — a wyrd-reading of the player's phase-coupling at that
-- moment in time. The archive is the tapestry.

create extension if not exists "pgcrypto";

create table if not exists public.piano_sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete cascade,
  piece_id       text not null,
  piece_title    text,
  started_at     timestamptz not null default now(),
  duration_sec   real not null,
  tempo_bpm      real not null,

  -- Headline numbers.
  accuracy_pct   real not null,          -- (correct / (correct+wrong+missed)) × 100
  mean_r         real not null,          -- time-averaged Kuramoto order parameter
  psd_slope      real not null,          -- log-log slope of IOI PSD; target ≈ −1

  -- Full traces (compressed on client side before insert).
  r_series       jsonb not null,         -- [{t: number, r: number}, ...] downsampled
  pitch_hist     jsonb not null,         -- {lh, rh, combined: number[12]}

  created_at     timestamptz not null default now()
);

create index if not exists piano_sessions_user_time_idx
  on public.piano_sessions (user_id, started_at desc);

alter table public.piano_sessions enable row level security;

-- A player owns their own threads: can read, write, and delete.
drop policy if exists "piano_sessions_read_own" on public.piano_sessions;
create policy "piano_sessions_read_own" on public.piano_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "piano_sessions_insert_own" on public.piano_sessions;
create policy "piano_sessions_insert_own" on public.piano_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "piano_sessions_delete_own" on public.piano_sessions;
create policy "piano_sessions_delete_own" on public.piano_sessions
  for delete using (auth.uid() = user_id);
