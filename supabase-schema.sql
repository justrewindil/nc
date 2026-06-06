-- ════════════════════════════════════════════════════════════════
--  JustFilmzz — Supabase schema
--  Run this ONCE in your Supabase dashboard → SQL Editor → New query → Run.
--  Enables cross-device sync of watchlist, favorites, ratings, progress,
--  profiles and comments. Until you run it, the app falls back to localStorage.
-- ════════════════════════════════════════════════════════════════

-- WATCHLIST + FAVORITES (kind = 'watchlist' | 'favorite')
create table if not exists public.library (
  user_id    uuid not null references auth.users on delete cascade,
  media_id   integer not null,
  media_type text not null,
  kind       text not null,
  title      text,
  poster     text,
  added_at   timestamptz default now(),
  primary key (user_id, media_id, media_type, kind)
);

-- CONTINUE WATCHING / PROGRESS
create table if not exists public.progress (
  user_id      uuid not null references auth.users on delete cascade,
  media_id     integer not null,
  media_type   text not null,
  title        text, poster text, backdrop text, year text,
  season       integer default 1,
  episode      integer default 1,
  current_time double precision default 0,
  duration     double precision default 0,
  progress     double precision default 0,
  updated_at   timestamptz default now(),
  primary key (user_id, media_id, media_type)
);

-- USER RATINGS (1–10)
create table if not exists public.ratings (
  user_id    uuid not null references auth.users on delete cascade,
  media_id   integer not null,
  media_type text not null,
  rating     integer not null,
  updated_at timestamptz default now(),
  primary key (user_id, media_id, media_type)
);

-- PROFILES
create table if not exists public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar       text,
  updated_at   timestamptz default now()
);

-- COMMENTS
create table if not exists public.comments (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users on delete cascade,
  media_id    integer not null,
  media_type  text not null,
  body        text not null,
  author_name text,
  created_at  timestamptz default now()
);

-- CARD GAME: WALLET (coins)
create table if not exists public.wallets (
  user_id      uuid primary key references auth.users on delete cascade,
  coins        integer default 0,
  earned_today integer default 0,
  day_key      text,
  updated_at   timestamptz default now()
);

-- CARD GAME: OWNED ACTOR CARDS
create table if not exists public.cards (
  user_id  uuid not null references auth.users on delete cascade,
  actor_id integer not null,
  name     text,
  profile  text,
  rarity   text,
  count    integer default 1,
  primary key (user_id, actor_id)
);

-- ── Row Level Security ──
alter table public.library  enable row level security;
alter table public.progress enable row level security;
alter table public.ratings  enable row level security;
alter table public.profiles enable row level security;
alter table public.comments enable row level security;
alter table public.wallets  enable row level security;
alter table public.cards    enable row level security;

-- owner-only access for personal data
create policy "own library"  on public.library  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress" on public.progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own ratings"  on public.ratings  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own wallet"   on public.wallets  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cards"    on public.cards    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- profiles: anyone signed-in can read (for comment names), only owner writes
create policy "profiles read"  on public.profiles for select using (true);
create policy "profiles write" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- comments: anyone can read; only owner can insert/delete their own
create policy "comments read"   on public.comments for select using (true);
create policy "comments insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments delete" on public.comments for delete using (auth.uid() = user_id);
