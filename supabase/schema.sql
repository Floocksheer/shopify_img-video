-- Lumora database schema
-- Paste into the Supabase SQL editor (Dashboard → SQL) and run once.

-- ── profiles ─────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  stripe_customer_id text,
  plan text not null default 'trial' check (plan in ('trial', 'starter', 'pro')),
  trial_ends_at timestamptz,
  shopify_domain text,
  shopify_token text,
  created_at timestamptz not null default now()
);

-- auto-create a profile on signup (trial ends in 7 days)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, trial_ends_at)
  values (new.id, new.email, now() + interval '7 days');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── generations ──────────────────────────────────────────────────────
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('photo', 'video')),
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  input_url text,
  output_url text not null,
  prompt_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at desc);

-- ── usage (per calendar month) ───────────────────────────────────────
create table if not exists public.usage (
  user_id uuid not null references public.profiles (id) on delete cascade,
  period_start timestamptz not null,
  photos_used integer not null default 0,
  videos_used integer not null default 0,
  primary key (user_id, period_start)
);

-- ── competitor analyses ──────────────────────────────────────────────
create table if not exists public.competitor_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  store_url text not null,
  images jsonb not null default '[]'::jsonb,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ── row level security: owner-only on everything ─────────────────────
alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.usage enable row level security;
alter table public.competitor_analyses enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own generations" on public.generations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own usage" on public.usage
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own analyses" on public.competitor_analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
