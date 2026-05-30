# Connex Supabase Setup

Connex uses Supabase only as shared live-demo storage. Supabase Auth is not used in this first demo integration.

## 1. Create or choose a Supabase project

Use the Connex-specific Supabase project:

- Project: `CONNEX`
- API base URL: `https://vkcqkbgkuweldeuxnjjh.supabase.co`

Use the base project URL above for `VITE_SUPABASE_URL`. Do not use a `/rest/v1/` URL as the app base URL.

## 2. Run schema

Open the Supabase SQL Editor and run:

```sql
-- supabase/migrations/001_connex_live_demo_schema.sql
```

`supabase/connex_live_demo_schema.sql` is kept as the same schema in a simpler handoff path.

The schema creates:

- `workers`
- `sites`
- `attendance_records`
- `active_punches`

RLS is enabled, with permissive anon demo policies. This is acceptable only for the live demo.

## 3. Generate local seed SQL

Run locally:

```bash
node scripts/export-supabase-seed.mjs
```

This writes:

```text
supabase/generated/connex_live_demo_seed.sql
```

That generated file contains live-demo worker credentials and passport numbers. It is ignored by Git and should not be committed.

## 4. Run seed

Open the generated seed SQL locally and run it in the Supabase SQL Editor.

It upserts:

- 21 workers
- 4 sites
- worker username/password demo credentials
- site GPS/radius/work-hour settings
- hourly rate `35.40`

It does not delete attendance records.

## 5. Configure app environment

Local `.env.local`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Vercel production environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Add them in Vercel under Project -> Settings -> Environment Variables.

Never use a Supabase service-role or secret key in the Vite frontend.

## 6. Daily health check

Run locally:

```bash
npm run health:connex
```

The check verifies:

- Production URL returns HTTP 200.
- Vite app shell/login page is present.
- Supabase REST reads work with the configured anon/publishable key.
- `workers` count is 21.
- `sites` count is 4.
- `active_punches` is readable.
- `attendance_records` is readable.
- Browser smoke check can load admin and detect if the app appears to be in local fallback mode, when local Playwright/Chrome is available.

Healthy output starts with:

```text
CONNEX_HEALTH_OK
```

Failed output starts with:

```text
CONNEX_HEALTH_FAIL
```

Failure output includes the failed check, likely cause, and next action. It must not print Supabase keys, worker passwords, or passport numbers.

For local daily automation, the script first checks local env vars and can also verify the public production Vite bundle without printing the Supabase config. If you prefer explicit local env, use ignored `.env.local`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Free-plan note:

- Vercel/Supabase free plans may have usage limits.
- Expected usage for 21 workers is low.
- Supabase Free projects may pause after inactivity.
- If the pilot becomes real production, review security, Supabase Auth, tighter RLS, backup policy, monitoring, and plan limits before relying on it operationally.
