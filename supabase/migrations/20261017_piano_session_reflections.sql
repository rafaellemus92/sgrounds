-- Session reflections — the bridge between the math and the moment.
--
-- A piano session carries not just the mathematical signature (r, slope,
-- histogram) but the lived experience that produced it: what you brought
-- to the piece (intention), what the playing surfaced (passage), one word
-- (last_word), and an optional mood tag.
--
-- These columns are what the Lighthouse reads across sessions when it
-- names a pattern. The math is the shape; the reflection is what the
-- shape felt like.

alter table public.piano_sessions
  add column if not exists intention  text,
  add column if not exists passage    text,
  add column if not exists last_word  text,
  add column if not exists mood       text;

-- A dedicated index for the "which sessions carry reflections" query the
-- Lighthouse route hits. Partial: only rows that have *something* to read.
create index if not exists piano_sessions_user_reflected_idx
  on public.piano_sessions (user_id, started_at desc)
  where passage is not null or last_word is not null;
