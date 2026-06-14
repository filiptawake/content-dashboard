# Supabase — the persistent data layer

This is the **optional** Postgres backend for Tenfold Content OS. It mirrors the
AI layer: with no env vars set the app runs entirely on the demo data in
`src/data/*`; once configured, the data layer reads from / writes to Postgres.

## What's here

| File | Purpose |
|------|---------|
| `migrations/0001_init.sql` | All tables + enums + indexes + RLS. One table per domain type in `src/lib/types.ts`. |
| `seed.sql` | A small starter row set so a fresh project isn't empty. |

### Tables

`accounts`, `hooks`, `materials`, `competitor_reels`, `reels` (own posts),
`metrics_daily` (one row per account/metric/day — the IG cron's target),
`scheduled_posts`, `trend_items` (global).

## Setup

1. **Create a project** at [supabase.com](https://supabase.com) → grab the
   Project URL and the `anon` + `service_role` keys from
   *Project Settings → API*.

2. **Set env vars** (locally in `.env.local`, and in Vercel → Project →
   Settings → Environment Variables — see `.env.example`):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
   SUPABASE_SERVICE_ROLE_KEY=ey...        # server-only, never exposed to the client
   ```

3. **Apply the schema** — either:

   - **Supabase CLI** (recommended):
     ```bash
     supabase link --project-ref <ref>
     supabase db push            # applies migrations/
     psql "$DATABASE_URL" -f supabase/seed.sql   # or run seed.sql in the SQL editor
     ```
   - **SQL editor**: paste `migrations/0001_init.sql`, run it, then `seed.sql`.

## How the app uses it

`src/lib/supabase.ts` exposes two factories:

- `getSupabase()` — anon client, respects RLS. For reads. Returns `null` in demo
  mode so callers fall back to `src/data/*`.
- `getServiceSupabase()` — service-role client, **bypasses RLS**, server-only.
  The seam that API routes and n8n workflows write through.

```ts
import { getSupabase } from "@/lib/supabase";

const db = getSupabase();
const hooks = db
  ? (await db.from("hooks").select("*").eq("account_id", id)).data
  : seedHooks.filter((h) => h.accountId === id); // demo fallback
```

## Notes

- **RLS** is enabled on every table with a permissive public-read policy — fine
  for a single-operator v1. Tighten with real auth before multi-user.
- **Typed client**: after the project exists, generate bindings with
  `npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts`
  and switch `createClient` to `createClient<Database>`.
- **Next step**: the providers still read from `src/data/*`. Wiring them to read
  through `getSupabase()` (with the demo fallback above) is the follow-up to this
  foundation.
