"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  Clapperboard,
  Eye,
  Gift,
  Layers,
  Mic2,
  Pause,
  Play,
  Power,
  Radio,
  ShieldCheck,
  Sparkles,
  Square,
  Users,
  Video,
  Volume2,
  CalendarClock,
  Flag,
  AudioLines,
  Timer,
} from "lucide-react";
import { HealthScoreDial } from "./HealthScoreDial";
import { TerminalLog } from "./TerminalLog";
import { ShopPanel } from "./ShopPanel";
import { MusicBank } from "./MusicBank";
import {
  WALLPAPERS,
  SCENES,
  INITIAL_PLAYLIST,
  SCHEDULE,
  RIGHTS,
  COMMENT_POOL,
  fmtDuration,
  callObs,
  type PlaylistItem,
  type Wallpaper,
} from "@/lib/studio";
import { CHANNEL_ID, GATEWAY_API, isSupabaseConfigured, supabase } from "@/lib/supabase";

const SCENE_ICONS: Record<string, typeof Camera> = {
  "Full Cam": Camera,
  "Split Screen": Users,
  Reaction: Eye,
  "News Desk": Radio,
  Shopping: Gift,
  Gaming: Play,
  "DJ Radio": AudioLines,
  "Movie Mode": Clapperboard,
  BRB: Timer,
};

export function CommandCenter() {
  const [onAir, setOnAir] = useState(true);
  const [killed, setKilled] = useState(false);
  const [scene, setScene] = useState("Split Screen");
  const [wallpaper, setWallpaper] = useState<Wallpaper>(WALLPAPERS[0]);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(INITIAL_PLAYLIST);
  const [progress, setProgress] = useState(38);
  const [isPlaying, setIsPlaying] = useState(true);
  const [comments, setComments] = useState(COMMENT_POOL.slice(0, 4));
  const [gifts] = useState([
    { id: "gift1", from: "@nova", amount: "250 coins", msg: "For the best intro!" },
    { id: "gift2", from: "@jules", amount: "Rose ×12", msg: "Love this segment" },
    { id: "gift3", from: "@marc_o", amount: "100 coins", msg: "DJ set next please" },
  ]);
  const [health, setHealth] = useState(92);
  const [logs, setLogs] = useState<string[]>([
    `[ENGINE] Supabase ${isSupabaseConfigured ? "Connected — probing live stack…" : "Local mode — configure .env"}`,
  ]);
  const [stack, setStack] = useState<Record<string, string>>({
    obs: "…",
    shop: "…",
    music: "…",
    safety: "…",
    rtmp: "…",
  });
  const [viewers, setViewers] = useState(12847);
  const [liveSeconds, setLiveSeconds] = useState(42 * 60 + 18);
  const [toast, setToast] = useState("");
  const [modFeed, setModFeed] = useState<
    { id: string; keyword: string; action: string; at: string }[]
  >([]);
  const [testWord, setTestWord] = useState("");

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };
  const pushLog = (m: string) => setLogs((p) => [...p.slice(-40), m]);

  useEffect(() => {
    if (!onAir || !isPlaying) return;
    const t = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.4));
      setLiveSeconds((s) => s + 1);
      setViewers((v) => Math.max(9000, v + Math.floor(Math.random() * 41) - 18));
    }, 1000);
    return () => clearInterval(t);
  }, [onAir, isPlaying]);

  useEffect(() => {
    const shopApi = process.env.NEXT_PUBLIC_SHOP_ENGINE_URL || "http://localhost:3002";
    const musicApi = process.env.NEXT_PUBLIC_MUSIC_ENGINE_URL || "http://localhost:3003";
    const obsApi = process.env.NEXT_PUBLIC_OBS_CONTROLLER_URL || "http://localhost:3011";
    const tick = async () => {
      const next: Record<string, string> = {};
      try {
        const r = await fetch(`${obsApi}/stream/config`);
        const j = await r.json();
        next.obs = j.obsConnected ? "UP" : "DOWN";
        next.rtmp = j.rtmpConfigured ? "READY" : "NEED KEY";
      } catch {
        next.obs = "DOWN";
        next.rtmp = "DOWN";
      }
      try {
        const r = await fetch(`${shopApi}/products?channel_id=${CHANNEL_ID}`);
        const j = await r.json();
        next.shop = r.ok ? `UP · ${j.products?.length || 0}` : "DOWN";
      } catch {
        next.shop = "DOWN";
      }
      try {
        const r = await fetch(`${musicApi}/music/tracks?channel_id=${CHANNEL_ID}`);
        const j = await r.json();
        next.music = r.ok ? `UP · ${j.tracks?.length || 0}` : "DOWN";
      } catch {
        next.music = "DOWN";
      }
      try {
        const r = await fetch("http://127.0.0.1:3012/health");
        next.safety = r.ok ? "UP" : "DOWN";
      } catch {
        next.safety = "DOWN";
      }
      setStack((p) => ({ ...p, ...next }));
    };
    tick();
    const id = setInterval(tick, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!onAir) return;
    const t = setInterval(() => {
      const next = COMMENT_POOL[Math.floor(Math.random() * COMMENT_POOL.length)];
      setComments((prev) => [next, ...prev].slice(0, 8));
    }, 5000);
    return () => clearInterval(t);
  }, [onAir]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("tikcast-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "moderation_logs" },
        (payload) => {
          const row = payload.new as { id: string; keyword: string; action: string; created_at: string };
          setModFeed((p) => [
            { id: row.id, keyword: row.keyword, action: row.action, at: row.created_at },
            ...p,
          ].slice(0, 20));
          pushLog(`[ENGINE] Moderation — ${row.action}: ${row.keyword}`);
          setHealth((h) => Math.max(0, h - 5));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          const row = payload.new as { user_handle: string; body: string; tag?: string };
          setComments((p) => [
            { user: row.user_handle, text: row.body, tag: row.tag || "LIVE" },
            ...p,
          ].slice(0, 8));
        }
      )
      .subscribe();
    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const switchScene = async (name: string) => {
    setScene(name);
    pushLog(`[ENGINE] Scene Switched to ${name}`);
    showToast(`Scene → ${name}`);
    await callObs("/scene", { sceneName: name });
  };

  const switchWallpaper = async (w: Wallpaper) => {
    setWallpaper(w);
    pushLog(`[ENGINE] Wallpaper → ${w.name}`);
    showToast(`Wallpaper → ${w.name}`);
    await callObs("/wallpaper", { fileUrl: w.name, wallpaperName: w.name });
  };

  const handleKill = async () => {
    setKilled(true);
    setOnAir(false);
    setIsPlaying(false);
    setScene("BRB");
    pushLog("[ENGINE] ⚠ KILL SWITCH — cut to BRB");
    showToast("Kill Switch engaged — BRB scene live");
    await callObs("/scene", { sceneName: "BRB" });
    await callObs("/stream/stop", {});
    try {
      await fetch(`${GATEWAY_API}/api/kill-switch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ channelId: CHANNEL_ID }),
      });
    } catch {
      /* local */
    }
  };

  const handleStartStop = async () => {
    if (killed) {
      setKilled(false);
      setOnAir(true);
      setIsPlaying(true);
      pushLog("[ENGINE] Broadcast restarted");
      showToast("Broadcast restarted");
      await callObs("/stream/start", {});
      return;
    }
    if (onAir) {
      setOnAir(false);
      setIsPlaying(false);
      showToast("Broadcast paused");
      await callObs("/stream/stop", {});
    } else {
      setOnAir(true);
      setIsPlaying(true);
      pushLog("[ENGINE] Broadcast resumed");
      showToast("Back ON AIR");
      await callObs("/stream/start", {});
    }
  };

  const playItem = (idx: number) => {
    setPlaylist((prev) =>
      prev.map((p, i) => ({ ...p, status: i === idx ? "NOW PLAYING" : "QUEUED" }))
    );
    setProgress(2);
    setIsPlaying(true);
    showToast(`Now playing: ${playlist[idx]?.title}`);
  };

  const testModeration = async () => {
    const word = testWord.trim() || "threat";
    try {
      const res = await fetch(`${GATEWAY_API}/api/moderation/check`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: word,
          user_handle: "@test_user",
          channel_id: CHANNEL_ID,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const action = data.action || (/(threat|kill|bomb|blood|graphic)/i.test(word) ? "ban" : "flag");
      setModFeed((p) => [
        { id: String(Date.now()), keyword: word, action, at: new Date().toISOString() },
        ...p,
      ]);
      pushLog(`[ENGINE] Test moderation — ${action}: ${word}`);
      setHealth((h) => Math.max(0, h - (action === "ban" ? 12 : 4)));
      if (action === "ban" || action === "timeout") {
        const next = Math.max(0, health - 12);
        if (next < 30) {
          pushLog("[ENGINE] Health < 30 — Kill Switch auto-trigger");
          await handleKill();
        }
      }
      showToast(`Moderation: ${action}`);
    } catch {
      const hard = /(threat|kill|bomb|blood|graphic|self-harm)/i.test(word);
      const action = hard ? "ban" : "flag";
      setModFeed((p) => [
        { id: String(Date.now()), keyword: word, action, at: new Date().toISOString() },
        ...p,
      ]);
      setHealth((h) => Math.max(0, h - (hard ? 12 : 4)));
      pushLog(`[ENGINE] Local moderation — ${action}: ${word}`);
      showToast(`Local moderation: ${action}`);
    }
    setTestWord("");
  };

  const current = playlist.find((p) => p.status === "NOW PLAYING") || playlist[0];
  const nextUp = playlist.find((p) => p.status === "QUEUED");

  const stackChip = (label: string, value: string) => {
    const ok = value.startsWith("UP") || value === "READY";
    const warn = value.includes("NEED") || value === "…";
    return (
      <div
        key={label}
        className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-bold tracking-wide"
      >
        <span className="text-white/50 mr-1.5">{label}</span>
        <span
          className={
            ok ? "text-[#2eff8f]" : warn ? "text-[#ffc247]" : "text-[#ff2a4d]"
          }
        >
          {value}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--bg)]">
      <header className="px-3 sm:px-5 pt-3 sm:pt-4 pb-3 border-b border-[var(--line)]">
        <div className="max-w-[1480px] mx-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--red)] flex items-center justify-center shrink-0 shadow-[0_0_24px_#ff2b3d66]">
              <Radio size={22} className="text-white" />
            </div>
            <div className="leading-none">
              <p className="font-bold text-[19px] sm:text-[22px] tracking-tight whitespace-nowrap">
                TIKCAST <span className="text-[var(--red)]">LIVE</span>
              </p>
              <p className="text-[10px] sm:text-[11px] text-[var(--muted)] tracking-[0.18em] mt-1">
                COMMAND CENTER · PROD LIVE TEST
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-full border ${
              onAir && !killed ? "bg-[#2a0a0e] border-red-500/50" : "bg-white/5 border-white/10"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                onAir && !killed ? "bg-[var(--red)] pulse-dot" : "bg-zinc-500"
              }`}
            />
            <span className="font-bold text-[12px] sm:text-[13px] tracking-widest">
              {killed ? "KILLED" : onAir ? "ON AIR" : "OFF AIR"}
            </span>
            <span className="mono text-[11px] text-white/60 hidden sm:inline">
              {fmtDuration(liveSeconds)}
            </span>
          </div>
          <div className="hidden md:block border-l border-[var(--line)] pl-3">
            <p className="text-[11px] text-[var(--muted)]">CHANNEL</p>
            <p className="font-bold text-sm">TikCast Studio • Daily Live</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            <HealthScoreDial score={health} />
            <button
              onClick={handleKill}
              className="flex-1 sm:flex-none bg-[var(--red)] hover:bg-[#d61a2c] text-white font-bold text-[13px] px-4 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Power size={16} /> KILL SWITCH
            </button>
            <button
              onClick={handleStartStop}
              className={`flex-1 sm:flex-none font-bold text-[13px] px-4 py-3 rounded-xl flex items-center justify-center gap-2 border ${
                onAir ? "bg-white text-black" : "bg-[var(--cyan)] text-black"
              }`}
            >
              {onAir ? (
                <>
                  <Square size={14} /> STOP
                </>
              ) : (
                <>
                  <Play size={14} /> GO LIVE
                </>
              )}
            </button>
          </div>
        </div>
        <div className="max-w-[1480px] mx-auto mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {stackChip("OBS", stack.obs)}
          {stackChip("SHOP", stack.shop)}
          {stackChip("MUSIC", stack.music)}
          {stackChip("SAFETY", stack.safety)}
          {stackChip("RTMP", stack.rtmp)}
          <span className="whitespace-nowrap text-[11px] mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
            <Eye size={12} className="text-cyan-300" /> {viewers.toLocaleString()} watching
          </span>
          <span className="whitespace-nowrap text-[11px] mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
            Scene: {scene}
          </span>
        </div>
      </header>

      {killed && (
        <div className="bg-[var(--red)] text-white text-center text-[12px] font-bold py-1.5 px-3">
          KILL SWITCH ENGAGED — BRB scene live. Press GO LIVE to restart safely.
        </div>
      )}
      {toast && (
        <div className="bg-emerald-500 text-black text-center text-[12px] font-bold py-1.5 px-3">
          {toast}
        </div>
      )}

      <main className="max-w-[1480px] mx-auto px-3 sm:px-5 py-4 sm:py-5 pb-10">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden mb-4 flex items-center">
          <span className="bg-[var(--red)] text-white text-[11px] font-bold px-3 py-2.5 shrink-0">
            LIVE TICKER
          </span>
          <div className="overflow-hidden flex-1">
            <div className="ticker-track flex whitespace-nowrap w-max text-[12px] py-2.5">
              <span className="px-4">
                🔥 {viewers.toLocaleString()} watching • Next: Reaction Hour at 11:00 • Health{" "}
                {health} • Auto-clip ON • Scene {scene} •&nbsp;
              </span>
              <span className="px-4">
                🔥 {viewers.toLocaleString()} watching • Next: Reaction Hour at 11:00 • Health{" "}
                {health} • Auto-clip ON • Scene {scene} •&nbsp;
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 items-start">
          {/* LEFT — Preview + Scenes + Wallpapers */}
          <section className="lg:col-span-4 space-y-4 min-w-0">
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold flex items-center gap-2">
                  <Video size={17} className="text-[var(--cyan)]" /> PREVIEW + ON AIR
                </h2>
              </div>
              <div
                className="relative h-[210px] sm:h-[240px] rounded-[18px] overflow-hidden border border-white/20"
                style={{ background: wallpaper.bg }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <div className="scanline bg-cyan-300/70" />
                {scene === "BRB" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <div className="text-4xl font-bold">BE RIGHT BACK</div>
                    <p className="text-sm text-white/80 mt-2">Channel pauses — show resumes soon</p>
                  </div>
                ) : scene === "DJ Radio" ? (
                  <div className="absolute inset-3 flex flex-col justify-end">
                    <div className="flex items-end gap-1 h-20">
                      {[38, 62, 45, 78, 52, 90, 66, 42, 84, 58, 72, 40].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-cyan-300"
                          style={{ height: `${h}%`, opacity: 0.45 + i * 0.03 }}
                        />
                      ))}
                    </div>
                    <p className="font-bold text-lg mt-2">Late Night Mix • DJ Set</p>
                  </div>
                ) : scene === "Split Screen" ? (
                  <div className="absolute inset-3 flex gap-2">
                    <div className="flex-1 rounded-xl border border-white/30 bg-black/30 flex flex-col justify-end p-3">
                      <span className="mono text-[10px] text-cyan-300">HOST CAM</span>
                      <span className="font-bold text-lg">You • Live</span>
                    </div>
                    <div className="flex-1 rounded-xl border border-white/30 bg-black/40 flex flex-col justify-end p-3">
                      <span className="mono text-[10px] text-yellow-300">GUEST</span>
                      <span className="font-bold text-lg">Maya R.</span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-3 flex flex-col justify-end">
                    <span className="mono text-[10px] tracking-[0.2em] text-cyan-200">
                      {scene.toUpperCase()} • {wallpaper.name.toUpperCase()}
                    </span>
                    <p className="font-bold text-2xl leading-tight mt-1">{current?.title}</p>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-[var(--red)] text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full pulse-dot" />
                    ON AIR
                  </span>
                  <span className="bg-black/55 backdrop-blur px-2.5 py-1 rounded-md text-[11px] mono">
                    {scene}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-black/55 backdrop-blur px-2 py-1 rounded-md text-[11px] mono flex items-center gap-1">
                  <Eye size={13} /> {viewers.toLocaleString()}
                </div>
                <div className="absolute bottom-3 right-3 flex gap-1.5">
                  <span className="w-7 h-7 rounded-full bg-black/50 border border-white/25 flex items-center justify-center">
                    <Mic2 size={13} />
                  </span>
                  <span className="w-7 h-7 rounded-full bg-black/50 border border-white/25 flex items-center justify-center">
                    <Volume2 size={13} />
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Layers size={16} className="text-[var(--red)]" /> SCENE SWITCHER
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SCENES.map((s) => {
                  const Icon = SCENE_ICONS[s.id] || Camera;
                  const active = scene === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => switchScene(s.id)}
                      className={`rounded-xl border p-2.5 text-left transition ${
                        active
                          ? "bg-[var(--cyan)] text-black border-transparent shadow-[0_0_18px_#00e5ff55]"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <Icon size={18} />
                      <p className="font-bold text-[12px] leading-tight mt-1.5">{s.label}</p>
                      <p className={`text-[10px] ${active ? "text-black/70" : "text-white/50"}`}>
                        {s.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-yellow-300" /> WALLPAPER SWITCHER
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {WALLPAPERS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => switchWallpaper(w)}
                    className={`rounded-xl overflow-hidden border-2 text-left ${
                      wallpaper.id === w.id ? "border-[var(--cyan)]" : "border-transparent"
                    }`}
                  >
                    <span className="block h-[54px] relative" style={{ background: w.bg }}>
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 px-1.5 py-0.5 rounded">
                        {wallpaper.id === w.id ? "● LIVE" : "SET"}
                      </span>
                    </span>
                    <span className="block bg-black/40 px-2 py-1.5">
                      <span className="block text-[11px] font-bold leading-none">{w.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* CENTER — Playlist + Scheduler */}
          <section className="lg:col-span-4 space-y-4 min-w-0">
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold flex items-center gap-2">
                  <Clapperboard size={17} className="text-[var(--red)]" /> PLAYOUT ENGINE
                </h2>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-300">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-dot" /> AUTO
                </span>
              </div>
              <div className="rounded-2xl bg-black/30 border border-white/10 p-3 mt-3">
                <p className="mono text-[10px] tracking-widest text-[var(--cyan)]">NOW PLAYING</p>
                <p className="font-bold text-[16px] leading-tight mt-1">{current?.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setIsPlaying((v) => !v)}
                    className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shrink-0"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <div className="flex-1 h-2 rounded-full bg-white/15 overflow-hidden">
                    <div className="h-full bg-[var(--cyan)]" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="mono text-[11px]">{Math.round(progress)}%</span>
                </div>
                <div className="flex justify-between text-[11px] text-white/60 mt-1.5">
                  <span>
                    {current?.type} • {current?.dur}
                  </span>
                  <span>Next: {nextUp?.title || "—"}</span>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {playlist.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 ${
                      item.status === "NOW PLAYING"
                        ? "border-cyan-400/50 bg-cyan-400/10"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <span className="mono text-[11px] text-white/50 w-5 shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <button
                      onClick={() => playItem(idx)}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"
                    >
                      <Play size={13} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13px] leading-tight truncate">{item.title}</p>
                      <p className="text-[11px] text-white/50">
                        {item.type} • {item.dur}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <CalendarClock size={16} className="text-[var(--cyan)]" /> SCHEDULER — TODAY
              </h3>
              <div className="space-y-2">
                {SCHEDULE.map((s) => (
                  <div
                    key={s.time}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2"
                  >
                    <span className="mono text-[12px] font-bold" style={{ color: s.color }}>
                      {s.time}
                    </span>
                    <span className="text-sm font-semibold flex-1">{s.title}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: s.color }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-emerald-300" /> RIGHTS TABLE
              </h3>
              <div className="space-y-2">
                {RIGHTS.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2"
                  >
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: r.color, background: `${r.color}22` }}
                    >
                      {r.status}
                    </span>
                    <span className="text-[12px] flex-1 truncate">{r.name}</span>
                    <span className="text-[11px] text-white/50">{r.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT — Comments + Gifts + Safety */}
          <section className="lg:col-span-4 space-y-4 min-w-0">
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <Users size={16} className="text-[var(--cyan)]" /> COMMENTS
              </h3>
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {comments.map((c, i) => (
                  <div key={`${c.user}-${i}`} className="rounded-xl bg-black/30 border border-white/10 p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[12px] text-cyan-300">{c.user}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10">{c.tag}</span>
                    </div>
                    <p className="text-[13px] mt-1">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <Gift size={16} className="text-yellow-300" /> GIFTS
              </h3>
              <div className="space-y-2">
                {gifts.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-3 py-2"
                  >
                    <p className="font-bold text-[13px]">
                      {g.from} • {g.amount}
                    </p>
                    <p className="text-[12px] text-white/60">{g.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <Flag size={16} className="text-[var(--red)]" /> MODERATION FEED
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  value={testWord}
                  onChange={(e) => setTestWord(e.target.value)}
                  placeholder="Test banned word…"
                  className="flex-1 min-w-0 bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-cyan-400"
                />
                <button
                  onClick={testModeration}
                  className="bg-[var(--red)] text-white font-bold text-[12px] px-3 rounded-lg"
                >
                  TEST
                </button>
              </div>
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {modFeed.length === 0 && (
                  <p className="text-[12px] text-white/45">No flags yet — chat is clean.</p>
                )}
                {modFeed.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px]"
                  >
                    <span className="font-bold uppercase text-red-300">{m.action}</span> — {m.keyword}
                  </div>
                ))}
              </div>
            </div>

            <ShopPanel
              onLog={(msg) => setLogs((l) => [msg, ...l].slice(0, 80))}
            />
            <MusicBank
              onLog={(msg) => setLogs((l) => [msg, ...l].slice(0, 80))}
            />
            <TerminalLog logs={logs} />
          </section>
        </div>
      </main>
    </div>
  );
}
