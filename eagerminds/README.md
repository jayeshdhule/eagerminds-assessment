# EagerMinds — Bookmarks

A tiny "linktree meets pocket". Sign up, claim a handle, save bookmarks
(public or private), and share `your-app.com/<handle>` with anyone.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (auth + Postgres + RLS) · Resend (welcome email) · Vercel (deploy).

---

## Run locally

```bash
# 1. Install
yarn install

# 2. Configure
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.

# 3. Apply DB schema
# Open Supabase → SQL editor → paste the contents of supabase/schema.sql → Run.

# 4. (one-time) Disable Supabase's built-in email confirmation
# Supabase Dashboard → Authentication → Providers → Email
#   → uncheck "Confirm email"
# (We send our own welcome via Resend and rely on Supabase's session cookie.)

# 5. Dev server
yarn dev
# → http://localhost:3000
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. In Project → Settings → Environment Variables, paste the same four keys
   from `.env.local`, plus set `NEXT_PUBLIC_APP_URL` to your Vercel URL
   (e.g. `https://eagerminds.vercel.app`).
4. Deploy. That's it.

## How the privacy model works

We do not rely on the UI for privacy. Every table has Row-Level Security:

- `profiles` — readable by anyone (needed to resolve `/<handle>`), but
  only the owner (`auth.uid() = id`) can insert/update their row.
- `bookmarks` — split into two SELECT policies:
  - `bookmarks_select_own`     — owner sees all their rows.
  - `bookmarks_select_public`  — anyone (including anon) sees rows where
    `is_public = true`.
  INSERT/UPDATE/DELETE require `auth.uid() = user_id`.

So even if someone hits the Supabase REST API directly with the anon key
and tries `GET /rest/v1/bookmarks?user_id=eq.<someone-else>`, Postgres
returns only the rows where `is_public = true`. There is no way to
read, edit, or delete another user's private bookmarks.

The API routes also filter `eq("user_id", user.id)` defensively, so we'd
catch any bug before it became a leak.

## Project layout

```
src/
  app/
    page.tsx                  landing
    layout.tsx                root layout + fonts
    login/, signup/           auth screens
    dashboard/                signed-in CRUD
    [handle]/page.tsx         public profile
    api/
      signup/route.ts         creates user + profile + welcome email
      login/route.ts          sign-in
      logout/route.ts         sign-out
      handle/route.ts         handle availability check
      bookmarks/route.ts      list + create
      bookmarks/[id]/route.ts patch + delete
  lib/
    supabase/{client,server,middleware}.ts
    resend.ts                 welcome email template
    validators.ts             handle / email / url helpers
  middleware.ts               guards /dashboard
supabase/
  schema.sql                  tables + RLS policies + trigger
```

## Where the AI agent got it wrong (and how I caught it)

I asked the agent to scaffold the whole app in one shot. It happily
wrote routes that filtered by `user_id` in the SQL query and called it
"secure" — but it had **not enabled RLS** on the tables. I caught this
by hitting the Supabase REST endpoint directly with the anon key and
seeing another user's bookmarks come back. Fixed by enabling RLS on
both tables and writing explicit `select/insert/update/delete` policies
in `supabase/schema.sql` so the database — not the API — is the source
of truth for who can read what. The API filters are still there, but
they're defense in depth, not the only line of defense.

The agent also initially used Supabase's default email-confirmation flow
*and* tried to send a Resend welcome — meaning new users got two emails
and were locked out until they clicked the Supabase one. I switched to
"disable Supabase confirmation, send one Resend welcome, log the user
in immediately via the session cookie returned by `signUp`".

## One thing I'd improve with more time

Add per-bookmark slug + Open Graph preview (favicon, title, og:image
scraped at save time) on the public profile, so `/<handle>` feels like
a real published page instead of a list of bare URLs. And add a
`reordering` column so users can curate the order their public links
appear in.
