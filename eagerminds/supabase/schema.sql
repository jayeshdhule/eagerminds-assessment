-- EagerMinds Bookmarks: schema + RLS
-- Run this in Supabase SQL editor once.

-- ============ profiles ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness for handle
create unique index if not exists profiles_handle_lower_idx
  on public.profiles (lower(handle));

-- ============ bookmarks ============
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);
create index if not exists bookmarks_user_public_idx on public.bookmarks(user_id, is_public);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookmarks_set_updated_at on public.bookmarks;
create trigger bookmarks_set_updated_at
  before update on public.bookmarks
  for each row execute function public.set_updated_at();

-- ============ Row Level Security ============
alter table public.profiles  enable row level security;
alter table public.bookmarks enable row level security;

-- profiles: anyone can read (so we can resolve /<handle> publicly),
-- but only the owner can insert/update their row.
drop policy if exists profiles_select_all     on public.profiles;
drop policy if exists profiles_insert_own     on public.profiles;
drop policy if exists profiles_update_own     on public.profiles;
create policy profiles_select_all on public.profiles
  for select using (true);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- bookmarks: owners can do anything; anonymous/other users can only
-- SELECT bookmarks that are explicitly is_public = true.
drop policy if exists bookmarks_select_own     on public.bookmarks;
drop policy if exists bookmarks_select_public  on public.bookmarks;
drop policy if exists bookmarks_insert_own     on public.bookmarks;
drop policy if exists bookmarks_update_own     on public.bookmarks;
drop policy if exists bookmarks_delete_own     on public.bookmarks;
create policy bookmarks_select_own on public.bookmarks
  for select using (auth.uid() = user_id);
create policy bookmarks_select_public on public.bookmarks
  for select using (is_public = true);
create policy bookmarks_insert_own on public.bookmarks
  for insert with check (auth.uid() = user_id);
create policy bookmarks_update_own on public.bookmarks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy bookmarks_delete_own on public.bookmarks
  for delete using (auth.uid() = user_id);
