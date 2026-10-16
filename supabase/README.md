# Supabase setup — piano trainer

The piano trainer persists sessions to a `piano_sessions` table under the
same Supabase project the rest of sgrounds uses. Until you apply the
migration, the trainer silently falls back to `localStorage` on the device,
and the UI tells you so.

## 1. Make sure the env vars are set

The browser-side vars are the same ones sgrounds already uses:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

For local dev, copy `.env.local.example` → `.env.local` and fill it in.
For the deployed app (Vercel or similar), these should already be set.

## 2. Apply the migrations

Two files in `migrations/`, applied in filename order:

1. `20261016_piano_sessions.sql` — creates the table, index, and three
   per-user RLS policies.
2. `20261017_piano_session_reflections.sql` — adds the reflection columns
   (`intention`, `passage`, `last_word`, `mood`) and a partial index for
   the Lighthouse read.

Both are idempotent — safe to re-run.

Pick whichever path is lowest-friction for you.

### Option A — Supabase Studio (no CLI)

1. Open the SQL editor:
   `https://supabase.com/dashboard/project/<your-project-ref>/sql/new`
2. Paste the full contents of `migrations/20261016_piano_sessions.sql`.
3. Click **Run**.

### Option B — Supabase CLI

```sh
# One-time: link your local repo to the remote project.
npx supabase@latest link --project-ref <your-project-ref>

# Apply pending migrations in supabase/migrations/.
npx supabase@latest db push
```

### Option C — psql (direct)

Grab the project connection string from
`Project settings → Database → Connection string → URI`, then:

```sh
psql "$SUPABASE_DB_URL" -f supabase/migrations/20261016_piano_sessions.sql
psql "$SUPABASE_DB_URL" -f supabase/migrations/20261017_piano_session_reflections.sql
```

## 3. (Optional) Set the Lighthouse API key

For the cross-session reflection on `/piano/sessions`, set
`ANTHROPIC_API_KEY` server-side (Vercel → Project Settings → Environment
Variables, or in `.env.local` for local dev). Without it, the Lighthouse
button returns a 500 and the UI shows "lighthouse unreachable".

## 4. Verify

- Open `/piano`.
- Type an intention in the "bringing" field (optional).
- Play one session, hit **stop**.
- The analytics modal header should show the gold indicator:
  **● woven into the tapestry**
  (if you're signed in via `/auth` and the migrations are applied).
- Add a reflection (passage, last word, mood) at the bottom of the
  modal; click **save reflection**. The flash reads **● woven in**.
- Open `/piano/sessions` — your new row should be there with the r(t)
  sparkline *and* the reflection inline.
- With ≥ 1 session saved, click **ask the Lighthouse** to see a cross-
  session read.

If you see **○ held locally — sign in to weave**, you're not signed in
yet; go to `/auth` first.

If sessions never show up on `/piano/sessions` after being saved,
double-check that RLS is enabled and the three policies exist. In Studio:
`Database → Policies → public.piano_sessions`. Expected policies:

- `piano_sessions_read_own`   — SELECT, `auth.uid() = user_id`
- `piano_sessions_insert_own` — INSERT, `auth.uid() = user_id`
- `piano_sessions_delete_own` — DELETE, `auth.uid() = user_id`
