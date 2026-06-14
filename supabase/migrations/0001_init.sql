-- Tenfold Content OS — initial schema.
-- Mirrors the domain types in src/lib/types.ts (snake_case columns).
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor.

-- ---- Enums ----------------------------------------------------------------
create type niche as enum ('ai', 'marketing', 'business', 'fitness', 'finance', 'mindset');
create type platform as enum ('instagram', 'tiktok', 'youtube');
create type hook_type as enum ('x-killed-y', 'stop-doing-x', 'n-things', 'nobody-talks', 'i-tried-x', 'doing-x-wrong');
create type hook_source as enum ('manual', 'competitor');
create type material_type as enum ('reel-format', 'caption-framework', 'carousel', 'b-roll', 'cover');
create type schedule_status as enum ('scheduled', 'draft', 'posted');
create type trend_tag as enum ('hook-potential', 'explainer', 'skip');
create type trend_source_type as enum ('blog', 'x', 'rss');
create type metric_key as enum ('views', 'saves', 'follows', 'dms');

-- ---- accounts -------------------------------------------------------------
create table accounts (
  id         text primary key,
  handle     text not null,
  name       text not null,
  niche      niche not null,
  followers  integer not null default 0,
  gradient   text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ---- hooks ----------------------------------------------------------------
create table hooks (
  id               text primary key default gen_random_uuid()::text,
  account_id       text not null references accounts (id) on delete cascade,
  text             text not null,
  hook_type        hook_type not null,
  niche            niche not null,
  original_creator text not null,
  views            bigint not null default 0,
  transcript       text,        -- optional, manually typed
  source_url       text,        -- reel link (we store the link, not a transcription)
  source           hook_source not null default 'manual',
  saved_at         timestamptz not null default now()
);
create index hooks_account_idx on hooks (account_id);

-- ---- materials ------------------------------------------------------------
create table materials (
  id          text primary key default gen_random_uuid()::text,
  account_id  text not null references accounts (id) on delete cascade,
  title       text not null,
  type        material_type not null,
  niche       niche not null,
  description text not null default '',
  url         text,             -- link to the asset (CapCut/Drive/reel)
  tags        text[] not null default '{}',
  body        text,             -- caption-framework template body
  seed        jsonb,            -- { hook?, angle?, cta? } dropped into /script
  usage_count integer not null default 0,
  gradient    text[] not null default '{}',
  added_at    timestamptz not null default now()
);
create index materials_account_idx on materials (account_id);

-- ---- competitor_reels -----------------------------------------------------
create table competitor_reels (
  id                    text primary key default gen_random_uuid()::text,
  tracked_by_account_id text not null references accounts (id) on delete cascade,
  creator_handle        text not null,
  creator_followers     bigint not null default 0,
  niche                 niche not null,
  scraped_at            timestamptz not null default now(),
  posted_at             timestamptz not null,
  views                 bigint not null default 0,
  hook                  text not null,
  on_screen_text        text,
  video_url             text not null,   -- reel link, no transcription
  audio_title           text,
  hook_type             hook_type not null
);
create index competitor_reels_account_idx on competitor_reels (tracked_by_account_id);

-- ---- reels (own posts — analytics + heaters) ------------------------------
create table reels (
  id         text primary key default gen_random_uuid()::text,
  account_id text not null references accounts (id) on delete cascade,
  hook       text not null,
  caption    text,
  posted_at  timestamptz not null,
  views      bigint not null default 0,
  saves      bigint not null default 0,
  likes      bigint not null default 0,
  comments   bigint not null default 0,
  shares     bigint not null default 0,
  follows    bigint not null default 0,
  note       text
);
create index reels_account_idx on reels (account_id);

-- ---- metrics_daily (one row per account/metric/day; the IG cron writes here)
create table metrics_daily (
  account_id text not null references accounts (id) on delete cascade,
  metric_key metric_key not null,
  day        date not null,
  value      bigint not null default 0,
  primary key (account_id, metric_key, day)
);

-- ---- scheduled_posts ------------------------------------------------------
create table scheduled_posts (
  id               text primary key default gen_random_uuid()::text,
  account_id       text not null references accounts (id) on delete cascade,
  title            text,
  hook             text not null,
  angle            text,
  cta              text,
  caption          text,
  platforms        platform[] not null default '{}',
  scheduled_for    timestamptz not null,
  status           schedule_status not null default 'scheduled',
  gradient         text[] not null default '{}',
  external_post_id text,            -- Zernio post id once posting is wired
  created_at       timestamptz not null default now()
);
create index scheduled_posts_account_idx on scheduled_posts (account_id);

-- ---- trend_items (global — not per account) -------------------------------
create table trend_items (
  id           text primary key default gen_random_uuid()::text,
  title        text not null,
  source       text not null,
  source_type  trend_source_type not null,
  url          text not null,
  summary      text,
  published_at timestamptz not null,
  tag          trend_tag not null,
  niche        niche not null,
  hook_angle   text
);
create index trend_items_published_idx on trend_items (published_at desc);

-- ---- Row Level Security ---------------------------------------------------
-- v1 is a single-operator dashboard with no end-user auth yet. Reads are open
-- to the anon key; writes go through the service-role key (which bypasses RLS)
-- from API routes / n8n. Tighten these once real auth lands.
alter table accounts         enable row level security;
alter table hooks            enable row level security;
alter table materials        enable row level security;
alter table competitor_reels enable row level security;
alter table reels            enable row level security;
alter table metrics_daily    enable row level security;
alter table scheduled_posts  enable row level security;
alter table trend_items      enable row level security;

create policy "public read" on accounts         for select using (true);
create policy "public read" on hooks            for select using (true);
create policy "public read" on materials        for select using (true);
create policy "public read" on competitor_reels for select using (true);
create policy "public read" on reels            for select using (true);
create policy "public read" on metrics_daily    for select using (true);
create policy "public read" on scheduled_posts  for select using (true);
create policy "public read" on trend_items      for select using (true);
