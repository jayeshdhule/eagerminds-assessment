# EagerMinds Bookmarks — PRD

## Problem statement (verbatim)
Take-home build task: a small personal bookmarks app (linktree meets pocket).
- Email + password accounts, welcome email on signup
- Bookmarks (title, URL, public/private), per-user CRUD
- Hard privacy: another user must NOT be able to read/edit/delete via API/URL
- Public profile at `/<handle>`, unique handles
- Dashboard for signed-in users only
- Stack: Supabase + Resend + Vercel, Next.js + TS preferred

## Stack
Next.js 14 (App Router) + TypeScript + Tailwind + `@supabase/ssr` + Resend.

## Architecture
- Auth: Supabase email/password via `@supabase/ssr` cookie session.
- DB: Postgres on Supabase. Two tables: `profiles`, `bookmarks`. RLS enforced.
- Welcome email: Resend, sent from `/api/signup` route.
- Routing: middleware guards `/dashboard`.

## Implemented (2026-02-07)
- Landing (`/`), signup (`/signup`), login (`/login`), dashboard (`/dashboard`),
  public profile (`/[handle]`), 404.
- API routes: `/api/signup`, `/api/login`, `/api/logout`, `/api/handle`,
  `/api/bookmarks`, `/api/bookmarks/[id]`.
- `supabase/schema.sql` — tables, indexes, updated_at trigger, RLS policies.
- Server validators: handle regex `[a-zA-Z0-9_]{3,20}`, case-insensitive uniqueness,
  URL normalization, password ≥ 8.
- Resend welcome template with link to dashboard and public profile.

## User-managed setup (cannot be done from this env)
1. Run `supabase/schema.sql` in Supabase SQL editor.
2. Supabase → Authentication → Providers → Email → uncheck "Confirm email".
3. Push to GitHub, import into Vercel, set env vars, deploy.
4. Record agent sessions with Entire CLI per assignment.

## Backlog / Next
- P1: handle-availability live check in signup form (endpoint already exists).
- P1: OG preview / favicon scrape per bookmark for richer public page.
- P2: Drag-to-reorder for public links.
- P2: Rate-limit signup endpoint.
- P2: e2e tests with Playwright against a Supabase test project.
