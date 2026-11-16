require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Node < 22: supabase-js realtime needs a WebSocket impl
if (typeof globalThis.WebSocket === 'undefined') {
  try {
    globalThis.WebSocket = require('ws');
  } catch {
    /* optional */
  }
}

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const PORT = Number(process.env.MUSIC_ENGINE_PORT || 3003);
const CHANNEL_ID =
  process.env.CHANNEL_ID || '00000000-0000-4000-8000-000000000001';
const OBS_URL = process.env.OBS_CONTROLLER_URL || 'http://localhost:3011';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TOKEN_SECRET = process.env.MUSIC_TOKEN_SECRET || 'tikcast-music-dev-secret-change-me';

const ALLOWED_PROVIDERS = new Set([
  'epidemic',
  'artlist',
  'soundstripe',
  'uppbeat',
  'tiktok_sounds',
]);

const BLOCKED_PERSONAL = new Set([
  'spotify',
  'itunes',
  'apple_music',
  'apple-music',
  'youtube_music',
  'amazon_music',
  'personal',
]);

const PERSONAL_BLOCK_MSG =
  'Personal Spotify/iTunes is for private listening only, not for LIVE broadcast. Use Licensed Music Bank instead.';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const supabase =
  SUPABASE_URL && SERVICE_KEY
    ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
    : null;

let queue = [];
let crossfadeTimer = null;

function encryptToken(plain) {
  const key = crypto.createHash('sha256').update(TOKEN_SECRET).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

async function obsCall(path, body) {
  try {
    const res = await fetch(`${OBS_URL}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json().catch(() => ({ ok: false, mock: true }));
  } catch {
    console.log(`[ENGINE] Music OBS ${path} (mock — OBS offline)`);
    return { ok: true, mock: true };
  }
}

async function setNowPlayingOverlay(track, providerLabel) {
  const text = track
    ? `♪ Now Playing: ${track.title}${track.artist ? ` — ${track.artist}` : ''} | Licensed via ${providerLabel}`
    : '';
  await obsCall('/source/visibility', {
    sourceName: 'Now_Playing',
    visible: Boolean(track),
    settings: { text, track },
  });
  await obsCall('/source/visibility', {
    sourceName: 'Music_Bank',
    visible: Boolean(track),
    settings: { fileUrl: track?.file_url || null },
  });
}

function providerLabel(source) {
  const map = {
    epidemic: 'Epidemic Sound',
    artlist: 'Artlist',
    soundstripe: 'Soundstripe',
    uppbeat: 'Uppbeat / TIKCAST Safe Pool',
    tiktok_sounds: 'TikTok Sounds',
    own_upload: 'Creator Upload',
  };
  return map[source] || source || 'Licensed Catalog';
}

app.get('/health', (_req, res) => {
  res.json({
    service: 'music-engine',
    supabase: Boolean(supabase),
    personalStreamingBlocked: true,
    ok: true,
  });
});

app.post('/music/connect', async (req, res) => {
  try {
    const provider = String(req.body?.provider || '')
      .toLowerCase()
      .trim();
    const channelId = req.body?.channel_id || CHANNEL_ID;

    if (BLOCKED_PERSONAL.has(provider)) {
      console.log(`[ENGINE] Music BLOCKED personal provider: ${provider}`);
      return res.status(403).json({
        error: PERSONAL_BLOCK_MSG,
        blocked: true,
        provider,
      });
    }

    if (!ALLOWED_PROVIDERS.has(provider)) {
      return res.status(400).json({
        error: `Provider not allowed. Use: ${[...ALLOWED_PROVIDERS].join(', ')}`,
      });
    }

    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });

    // Mock OAuth token — real OAuth would exchange code here
    const accessToken = req.body?.access_token || `mock-${provider}-${Date.now()}`;
    const encrypted = encryptToken(accessToken);

    const { data, error } = await supabase
      .from('music_providers')
      .upsert(
        {
          channel_id: channelId,
          provider,
          access_token_encrypted: encrypted,
          is_connected: true,
          connected_at: new Date().toISOString(),
        },
        { onConflict: 'channel_id,provider' }
      )
      .select()
      .single();
    if (error) throw error;

    // Seed a couple cleared demo tracks for this provider if none exist
    const { count } = await supabase
      .from('music_tracks')
      .select('*', { count: 'exact', head: true })
      .eq('channel_id', channelId)
      .eq('source', provider);
    if (!count) {
      await supabase.from('music_tracks').insert([
        {
          channel_id: channelId,
          title: `${providerLabel(provider)} Demo A`,
          artist: providerLabel(provider),
          duration_sec: 180,
          source: provider,
          license_id: `${provider.toUpperCase()}-DEMO-A`,
          is_cleared_for_live: true,
          bpm: 120,
          genre: 'electronic',
        },
        {
          channel_id: channelId,
          title: `${providerLabel(provider)} Demo B`,
          artist: providerLabel(provider),
          duration_sec: 200,
          source: provider,
          license_id: `${provider.toUpperCase()}-DEMO-B`,
          is_cleared_for_live: true,
          bpm: 98,
          genre: 'chill',
        },
      ]);
    }

    console.log(`[ENGINE] Music provider connected: ${provider}`);
    res.json({
      ok: true,
      provider: data,
      warning: null,
      note: 'Only licensed catalog tokens are stored. Personal streaming logins are blocked.',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/music/providers', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const channelId = req.query.channel_id || CHANNEL_ID;
    const { data, error } = await supabase
      .from('music_providers')
      .select('id, provider, is_connected, connected_at')
      .eq('channel_id', channelId);
    if (error) throw error;
    res.json({
      providers: data || [],
      allowed: [...ALLOWED_PROVIDERS],
      blocked: [...BLOCKED_PERSONAL],
      personalStreamingWarning: PERSONAL_BLOCK_MSG,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/music/tracks', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const channelId = req.query.channel_id || CHANNEL_ID;
    const includeUncleared = req.query.include_uncleared === '1';
    let q = supabase.from('music_tracks').select('*').eq('channel_id', channelId);
    if (!includeUncleared) q = q.eq('is_cleared_for_live', true);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ tracks: data || [], clearedOnly: !includeUncleared });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/music/play', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const trackId = req.body?.track_id;
    const channelId = req.body?.channel_id || CHANNEL_ID;
    if (!trackId) return res.status(400).json({ error: 'track_id required' });

    const { data: track, error } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('id', trackId)
      .maybeSingle();
    if (error) throw error;
    if (!track) return res.status(404).json({ error: 'Track not found' });

    if (!track.is_cleared_for_live) {
      console.log(`[ENGINE] Music BLOCKED uncleared track: ${track.title}`);
      return res.status(403).json({
        error: 'Track not cleared for LIVE broadcast',
        blocked: true,
        track_id: trackId,
      });
    }

    await supabase.from('music_now_playing').upsert({
      channel_id: channelId,
      track_id: track.id,
      started_at: new Date().toISOString(),
      is_playing: true,
    });

    await setNowPlayingOverlay(track, providerLabel(track.source));
    console.log(`[ENGINE] Music play → ${track.title} (${track.source})`);
    res.json({
      ok: true,
      track,
      nowPlaying: `♪ ${track.title} — ${track.artist || 'Unknown'} | Licensed via ${providerLabel(track.source)}`,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/music/pause', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const channelId = req.body?.channel_id || CHANNEL_ID;
    await supabase
      .from('music_now_playing')
      .update({ is_playing: false })
      .eq('channel_id', channelId);
    await obsCall('/source/visibility', { sourceName: 'Music_Bank', visible: false });
    res.json({ ok: true, is_playing: false });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/music/queue', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const trackId = req.body?.track_id;
    const channelId = req.body?.channel_id || CHANNEL_ID;
    if (!trackId) return res.status(400).json({ error: 'track_id required' });

    const { data: track, error } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('id', trackId)
      .maybeSingle();
    if (error) throw error;
    if (!track) return res.status(404).json({ error: 'Track not found' });
    if (!track.is_cleared_for_live) {
      return res.status(403).json({
        error: 'Track not cleared for LIVE broadcast',
        blocked: true,
      });
    }

    queue.push({ track, channelId });
    const crossfadeMs = Number(req.body?.crossfade_sec || 3) * 1000;

    if (crossfadeTimer) clearTimeout(crossfadeTimer);
    crossfadeTimer = setTimeout(async () => {
      const next = queue.shift();
      if (!next) return;
      try {
        await supabase.from('music_now_playing').upsert({
          channel_id: next.channelId,
          track_id: next.track.id,
          started_at: new Date().toISOString(),
          is_playing: true,
        });
        await setNowPlayingOverlay(next.track, providerLabel(next.track.source));
        console.log(`[ENGINE] Music crossfade → ${next.track.title}`);
      } catch (err) {
        console.warn('[ENGINE] Music queue play failed:', err.message);
      }
    }, Math.max(500, crossfadeMs));

    res.json({ ok: true, queued: track.title, queueLength: queue.length, crossfadeSec: crossfadeMs / 1000 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/music/now-playing', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const channelId = req.query.channel_id || CHANNEL_ID;
    const { data, error } = await supabase
      .from('music_now_playing')
      .select('*, music_tracks(*)')
      .eq('channel_id', channelId)
      .maybeSingle();
    if (error) throw error;
    const track = data?.music_tracks || null;
    res.json({
      is_playing: Boolean(data?.is_playing),
      started_at: data?.started_at || null,
      track,
      overlay: track
        ? `♪ Now Playing: ${track.title}${track.artist ? ` — ${track.artist}` : ''} | Licensed via ${providerLabel(track.source)}`
        : null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/music/playlists', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const channelId = req.query.channel_id || CHANNEL_ID;
    const { data, error } = await supabase
      .from('music_playlists')
      .select('*, music_playlist_items(order_index, music_tracks(*))')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ playlists: data || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/music/dj-mode', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const channelId = req.body?.channel_id || CHANNEL_ID;
    const wallpaper = req.body?.wallpaper || 'Neon Club';

    await obsCall('/scene', { sceneName: 'DJ Radio' });
    await obsCall('/wallpaper', { fileUrl: wallpaper });

    const { data: playlist } = await supabase
      .from('music_playlists')
      .select('*, music_playlist_items(order_index, track_id, music_tracks(*))')
      .eq('channel_id', channelId)
      .eq('type', 'dj_set')
      .limit(1)
      .maybeSingle();

    const items = (playlist?.music_playlist_items || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((i) => i.music_tracks)
      .filter((t) => t && t.is_cleared_for_live);

    if (!items.length) {
      return res.status(404).json({ error: 'No cleared DJ playlist tracks' });
    }

    const track = items[0];
    await supabase.from('music_now_playing').upsert({
      channel_id: channelId,
      track_id: track.id,
      started_at: new Date().toISOString(),
      is_playing: true,
    });
    await setNowPlayingOverlay(track, providerLabel(track.source));
    queue = items.slice(1).map((t) => ({ track: t, channelId }));

    console.log(`[ENGINE] Music DJ Mode → ${track.title} + wallpaper`);
    res.json({ ok: true, track, playlist: playlist?.name, queued: queue.length, wallpaper });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/music/upload', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const channelId = req.body?.channel_id || CHANNEL_ID;
    const title = String(req.body?.title || '').trim();
    if (!title) return res.status(400).json({ error: 'title required' });

    const cleared = Boolean(req.body?.is_cleared_for_live);
    const { data, error } = await supabase
      .from('music_tracks')
      .insert({
        channel_id: channelId,
        title,
        artist: req.body?.artist || 'Own Upload',
        duration_sec: Number(req.body?.duration_sec || 0) || null,
        file_url: req.body?.file_url || null,
        cover_url: req.body?.cover_url || null,
        source: 'own_upload',
        license_id: req.body?.license_id || null,
        is_cleared_for_live: cleared,
        bpm: req.body?.bpm ? Number(req.body.bpm) : null,
        genre: req.body?.genre || null,
      })
      .select()
      .single();
    if (error) throw error;
    res.json({
      track: data,
      note: cleared
        ? 'Track marked cleared for LIVE.'
        : 'Track saved but NOT cleared for LIVE — it cannot play until is_cleared_for_live=true.',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ENGINE] Music Bank Connected — listening on :${PORT}`);
  console.log('[ENGINE] Personal streaming (Spotify/iTunes) BLOCKED for LIVE broadcast');
});
