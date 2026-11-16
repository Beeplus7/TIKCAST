-- TIKCAST LIVE — core schema
-- Profiles, channels, playout, scenes, safety, rights, schedules, clips

create extension if not exists "pgcrypto";

-- ─── profiles ───────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  handle text unique not null,
  avatar_url text,
  role text default 'creator' check (role in ('creator','producer','moderator','admin')),
  created_at timestamptz default now()
);

-- ─── channels ───────────────────────────────────────────────
create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete set null,
  name text not null,
  health_score int default 92 check (health_score between 0 and 100),
  is_live boolean default false,
  active_scene text default 'Full Cam',
  active_wallpaper text,
  kill_switch boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── playlists ──────────────────────────────────────────────
create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  title text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references playlists(id) on delete cascade,
  title text not null,
  type text default 'CLIP',
  duration_seconds int default 0,
  position int default 0,
  media_url text,
  rights_status text default 'CLEAR' check (rights_status in ('CLEAR','REVIEW','BLOCKED')),
  created_at timestamptz default now()
);

-- ─── scenes ─────────────────────────────────────────────────
create table if not exists scenes (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  name text not null,
  layout jsonb default '{}'::jsonb,
  wallpaper text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ─── wallpapers ─────────────────────────────────────────────
create table if not exists wallpapers (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  name text not null,
  file_url text,
  gradient text,
  media_type text default 'png' check (media_type in ('png','mp4','gradient')),
  is_active boolean default false,
  created_at timestamptz default now()
);

-- ─── schedules ──────────────────────────────────────────────
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  playlist_id uuid references playlists(id) on delete set null,
  scene_name text,
  wallpaper_name text,
  auto_start boolean default true,
  executed boolean default false,
  created_at timestamptz default now()
);

-- ─── moderation ─────────────────────────────────────────────
create table if not exists moderation_logs (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  user_handle text,
  keyword text,
  source text default 'chat' check (source in ('chat','audio','manual')),
  action text not null check (action in ('flag','warn','timeout','ban','kill_switch')),
  severity text default 'WARN' check (severity in ('WARN','HARD_BAN')),
  message text,
  created_at timestamptz default now()
);

-- ─── rights ─────────────────────────────────────────────────
create table if not exists rights_checks (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  video_name text not null,
  video_url text,
  owner_handle text,
  status text not null check (status in ('CLEAR','REVIEW','BLOCKED','GREEN','YELLOW','RED')),
  action text,
  proof_url text,
  reviewed_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ─── clips ──────────────────────────────────────────────────
create table if not exists clips (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  title text,
  storage_path text,
  public_url text,
  start_seconds numeric,
  end_seconds numeric,
  peak_score numeric,
  source_recording_url text,
  created_at timestamptz default now()
);

-- ─── gifts / comments / guests ──────────────────────────────
create table if not exists gifts (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  sender text not null,
  amount numeric default 0,
  gift_name text,
  message text,
  created_at timestamptz default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  user_handle text not null,
  body text not null,
  tag text,
  flagged boolean default false,
  created_at timestamptz default now()
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  name text not null,
  handle text,
  topic text,
  status text default 'waiting' check (status in ('waiting','approved','rejected','live','done')),
  created_at timestamptz default now()
);

-- ─── engine event log (dashboard TerminalLog) ───────────────
create table if not exists engine_logs (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  service text not null,
  level text default 'info',
  message text not null,
  created_at timestamptz default now()
);

-- ─── indexes ────────────────────────────────────────────────
create index if not exists idx_schedules_starts on schedules(starts_at) where executed = false;
create index if not exists idx_moderation_created on moderation_logs(created_at desc);
create index if not exists idx_comments_channel on comments(channel_id, created_at desc);
create index if not exists idx_gifts_channel on gifts(channel_id, created_at desc);
create index if not exists idx_rights_status on rights_checks(status);
create index if not exists idx_engine_logs_created on engine_logs(created_at desc);

-- ─── RLS ────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table channels enable row level security;
alter table playlists enable row level security;
alter table playlist_items enable row level security;
alter table scenes enable row level security;
alter table wallpapers enable row level security;
alter table schedules enable row level security;
alter table moderation_logs enable row level security;
alter table rights_checks enable row level security;
alter table clips enable row level security;
alter table gifts enable row level security;
alter table comments enable row level security;
alter table guests enable row level security;
alter table engine_logs enable row level security;

-- Authenticated users can read/write their own channel data (simplified producer policy)
drop policy if exists "profiles_self" on profiles;
create policy "profiles_self" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "channels_owner" on channels;
create policy "channels_owner" on channels for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "playlists_auth" on playlists;
create policy "playlists_auth" on playlists for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "playlist_items_auth" on playlist_items;
create policy "playlist_items_auth" on playlist_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "scenes_auth" on scenes;
create policy "scenes_auth" on scenes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "wallpapers_auth" on wallpapers;
create policy "wallpapers_auth" on wallpapers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "schedules_auth" on schedules;
create policy "schedules_auth" on schedules for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "moderation_auth" on moderation_logs;
create policy "moderation_auth" on moderation_logs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "rights_auth" on rights_checks;
create policy "rights_auth" on rights_checks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "clips_auth" on clips;
create policy "clips_auth" on clips for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "gifts_auth" on gifts;
create policy "gifts_auth" on gifts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "comments_auth" on comments;
create policy "comments_auth" on comments for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "guests_auth" on guests;
create policy "guests_auth" on guests for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "engine_logs_auth" on engine_logs;
create policy "engine_logs_auth" on engine_logs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Realtime publication
do $$ begin
  alter publication supabase_realtime add table comments;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table gifts;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table moderation_logs;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table engine_logs;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table channels;
exception when duplicate_object then null;
end $$;
-- ─── seed default channel + scenes ──────────────────────────
insert into channels (id, name, health_score, is_live)
values ('00000000-0000-4000-8000-000000000001', 'TikCast Studio • Daily Live', 92, false)
on conflict do nothing;

insert into scenes (channel_id, name, is_default) values
  ('00000000-0000-4000-8000-000000000001', 'Full Cam', true),
  ('00000000-0000-4000-8000-000000000001', 'Split Screen', false),
  ('00000000-0000-4000-8000-000000000001', 'Reaction', false),
  ('00000000-0000-4000-8000-000000000001', 'News Desk', false),
  ('00000000-0000-4000-8000-000000000001', 'Shopping', false),
  ('00000000-0000-4000-8000-000000000001', 'Gaming', false),
  ('00000000-0000-4000-8000-000000000001', 'DJ Radio', false),
  ('00000000-0000-4000-8000-000000000001', 'Movie Mode', false),
  ('00000000-0000-4000-8000-000000000001', 'BRB', false)
on conflict do nothing;

insert into wallpapers (channel_id, name, gradient, media_type, is_active) values
  ('00000000-0000-4000-8000-000000000001', 'Neon Club', 'radial-gradient(120% 120% at 15% 10%, #ff2b8a 0%, #2a0a2e 38%, #06080b 72%)', 'gradient', true),
  ('00000000-0000-4000-8000-000000000001', 'Cinema', 'linear-gradient(120deg,#ffb020 0%, #7a1e00 38%, #120a05 70%, #06080b 100%)', 'gradient', false),
  ('00000000-0000-4000-8000-000000000001', 'Lofi Room', 'radial-gradient(110% 110% at 78% 18%, #ffb7a0 0%, #7a4a6b 38%, #1a1426 68%, #06080b 100%)', 'gradient', false),
  ('00000000-0000-4000-8000-000000000001', 'Cyber Grid', 'linear-gradient(180deg,#03161c 0%, #062a31 45%, #06080b 100%)', 'gradient', false),
  ('00000000-0000-4000-8000-000000000001', 'Sunset Studio', 'linear-gradient(180deg,#ff7a1a 0%, #ff2b3d 38%, #2a0a2e 70%, #06080b 100%)', 'gradient', false),
  ('00000000-0000-4000-8000-000000000001', 'Midnight News', 'linear-gradient(135deg,#00e5ff 0%, #0a2a8a 35%, #06080b 72%)', 'gradient', false)
on conflict do nothing;

insert into playlists (id, channel_id, title, is_active)
values ('00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001', 'Morning Show', true)
on conflict do nothing;

insert into playlist_items (playlist_id, title, type, duration_seconds, position) values
  ('00000000-0000-4000-8000-000000000010', 'Morning Show — Live Open', 'LIVE SHOW', 2520, 1),
  ('00000000-0000-4000-8000-000000000010', 'Best Of Clip — Top Reactions', 'CLIP', 204, 2),
  ('00000000-0000-4000-8000-000000000010', 'Reaction Clip — Viral Moment', 'REACTION', 372, 3),
  ('00000000-0000-4000-8000-000000000010', 'DJ Set — Late Night Mix', 'MUSIC', 3480, 4)
on conflict do nothing;