-- TIKCAST LIVE · combined schema apply · soiybpixcgeyfucgnkmh
-- Paste into Supabase SQL Editor → Run

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

-- TIKCAST LIVE — storage buckets

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('wallpapers', 'wallpapers', true, 104857600, array['image/png','image/jpeg','image/webp','video/mp4']),
  ('videos', 'videos', false, 524288000, array['video/mp4','video/webm','video/quicktime']),
  ('clips', 'clips', true, 104857600, array['video/mp4','video/webm'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Wallpapers: public read, authenticated upload
drop policy if exists "wallpapers_public_read" on storage.objects;
create policy "wallpapers_public_read" on storage.objects
  for select using (bucket_id = 'wallpapers');

drop policy if exists "wallpapers_auth_insert" on storage.objects;
create policy "wallpapers_auth_insert" on storage.objects
  for insert with check (bucket_id = 'wallpapers' and auth.role() = 'authenticated');

drop policy if exists "wallpapers_auth_update" on storage.objects;
create policy "wallpapers_auth_update" on storage.objects
  for update using (bucket_id = 'wallpapers' and auth.role() = 'authenticated');

drop policy if exists "wallpapers_auth_delete" on storage.objects;
create policy "wallpapers_auth_delete" on storage.objects
  for delete using (bucket_id = 'wallpapers' and auth.role() = 'authenticated');

-- Videos: private — owner/authenticated only
drop policy if exists "videos_auth_select" on storage.objects;
create policy "videos_auth_select" on storage.objects
  for select using (bucket_id = 'videos' and auth.role() = 'authenticated');

drop policy if exists "videos_auth_insert" on storage.objects;
create policy "videos_auth_insert" on storage.objects
  for insert with check (bucket_id = 'videos' and auth.role() = 'authenticated');

drop policy if exists "videos_auth_update" on storage.objects;
create policy "videos_auth_update" on storage.objects
  for update using (bucket_id = 'videos' and auth.role() = 'authenticated');

drop policy if exists "videos_auth_delete" on storage.objects;
create policy "videos_auth_delete" on storage.objects
  for delete using (bucket_id = 'videos' and auth.role() = 'authenticated');

-- Clips: public read, authenticated write
drop policy if exists "clips_public_read" on storage.objects;
create policy "clips_public_read" on storage.objects
  for select using (bucket_id = 'clips');

drop policy if exists "clips_auth_insert" on storage.objects;
create policy "clips_auth_insert" on storage.objects
  for insert with check (bucket_id = 'clips' and auth.role() = 'authenticated');

drop policy if exists "clips_auth_update" on storage.objects;
create policy "clips_auth_update" on storage.objects
  for update using (bucket_id = 'clips' and auth.role() = 'authenticated');

drop policy if exists "clips_auth_delete" on storage.objects;
create policy "clips_auth_delete" on storage.objects
  for delete using (bucket_id = 'clips' and auth.role() = 'authenticated');

-- TIKCAST LIVE — Shop Overlay + Licensed Music Bank

-- ─── shop ───────────────────────────────────────────────────
create table if not exists shop_products (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  title text not null,
  description text,
  price_cents int not null,
  currency text default 'GBP',
  image_url text,
  product_url text,
  source text check (source in ('tiktok_shop','shopify','woocommerce','manual')),
  external_id text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists live_shop_queue (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  product_id uuid references shop_products(id) on delete cascade,
  display_duration_sec int default 60,
  order_index int default 0,
  is_showing boolean default false,
  shown_at timestamptz
);

create table if not exists shop_orders (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  product_id uuid references shop_products(id) on delete set null,
  buyer_username text,
  amount_cents int,
  status text default 'pending' check (status in ('pending','paid','shipped')),
  external_order_id text,
  created_at timestamptz default now()
);

-- ─── music bank ─────────────────────────────────────────────
create table if not exists music_tracks (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  title text not null,
  artist text,
  duration_sec int,
  file_url text,
  cover_url text,
  source text check (source in ('tiktok_sounds','epidemic','artlist','soundstripe','uppbeat','own_upload')),
  license_id text,
  license_expires_at timestamptz,
  is_cleared_for_live boolean default false,
  bpm int,
  genre text,
  created_at timestamptz default now()
);

create table if not exists music_playlists (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  name text not null,
  type text check (type in ('dj_set','chill','movie','morning')),
  created_at timestamptz default now()
);

create table if not exists music_playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references music_playlists(id) on delete cascade,
  track_id uuid references music_tracks(id) on delete cascade,
  order_index int default 0
);

create table if not exists music_providers (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  provider text check (provider in ('epidemic','artlist','soundstripe','uppbeat','tiktok_sounds')),
  access_token_encrypted text,
  is_connected boolean default false,
  connected_at timestamptz,
  unique (channel_id, provider)
);

create table if not exists music_now_playing (
  channel_id uuid primary key references channels(id) on delete cascade,
  track_id uuid references music_tracks(id) on delete set null,
  started_at timestamptz default now(),
  is_playing boolean default false
);

-- ─── indexes ────────────────────────────────────────────────
create index if not exists idx_shop_products_channel on shop_products(channel_id) where is_active = true;
create index if not exists idx_live_shop_queue_channel on live_shop_queue(channel_id, order_index);
create index if not exists idx_shop_orders_channel on shop_orders(channel_id, created_at desc);
create index if not exists idx_music_tracks_cleared on music_tracks(channel_id) where is_cleared_for_live = true;
create index if not exists idx_music_providers_channel on music_providers(channel_id);

-- ─── RLS ────────────────────────────────────────────────────
alter table shop_products enable row level security;
alter table live_shop_queue enable row level security;
alter table shop_orders enable row level security;
alter table music_tracks enable row level security;
alter table music_playlists enable row level security;
alter table music_playlist_items enable row level security;
alter table music_providers enable row level security;
alter table music_now_playing enable row level security;

drop policy if exists shop_products_auth on shop_products;
create policy shop_products_auth on shop_products for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists live_shop_queue_auth on live_shop_queue;
create policy live_shop_queue_auth on live_shop_queue for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists shop_orders_auth on shop_orders;
create policy shop_orders_auth on shop_orders for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists music_tracks_auth on music_tracks;
create policy music_tracks_auth on music_tracks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists music_playlists_auth on music_playlists;
create policy music_playlists_auth on music_playlists for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists music_playlist_items_auth on music_playlist_items;
create policy music_playlist_items_auth on music_playlist_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists music_providers_auth on music_providers;
create policy music_providers_auth on music_providers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists music_now_playing_auth on music_now_playing;
create policy music_now_playing_auth on music_now_playing for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Service role / anon read for engines via service key (policies above cover authenticated).
-- Allow public read of active shop products for overlay preview (optional)
drop policy if exists shop_products_public_read on shop_products;
create policy shop_products_public_read on shop_products for select using (is_active = true);

-- Realtime
do $$ begin
  alter publication supabase_realtime add table shop_orders;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table live_shop_queue;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table music_now_playing;
exception when duplicate_object then null;
end $$;

-- ─── storage buckets ────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('shop-images', 'shop-images', true, 10485760, array['image/png','image/jpeg','image/webp','image/gif']),
  ('music-tracks', 'music-tracks', false, 104857600, array['audio/mpeg','audio/mp4','audio/wav','audio/x-wav','audio/aac','audio/ogg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists shop_images_public_read on storage.objects;
create policy shop_images_public_read on storage.objects
  for select using (bucket_id = 'shop-images');
drop policy if exists shop_images_auth_write on storage.objects;
create policy shop_images_auth_write on storage.objects
  for insert with check (bucket_id = 'shop-images' and auth.role() = 'authenticated');
drop policy if exists shop_images_auth_update on storage.objects;
create policy shop_images_auth_update on storage.objects
  for update using (bucket_id = 'shop-images' and auth.role() = 'authenticated');
drop policy if exists shop_images_auth_delete on storage.objects;
create policy shop_images_auth_delete on storage.objects
  for delete using (bucket_id = 'shop-images' and auth.role() = 'authenticated');

drop policy if exists music_tracks_auth_select on storage.objects;
create policy music_tracks_auth_select on storage.objects
  for select using (bucket_id = 'music-tracks' and auth.role() = 'authenticated');
drop policy if exists music_tracks_auth_insert on storage.objects;
create policy music_tracks_auth_insert on storage.objects
  for insert with check (bucket_id = 'music-tracks' and auth.role() = 'authenticated');
drop policy if exists music_tracks_auth_update on storage.objects;
create policy music_tracks_auth_update on storage.objects
  for update using (bucket_id = 'music-tracks' and auth.role() = 'authenticated');
drop policy if exists music_tracks_auth_delete on storage.objects;
create policy music_tracks_auth_delete on storage.objects
  for delete using (bucket_id = 'music-tracks' and auth.role() = 'authenticated');

-- ─── seed demo shop + cleared music for default channel ─────
insert into shop_products (id, channel_id, title, description, price_cents, currency, image_url, product_url, source, is_active)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'TIKCAST Cap', 'Studio cap — black / red logo', 2400, 'GBP', 'https://placehold.co/400x400/ff2a4d/ffffff?text=CAP', 'https://shop.tikcast.live/cap', 'manual', true),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'Neon Hoodie', 'Late-night broadcast hoodie', 4900, 'GBP', 'https://placehold.co/400x400/22e6ff/000000?text=HOODIE', 'https://shop.tikcast.live/hoodie', 'shopify', true),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'On-Air Mic Pack', 'USB mic + boom arm kit', 8900, 'GBP', 'https://placehold.co/400x400/a855f7/ffffff?text=MIC', 'https://shop.tikcast.live/mic', 'tiktok_shop', true)
on conflict (id) do nothing;

insert into live_shop_queue (channel_id, product_id, display_duration_sec, order_index, is_showing)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101', 60, 0, false),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000102', 60, 1, false),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000103', 60, 2, false)
on conflict do nothing;

insert into music_tracks (id, channel_id, title, artist, duration_sec, source, license_id, is_cleared_for_live, bpm, genre, file_url)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', 'Neon After Hours', 'TIKCAST Safe Pool', 228, 'uppbeat', 'SAFE-POOL-001', true, 124, 'house', null),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001', 'Lofi Desk', 'TIKCAST Safe Pool', 196, 'tiktok_sounds', 'TT-SOUND-002', true, 86, 'lofi', null),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000001', 'Midnight Drive (Uncleared Demo)', 'Blocked Example', 180, 'own_upload', null, false, 118, 'synth', null)
on conflict (id) do nothing;

insert into music_playlists (id, channel_id, name, type)
values ('00000000-0000-4000-8000-000000000210', '00000000-0000-4000-8000-000000000001', 'Night Desk FM', 'dj_set')
on conflict (id) do nothing;

insert into music_playlist_items (playlist_id, track_id, order_index)
values
  ('00000000-0000-4000-8000-000000000210', '00000000-0000-4000-8000-000000000201', 0),
  ('00000000-0000-4000-8000-000000000210', '00000000-0000-4000-8000-000000000202', 1)
on conflict do nothing;


notify pgrst, 'reload schema';
