"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Disc3,
  Music2,
  Pause,
  Play,
  SkipForward,
  Upload,
  Radio,
} from "lucide-react";
import { CHANNEL_ID } from "@/lib/supabase";

const MUSIC_API = process.env.NEXT_PUBLIC_MUSIC_ENGINE_URL || "http://localhost:3003";

const PROVIDERS = [
  { id: "tiktok_sounds", label: "TikTok Sounds" },
  { id: "epidemic", label: "Epidemic" },
  { id: "artlist", label: "Artlist" },
  { id: "soundstripe", label: "Soundstripe" },
  { id: "uppbeat", label: "Uppbeat" },
] as const;

type Track = {
  id: string;
  title: string;
  artist?: string | null;
  source: string;
  bpm?: number | null;
  is_cleared_for_live: boolean;
  duration_sec?: number | null;
};

type ProviderRow = {
  provider: string;
  is_connected: boolean;
};

export function MusicBank({ onLog }: { onLog?: (msg: string) => void }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [liveOk, setLiveOk] = useState<"…" | "UP" | "DOWN">("…");
  const [busy, setBusy] = useState(false);
  const [blockMsg, setBlockMsg] = useState<string | null>(null);
  const [upload, setUpload] = useState({ title: "", artist: "", cleared: false });

  const log = (msg: string) => onLog?.(msg);

  const load = useCallback(async () => {
    try {
      const [tRes, pRes, nRes] = await Promise.all([
        fetch(`${MUSIC_API}/music/tracks?channel_id=${CHANNEL_ID}`),
        fetch(`${MUSIC_API}/music/providers?channel_id=${CHANNEL_ID}`),
        fetch(`${MUSIC_API}/music/now-playing?channel_id=${CHANNEL_ID}`),
      ]);
      if (!tRes.ok) throw new Error(String(tRes.status));
      const tJson = await tRes.json();
      const pJson = await pRes.json().catch(() => ({ providers: [] }));
      const nJson = await nRes.json().catch(() => ({}));
      setTracks(tJson.tracks || []);
      setProviders(pJson.providers || []);
      setNowPlaying(nJson.overlay || null);
      setPlayingId(nJson.track?.id || null);
      setLiveOk("UP");
    } catch {
      setLiveOk("DOWN");
      log(`[ENGINE] Music Bank load failed — is :3003 running?`);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  async function connect(provider: string) {
    setBusy(true);
    setBlockMsg(null);
    try {
      const res = await fetch(`${MUSIC_API}/music/connect`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider, channel_id: CHANNEL_ID }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBlockMsg(json.error || "Connect failed");
        log(`[ENGINE] Music connect blocked — ${json.error}`);
        setBusy(false);
        return;
      }
      log(`[ENGINE] Music connected — ${provider}`);
      await load();
    } catch (err) {
      log(`[ENGINE] Music connect failed — ${err instanceof Error ? err.message : "error"}`);
    }
    setBusy(false);
  }

  async function tryPersonal(provider: string) {
    setBusy(true);
    setBlockMsg(null);
    const res = await fetch(`${MUSIC_API}/music/connect`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider, channel_id: CHANNEL_ID }),
    });
    const json = await res.json();
    setBlockMsg(json.error || "Blocked");
    log(`[ENGINE] Music personal stream BLOCKED — ${provider}`);
    setBusy(false);
  }

  async function play(trackId: string) {
    setBusy(true);
    setBlockMsg(null);
    try {
      const res = await fetch(`${MUSIC_API}/music/play`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ track_id: trackId, channel_id: CHANNEL_ID }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBlockMsg(json.error || "Play blocked");
        log(`[ENGINE] Music play blocked — ${json.error}`);
        setBusy(false);
        return;
      }
      setNowPlaying(json.nowPlaying);
      setPlayingId(trackId);
      log(`[ENGINE] Music play → ${json.track?.title}`);
    } catch (err) {
      log(`[ENGINE] Music play failed — ${err instanceof Error ? err.message : "error"}`);
    }
    setBusy(false);
  }

  async function pause() {
    await fetch(`${MUSIC_API}/music/pause`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channel_id: CHANNEL_ID }),
    });
    setNowPlaying(null);
    log(`[ENGINE] Music paused`);
  }

  async function queueNext(trackId: string) {
    const res = await fetch(`${MUSIC_API}/music/queue`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ track_id: trackId, channel_id: CHANNEL_ID, crossfade_sec: 3 }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBlockMsg(json.error);
      return;
    }
    log(`[ENGINE] Music queued → ${json.queued} (3s crossfade)`);
  }

  async function djMode() {
    setBusy(true);
    try {
      const res = await fetch(`${MUSIC_API}/music/dj-mode`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ channel_id: CHANNEL_ID, wallpaper: "Neon Club" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "DJ mode failed");
      setNowPlaying(
        json.track
          ? `♪ ${json.track.title} — ${json.track.artist || ""} | DJ Mode`
          : null
      );
      setPlayingId(json.track?.id || null);
      log(`[ENGINE] Music DJ Mode — playlist + wallpaper`);
    } catch (err) {
      log(`[ENGINE] DJ Mode failed — ${err instanceof Error ? err.message : "error"}`);
    }
    setBusy(false);
  }

  async function uploadOwn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`${MUSIC_API}/music/upload`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          channel_id: CHANNEL_ID,
          title: upload.title,
          artist: upload.artist || "Own Upload",
          is_cleared_for_live: upload.cleared,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      log(`[ENGINE] Music upload — ${json.track.title} (cleared=${upload.cleared})`);
      setUpload({ title: "", artist: "", cleared: false });
      // Refresh including uncleared so creator sees blocked state if needed
      const tRes = await fetch(
        `${MUSIC_API}/music/tracks?channel_id=${CHANNEL_ID}&include_uncleared=1`
      );
      const tJson = await tRes.json();
      setTracks((tJson.tracks || []).filter((t: Track) => t.is_cleared_for_live));
      if (!upload.cleared) {
        setBlockMsg(
          "Own upload saved but not cleared for LIVE — mark cleared before play."
        );
      }
    } catch (err) {
      log(`[ENGINE] Music upload failed — ${err instanceof Error ? err.message : "error"}`);
    }
    setBusy(false);
  }

  const connected = new Set(providers.filter((p) => p.is_connected).map((p) => p.provider));

  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold flex items-center gap-2">
          <Disc3 size={16} className="text-pink-400" /> MUSIC BANK
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              liveOk === "UP"
                ? "bg-[#2eff8f]/15 text-[#2eff8f]"
                : liveOk === "DOWN"
                  ? "bg-[#ff2a4d]/15 text-[#ff2a4d]"
                  : "bg-white/10 text-white/50"
            }`}
          >
            {liveOk === "UP" ? `SUPABASE · ${tracks.length} cleared` : liveOk}
          </span>
        </h3>
        <button
          type="button"
          disabled={busy}
          onClick={djMode}
          className="rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 px-3 py-1.5 text-[11px] font-bold text-black"
        >
          <Radio size={12} className="inline mr-1" /> DJ Mode
        </button>
      </div>

      <div className="mb-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[12px] leading-relaxed text-amber-100">
        <AlertTriangle size={14} className="inline mr-1 text-amber-300" />
        Only licensed tracks can play on LIVE. Personal iTunes/Spotify is blocked for broadcast.
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={busy}
            onClick={() => connect(p.id)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              connected.has(p.id)
                ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                : "border-white/15 bg-white/5 text-white/70 hover:border-cyan-400"
            }`}
          >
            {connected.has(p.id) ? "✓ " : ""}
            {p.label}
          </button>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => tryPersonal("spotify")}
          className="rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-200"
          title="Will be blocked — personal streaming not allowed for LIVE"
        >
          Spotify (blocked)
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => tryPersonal("itunes")}
          className="rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-200"
        >
          iTunes (blocked)
        </button>
      </div>

      {blockMsg && (
        <p role="alert" className="mb-3 rounded-lg bg-red-500/15 border border-red-500/30 px-3 py-2 text-[12px] text-red-200">
          {blockMsg}
        </p>
      )}

      {nowPlaying && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2.5">
          <Music2 size={16} className="text-cyan-300 shrink-0" />
          <p className="min-w-0 flex-1 truncate text-[12px] font-semibold">{nowPlaying}</p>
          <button type="button" onClick={pause} className="rounded-full bg-white/10 p-1.5">
            <Pause size={14} />
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-[200px] overflow-y-auto mb-3">
        {tracks.length === 0 && (
          <p className="text-[12px] text-white/45">
            No cleared tracks yet — seed music_tracks or connect a licensed provider.
          </p>
        )}
        {tracks.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
              playingId === t.id
                ? "border-pink-400/40 bg-pink-400/10"
                : "border-white/10 bg-black/25"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[13px] truncate">{t.title}</p>
              <p className="text-[11px] text-white/55 truncate">
                {t.artist || "—"} · {t.source}
                {t.bpm ? ` · ${t.bpm} BPM` : ""} · CLEARED
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => play(t.id)}
              className="rounded-full bg-white px-2.5 py-1.5 text-black"
            >
              <Play size={13} fill="black" />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => queueNext(t.id)}
              className="rounded-full border border-white/15 px-2.5 py-1.5"
              title="Queue with 3s crossfade"
            >
              <SkipForward size={13} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={uploadOwn} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          required
          value={upload.title}
          onChange={(e) => setUpload((u) => ({ ...u, title: e.target.value }))}
          placeholder="Own track title"
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[13px] outline-none focus:border-cyan-400"
        />
        <input
          value={upload.artist}
          onChange={(e) => setUpload((u) => ({ ...u, artist: e.target.value }))}
          placeholder="Artist"
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[13px] outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[12px] font-bold"
        >
          <Upload size={13} className="inline mr-1" /> Upload meta
        </button>
        <label className="sm:col-span-3 flex items-center gap-2 text-[11px] text-white/60">
          <input
            type="checkbox"
            checked={upload.cleared}
            onChange={(e) => setUpload((u) => ({ ...u, cleared: e.target.checked }))}
          />
          I confirm this track is cleared / royalty-free for LIVE broadcast
        </label>
      </form>
    </div>
  );
}
