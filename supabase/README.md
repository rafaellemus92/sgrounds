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

## 2. Apply the migration

The only migration you need is
[`migrations/20261016_piano_sessions.sql`](migrations/20261016_piano_sessions.sql).
It creates the `piano_sessions` table, an index, and the three per-user
RLS policies. It's idempotent — safe to re-run.

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
```

## 3. Verify

- Open `/piano`.
- Play one session, hit **stop**.
- The analytics modal header should show the gold indicator:
  **● woven into the tapestry**
  (if you're signed in via `/auth` and the migration is applied).
- Open `/piano/sessions` — your new row should be there with the r(t)
  sparkline.

If you see **○ held locally — sign in to weave**, you're not signed in
yet; go to `/auth` first.

If sessions never show up on `/piano/sessions` after being saved,
double-check that RLS is enabled and the three policies exist. In Studio:
`Database → Policies → public.piano_sessions`. Expected policies:

- `piano_sessions_read_own`   — SELECT, `auth.uid() = user_id`
- `piano_sessions_insert_own` — INSERT, `auth.uid() = user_id`
- `piano_sessions_delete_own` — DELETE, `auth.uid() = user_id`
