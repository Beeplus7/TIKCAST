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
create policy "wallpapers_public_read" on storage.objects
  for select using (bucket_id = 'wallpapers');

create policy "wallpapers_auth_insert" on storage.objects
  for insert with check (bucket_id = 'wallpapers' and auth.role() = 'authenticated');

create policy "wallpapers_auth_update" on storage.objects
  for update using (bucket_id = 'wallpapers' and auth.role() = 'authenticated');

create policy "wallpapers_auth_delete" on storage.objects
  for delete using (bucket_id = 'wallpapers' and auth.role() = 'authenticated');

-- Videos: private — owner/authenticated only
create policy "videos_auth_select" on storage.objects
  for select using (bucket_id = 'videos' and auth.role() = 'authenticated');

create policy "videos_auth_insert" on storage.objects
  for insert with check (bucket_id = 'videos' and auth.role() = 'authenticated');

create policy "videos_auth_update" on storage.objects
  for update using (bucket_id = 'videos' and auth.role() = 'authenticated');

create policy "videos_auth_delete" on storage.objects
  for delete using (bucket_id = 'videos' and auth.role() = 'authenticated');

-- Clips: public read, authenticated write
create policy "clips_public_read" on storage.objects
  for select using (bucket_id = 'clips');

create policy "clips_auth_insert" on storage.objects
  for insert with check (bucket_id = 'clips' and auth.role() = 'authenticated');

create policy "clips_auth_update" on storage.objects
  for update using (bucket_id = 'clips' and auth.role() = 'authenticated');

create policy "clips_auth_delete" on storage.objects
  for delete using (bucket_id = 'clips' and auth.role() = 'authenticated');