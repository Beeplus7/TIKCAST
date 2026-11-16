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
