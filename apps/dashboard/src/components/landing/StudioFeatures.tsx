"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  Check,
  ChevronDown,
  Clapperboard,
  Cpu,
  Film,
  Gauge,
  Layers,
  Lightbulb,
  Mic,
  Mic2,
  Monitor,
  MonitorPlay,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
  Wallpaper,
  Zap,
} from "lucide-react";
import { SiteHeader } from "./SiteHeader";

type Scene = {
  id: string;
  name: string;
  label: string;
  desc: string;
  best: string;
};

const scenes: Scene[] = [
  { id: "full", name: "Full Cam", label: "FULL CAM", desc: "One confident frame. You own the whole screen.", best: "Solo shows & announcements" },
  { id: "split", name: "Split Screen", label: "SPLIT", desc: "Two voices, one balanced conversation.", best: "Interviews & duets" },
  { id: "reaction", name: "Reaction", label: "REACT", desc: "Big content, small human reaction in the corner.", best: "Watch parties & reviews" },
  { id: "news", name: "News Desk", label: "NEWS", desc: "Lower thirds, headlines and a polished desk frame.", best: "Daily shows & explainers" },
  { id: "shop", name: "Shopping", label: "SHOP", desc: "Product front and centre, offer pinned beside you.", best: "Drops & live selling" },
  { id: "game", name: "Gaming", label: "GAME", desc: "Gameplay dominates, your cam stays in play.", best: "Gameplay & tournaments" },
];

const featureBlocks = [
  {
    n: "01",
    icon: Clapperboard,
    title: "Playout Engine",
    tag: "NEVER GO DARK",
    desc: "A broadcast-grade playlist that keeps your channel moving, even when you step away.",
    bullets: ["Drag-and-drop playlist & loop", "Auto-start, auto-end & show timing", "Live Override for instant interruptions", "Pre-show, bumper & countdown blocks"],
    visual: "playout" as const,
  },
  {
    n: "02",
    icon: Layers,
    title: "Multi-Screen Production",
    tag: "LOOK LIKE A NETWORK",
    desc: "Six producer-ready layouts, designed for vertical TV — not repurposed webinar frames.",
    bullets: ["Full Cam, Split Screen & Reaction", "News Desk, Shopping & Gaming", "One-click layout switching", "Layout-safe graphics & lower thirds"],
    visual: "layouts" as const,
  },
  {
    n: "03",
    icon: Cpu,
    title: "Automation Brain",
    tag: "SET IT ONCE",
    desc: "Schedule the week, then let TIKCAST run the show, clip the moments and prepare the posts.",
    bullets: ["24/7 scheduler with dayparts", "Auto-clipping of high-energy moments", "Auto-captions for every show", "Auto-posting to your channels"],
    visual: "automation" as const,
  },
  {
    n: "04",
    icon: Wallpaper,
    title: "Wallpaper System",
    tag: "INSTANT SET DESIGN",
    desc: "Swap the whole mood of your studio in one click — no rebuild, no downtime, no green screen.",
    bullets: ["PNG + animated MP4 backgrounds", "1-click switching mid-show", "Scheduled sets by daypart", "Brand kits & seasonal packs"],
    visual: "wallpaper" as const,
  },
  {
    n: "05",
    icon: Users,
    title: "Interaction Layer",
    tag: "AUDIENCE ON SCREEN",
    desc: "Turn viewers into cast members. Polls, gifts, comments and guests — all produced live.",
    bullets: ["Live polls & result graphics", "Gift alerts & celebration moments", "Curated Comment Wall", "Guest Queue & Shoppable Overlays"],
    visual: "interaction" as const,
  },
  {
    n: "06",
    icon: Film,
    title: "Content Factory",
    tag: "ONE HOUR IN. EVERYTHING OUT.",
    desc: "One live hour becomes a week of short-form. The factory cuts, captions and packages it.",
    bullets: ["Live 1hr → 5 TikToks", "Plus 3 Reels & 1 Short", "Podcast-ready audio export", "Hook, caption & cover suggestions"],
    visual: "factory" as const,
  },
];

const timeline = [
  { time: "07:00", title: "Morning Show", detail: "High-energy open, headlines, chat warm-up and the first poll of the day.", mode: "LIVE", tone: "#ff2b3d" },
  { time: "12:00", title: "Best Of", detail: "Yesterday’s strongest moments, repackaged and captioned for lunch-time viewers.", mode: "AUTOMATED", tone: "#24e6ff" },
  { time: "19:00", title: "Live Talk", detail: "Guest queue, audience questions, shopping overlay and a live gift celebration.", mode: "LIVE", tone: "#ff2b3d" },
  { time: "23:00", title: "Night Loop", detail: "A calm overnight playlist keeps the channel on air while you sleep.", mode: "LOOP", tone: "#ffc53d" },
];

const faqs = [
  ["Do I need broadcast experience?", "No. Start with a template, switch scenes in one click, and let automation handle timing."],
  ["Can I run the channel while I sleep?", "Yes. Scheduler, playlists and loops keep your channel live 24/7."],
  ["Does it work with my existing setup?", "TIKCAST works with a standard PC, mic, light and second monitor."],
] as const;

function SceneDiagram({ id, big = false }: { id: string; big?: boolean }) {
  const base = big ? "h-40" : "h-32";
  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#111a21] ${base}`}>
      {id === "full" && (
        <div className="absolute inset-2 rounded-lg bg-gradient-to-br from-red-500/60 to-fuchsia-600/40">
          <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] font-bold">YOU • FULL FRAME</span>
        </div>
      )}
      {id === "split" && (
        <>
          <div className="absolute left-2 top-2 bottom-2 w-[46%] rounded-lg bg-cyan-500/40" />
          <div className="absolute right-2 top-2 bottom-2 w-[46%] rounded-lg bg-red-500/40" />
        </>
      )}
      {id === "reaction" && (
        <>
          <div className="absolute inset-2 rounded-lg bg-cyan-500/30" />
          <div className="absolute bottom-3 right-3 h-14 w-12 rounded-lg bg-red-500 shadow-xl ring-2 ring-white/60" />
        </>
      )}
      {id === "news" && (
        <>
          <div className="absolute left-2 top-2 bottom-9 right-2 rounded-lg bg-violet-500/35" />
          <div className="absolute bottom-2 left-2 right-2 h-5 rounded bg-[var(--red)]" />
          <div className="absolute bottom-3 left-3 text-[8px] font-black">BREAKING • LIVE</div>
        </>
      )}
      {id === "shop" && (
        <>
          <div className="absolute left-2 top-2 bottom-2 w-[54%] rounded-lg bg-red-500/40" />
          <div className="absolute right-2 top-2 h-[58%] w-[34%] rounded-lg bg-amber-400/50" />
          <div className="absolute right-2 bottom-2 flex h-[28%] w-[34%] items-center justify-center rounded bg-white text-[10px] font-black text-black">
            £24
          </div>
        </>
      )}
      {id === "game" && (
        <>
          <div className="absolute inset-2 rounded-lg bg-emerald-500/30" />
          <div className="absolute left-3 top-3 h-12 w-16 rounded-lg bg-red-500 ring-2 ring-white/60" />
          <div className="absolute right-3 top-3 rounded bg-black/70 px-2 py-1 text-[10px] font-bold">SCORE 2–1</div>
        </>
      )}
      <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-[var(--cyan)]">● REC</span>
    </div>
  );
}

function FeatureVisual({
  kind,
  onPickScene,
}: {
  kind: (typeof featureBlocks)[number]["visual"];
  onPickScene: (id: string) => void;
}) {
  if (kind === "playout") {
    return (
      <div className="space-y-2">
        {["Opening Show — 24:00", "Creator Interview — 18:30", "Best Moments — 12:00", "Night Loop — 06:00"].map((x, i) => (
          <div
            key={x}
            className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
              i === 0 ? "border-[var(--red)] bg-red-500/10" : "border-white/10 bg-white/[.03]"
            }`}
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-xs font-black">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{x}</p>
              <p className="text-[11px] text-zinc-400">
                {i === 0 ? "PLAYING NOW • AUTO-START ENABLED" : "QUEUED • LOOP READY"}
              </p>
            </div>
            <Play className="h-4 w-4 text-[var(--cyan)]" />
          </div>
        ))}
        <div className="rounded-xl bg-[var(--red)] px-3 py-3 text-center text-sm font-black tracking-widest">
          LIVE OVERRIDE →
        </div>
      </div>
    );
  }
  if (kind === "layouts") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {scenes.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPickScene(s.id)}
            className="rounded-xl border border-white/10 bg-white/[.04] p-3 text-left hover:border-[var(--cyan)]/40"
          >
            <span className="mb-2 block text-[10px] tracking-[.2em] text-[var(--cyan)]">{s.label}</span>
            <span className="block text-xs font-bold">{s.name}</span>
          </button>
        ))}
      </div>
    );
  }
  if (kind === "automation") {
    return (
      <div className="space-y-2">
        {[
          ["Scheduler", "Mon–Sun • 4 dayparts"],
          ["Auto-clipping", "12 clips found"],
          ["Auto-captions", "99.1% reviewed"],
          ["Auto-posting", "5 posts queued"],
        ].map(([a, b]) => (
          <div key={a} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.03] px-3 py-3">
            <span className="text-sm font-bold">{a}</span>
            <span className="text-xs text-[var(--cyan)]">{b}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Sparkles className="h-4 w-4 text-[var(--amber)]" /> Automation handled 38 tasks this week.
        </div>
      </div>
    );
  }
  if (kind === "wallpaper") {
    return (
      <div className="space-y-3">
        <div className="relative h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-[#ff2b3d] via-[#3b0c72] to-[#00c2ff] p-4">
          <span className="rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold">ANIMATED • NEON CITY • MP4</span>
          <div className="absolute bottom-3 left-4 font-display text-xl">NIGHT MODE</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {["bg-[#ff2b3d]", "bg-[#24e6ff]", "bg-[#ffc53d]", "bg-[#3dff9d]"].map((c, i) => (
            <div
              key={c}
              className={`h-10 rounded-lg ${c} ${i === 0 ? "ring-2 ring-white ring-offset-2 ring-offset-black" : ""}`}
            />
          ))}
        </div>
      </div>
    );
  }
  if (kind === "interaction") {
    return (
      <div className="space-y-2">
        <div className="rounded-xl bg-white p-3 text-black">
          <p className="text-xs font-bold">LIVE POLL — Which segment next?</p>
          <div className="mt-2 h-2 rounded-full bg-zinc-200">
            <div className="h-full w-[68%] rounded-full bg-[var(--red)]" />
          </div>
          <p className="mt-2 text-[11px] font-semibold">Guest Q&A • 68% • 1,284 votes</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
          <p className="text-sm">
            <span className="font-bold text-[var(--cyan)]">@studiofan</span> This set design is unreal
          </p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-white/10 px-3 py-2 text-xs">Gift Alert</span>
          <span className="rounded-full bg-white/10 px-3 py-2 text-xs">Guest Queue • 3</span>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        ["5", "TikToks"],
        ["3", "Reels"],
        ["1", "Short"],
        ["1", "Podcast"],
      ].map(([n, l]) => (
        <div key={l} className="rounded-xl border border-white/10 bg-white/[.04] p-4 text-center">
          <div className="text-3xl font-black text-[var(--cyan)]">{n}</div>
          <div className="text-xs text-zinc-400">{l}</div>
        </div>
      ))}
      <div className="col-span-2 rounded-xl bg-[var(--cyan)] p-3 text-center text-sm font-black text-black">
        EXPORT ALL → READY IN 04:12
      </div>
    </div>
  );
}

function go(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function StudioFeatures() {
  const [activeScene, setActiveScene] = useState("split");
  const [selected, setSelected] = useState(scenes[1]);
  const [slot, setSlot] = useState(timeline[2]);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState(0);

  const active = scenes.find((s) => s.id === activeScene) || scenes[0];
  const price = (m: number) => (billing === "monthly" ? `£${m}` : `£${Math.round(m * 0.8)}`);

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--bg)] text-[var(--text)]">
      <div className="border-b border-white/10 bg-black/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-[11px] font-semibold tracking-wider text-zinc-300">
          <span className="text-[var(--cyan)]">● ON AIR NOW</span>
          <span>STUDIO HEALTH 92</span>
          <span className="hidden sm:inline">LIVE VIEWERS 4,218</span>
          <span className="hidden md:inline">NEXT: LIVE TALK • 19:00</span>
        </div>
      </div>

      <SiteHeader eyebrow="STUDIO FEATURES" ctaLabel="Start Free →" />

      {/* HERO */}
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-red-600/25 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 top-48 h-72 w-72 rounded-full bg-cyan-500/20 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pt-16">
          <div className="max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--cyan)]/40 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-bold tracking-[.2em] text-[var(--cyan)]">
              <span className="live-dot inline-block h-2 w-2 rounded-full bg-[var(--red)]" /> BUILT FOR TIKTOK TV • NO BROADCAST DEGREE NEEDED
            </div>
            <h1 className="font-display text-[clamp(2.8rem,8vw,6.5rem)] leading-[.88] tracking-[-.04em]">
              ONE DASHBOARD.
              <br />
              <span className="text-[var(--red)]">A WHOLE</span> <span className="text-[var(--cyan)]">TV STATION.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-xl">
              Preview, On Air, Playlist, Chat, Scenes, Safety Score — everything a TV producer has, now for TikTok creators.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/command-center"
                className="rounded-full bg-[var(--red)] px-6 py-3.5 font-black shadow-[0_0_35px_rgba(255,43,61,.4)] hover:bg-[#ff4152]"
              >
                Open Command Center →
              </Link>
              <button
                type="button"
                onClick={() => go("features")}
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-bold hover:bg-white/10"
              >
                Explore Features
              </button>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["8", "Scene Layouts", "Ready in one click"],
              ["24/7", "Scheduler", "Your channel never sleeps"],
              ["92", "Health Score", "Live production quality"],
              ["1-Click", "Switching", "Scenes, sets & sources"],
            ].map(([n, l, s]) => (
              <div key={l} className="glass rounded-2xl p-4 sm:p-5">
                <div className="font-display text-3xl text-[var(--cyan)] sm:text-4xl">{n}</div>
                <div className="mt-1 font-bold">{l}</div>
                <div className="text-xs text-zinc-400">{s}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 overflow-hidden border-y border-white/10 py-2 text-xs font-bold tracking-[.2em] text-zinc-400">
            <div className="ticker-track flex w-max gap-8 whitespace-nowrap">
              <span>● LIVE SWITCHING ● AUTO-CLIPPING ● 24/7 PLAYLIST ● GIFT ALERTS ● COMMENT WALL ● SHOPPABLE OVERLAYS ● SAFETY SCORE ●&nbsp;</span>
              <span>● LIVE SWITCHING ● AUTO-CLIPPING ● 24/7 PLAYLIST ● GIFT ALERTS ● COMMENT WALL ● SHOPPABLE OVERLAYS ● SAFETY SCORE ●&nbsp;</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROL ROOM */}
      <section id="studio" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-black tracking-[.25em] text-[var(--cyan)]">02 — THE CONTROL ROOM</p>
            <h2 className="font-display text-3xl sm:text-5xl">
              Run the show like
              <br />
              a producer.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-zinc-400">
            Tap a scene below to preview it in the On Air window. This is the same layout you control while live.
          </p>
        </div>
        <div className="glass overflow-hidden rounded-[28px] p-3 shadow-2xl sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 hidden sm:inline">TIKCAST STUDIO • CHANNEL: @YOURSHOW</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-red-500 px-2 py-1 font-black">ON AIR 24:18</span>
              <span className="rounded-full bg-white/10 px-2 py-1">1080p • 30fps</span>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.1fr_1.7fr_1.1fr]">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                <div className="flex items-center justify-between bg-zinc-900 px-3 py-2 text-[10px] font-bold tracking-widest text-zinc-400">
                  <span>PREVIEW</span>
                  <span className="text-[var(--cyan)]">READY</span>
                </div>
                <div className="relative aspect-[4/3] bg-gradient-to-br from-zinc-800 to-zinc-900 p-3">
                  <div className="grid h-full place-items-center rounded-lg border border-dashed border-white/20 text-center">
                    <div>
                      <Mic2 className="mx-auto text-[var(--cyan)]" size={28} />
                      <p className="mt-2 text-xs font-bold">Next guest cam</p>
                      <p className="text-[10px] text-zinc-400">Check framing before air</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3">
                <p className="mb-2 text-[10px] font-bold tracking-widest text-zinc-400">AUDIO MIX</p>
                <div className="flex h-10 items-end justify-between gap-1">
                  {[45, 80, 35, 90, 65, 75, 45, 95, 55, 70, 40, 85, 60, 75, 50, 80, 65, 90].map((h, i) => (
                    <span
                      key={i}
                      className="eq-bar"
                      style={{ height: `${h}%`, animationDelay: `${(i % 4) * 0.12}s` }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-[10px] text-zinc-400">
                  <span>MIC</span>
                  <span>MUSIC</span>
                  <span>GUEST</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border-2 border-[var(--red)] bg-black shadow-[0_0_35px_rgba(255,43,61,.18)]">
                <div className="flex items-center justify-between bg-[var(--red)] px-3 py-2 text-[10px] font-black tracking-widest">
                  <span>● ON AIR</span>
                  <span>
                    {active.label} • LIVE
                  </span>
                </div>
                <div className="relative">
                  <SceneDiagram id={activeScene} big />
                  <div className="scanline-features" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-lg bg-black/75 px-2 py-1.5 text-[10px] font-bold">
                    <span>LIVE TALK • EP. 42</span>
                    <span className="text-[var(--cyan)]">4,218 watching</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold tracking-widest text-zinc-400">SCENE BUTTONS</p>
                  <span className="text-[10px] text-[var(--cyan)]">{active.name} active</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {scenes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveScene(s.id)}
                      className={`rounded-lg px-2 py-2.5 text-[11px] font-black ${
                        s.id === activeScene ? "bg-[var(--red)] text-white" : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveScene("full")}
                  className="mt-2 w-full rounded-lg bg-[var(--cyan)] py-2 text-xs font-black text-black"
                >
                  TAKE FULL CAM →
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3">
                <p className="mb-2 text-[10px] font-bold tracking-widest text-zinc-400">NEXT UP • PLAYLIST</p>
                {[
                  ["Live Talk — Guest Q&A", "NOW"],
                  ["Best Moments", "12:00"],
                  ["Night Loop", "23:00"],
                ].map(([t, time]) => (
                  <div key={t} className="flex items-center justify-between border-b border-white/5 py-2 text-xs last:border-0">
                    <span className="font-semibold">{t}</span>
                    <span className="text-[var(--cyan)]">{time}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3">
                <p className="mb-2 text-[10px] font-bold tracking-widest text-zinc-400">LIVE COMMENTS</p>
                <p className="text-xs">
                  <span className="font-bold text-[var(--cyan)]">@maya:</span> The split-screen looks so clean!
                </p>
                <p className="mt-1 text-xs">
                  <span className="font-bold text-[var(--cyan)]">@leo:</span> Guest queue please
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest">SAFETY SCORE</span>
                  <Gauge className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="font-display text-4xl text-emerald-400">92</span>
                  <span className="pb-1 text-xs text-zinc-400">/ 100 • STRONG</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[92%] rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES DEEP DIVE */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6">
        <p className="text-xs font-black tracking-[.25em] text-[var(--cyan)]">03 — FEATURES DEEP DIVE</p>
        <h2 className="mt-2 max-w-3xl font-display text-4xl leading-none sm:text-6xl">
          Six systems.
          <br />
          One calm control room.
        </h2>
        <div className="mt-10 space-y-5">
          {featureBlocks.map((f, i) => {
            const Icon = f.icon;
            return (
              <article key={f.n} className="glass grid overflow-hidden rounded-[28px] lg:grid-cols-2">
                <div className={`p-6 sm:p-10 ${i % 2 ? "lg:order-2" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-5xl text-white/15">{f.n}</span>
                    <span className="rounded-full border border-[var(--cyan)]/40 bg-cyan-400/10 px-3 py-1 text-[10px] font-black tracking-widest text-[var(--cyan)]">
                      {f.tag}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center gap-3 text-[var(--red)]">
                    <Icon className="h-7 w-7" />
                    <h3 className="font-display text-2xl text-white sm:text-3xl">{f.title}</h3>
                  </div>
                  <p className="mt-3 leading-relaxed text-zinc-300">{f.desc}</p>
                  <ul className="mt-5 space-y-2.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-zinc-200">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan)]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-white/10 bg-black/30 p-6 sm:p-8 lg:border-t-0 lg:border-l">
                  <div className="mb-3 flex items-center justify-between text-[10px] font-bold tracking-widest text-zinc-400">
                    <span>STUDIO PREVIEW</span>
                    <span>● LIVE</span>
                  </div>
                  <FeatureVisual kind={f.visual} onPickScene={setActiveScene} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* LAYOUT GALLERY */}
      <section id="layouts" className="scroll-mt-24 border-y border-white/10 bg-[#0b0e12] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[.25em] text-[var(--cyan)]">04 — SCENE LAYOUTS</p>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl">
                Pick a frame.
                <br />
                Own the moment.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-zinc-400">Select a layout to see how it’s used, and who it’s built for.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s)}
                className={`rounded-3xl border p-4 text-left transition ${
                  selected.id === s.id
                    ? "border-[var(--red)] bg-red-500/10 shadow-[0_0_30px_rgba(255,43,61,.15)]"
                    : "border-white/10 bg-white/[.03] hover:border-white/25"
                }`}
              >
                <SceneDiagram id={s.id} />
                <div className="mt-4 flex items-center justify-between">
                  <h3 className="font-display text-xl">{s.name}</h3>
                  <ArrowUpRight className="h-5 w-5 text-[var(--cyan)]" />
                </div>
                <p className="mt-1 text-sm text-zinc-400">{s.desc}</p>
                <p className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold">
                  BEST FOR: {s.best}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--cyan)] px-5 py-4 font-bold text-black">
            <span>
              Selected: {selected.name} — {selected.best}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveScene(selected.id);
                go("studio");
              }}
              className="rounded-full bg-black px-4 py-2 text-sm text-white"
            >
              Preview in Control Room ↑
            </button>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <p className="text-xs font-black tracking-[.25em] text-[var(--cyan)]">05 — AUTOMATION TIMELINE</p>
        <h2 className="mt-2 font-display text-4xl sm:text-5xl">One day. Always on air.</h2>
        <p className="mt-3 max-w-2xl text-zinc-400">Your schedule runs the channel. You show up for the moments that need you.</p>
        <div className="mt-8 hidden items-center md:flex">
          <div className="relative flex-1">
            <div className="h-1 rounded-full bg-white/10" />
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
              {timeline.map((t) => (
                <button
                  key={t.time}
                  type="button"
                  onClick={() => setSlot(t)}
                  className={`h-5 w-5 rounded-full border-4 border-[#07090c] ${
                    slot.time === t.time ? "scale-125 bg-white" : "bg-zinc-500"
                  }`}
                  style={{ boxShadow: `0 0 0 3px ${t.tone}` }}
                  aria-label={t.title}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((t) => (
            <button
              key={t.time}
              type="button"
              onClick={() => setSlot(t)}
              className={`rounded-2xl border p-5 text-left ${
                slot.time === t.time ? "border-white bg-white text-black" : "border-white/10 bg-white/[.03]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl">{t.time}</span>
                <span className="rounded-full px-2 py-1 text-[10px] font-black" style={{ background: t.tone, color: "#000" }}>
                  {t.mode}
                </span>
              </div>
              <h3 className="mt-3 font-display text-xl">{t.title}</h3>
              <p className={`mt-1 text-sm ${slot.time === t.time ? "text-zinc-600" : "text-zinc-400"}`}>{t.detail}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm">
          <CalendarClock className="h-5 w-5 shrink-0 text-[var(--cyan)]" /> Now selected:{" "}
          <b>
            {slot.time} — {slot.title}
          </b>
          <span className="hidden text-zinc-400 sm:inline">• Automation handles everything around it.</span>
        </div>
      </section>

      {/* HARDWARE */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="glass rounded-[28px] p-6 sm:p-10">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[.25em] text-[var(--cyan)]">06 — HARDWARE SETUP</p>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl">What you need</h2>
            </div>
            <p className="max-w-sm text-sm text-zinc-400">No broadcast truck. Five everyday pieces, one powerful control room.</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {(
              [
                [Monitor, "Main PC", "Runs TIKCAST Studio, scenes & playlist."],
                [MonitorPlay, "2nd Monitor", "Keep chat + controls in view."],
                [Mic, "Mic", "Clear voice, instant authority."],
                [Lightbulb, "Light", "Look sharp on every layout."],
                [Zap, "Stream Deck", "Physical buttons for instant switching."],
              ] as const
            ).map(([Icon, t, d]) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--red)]/15 text-[var(--red)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg">{t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAFETY + PRICING */}
      <section id="safety" className="mx-auto grid max-w-7xl scroll-mt-24 gap-5 px-4 pb-14 sm:px-6 lg:grid-cols-[1.1fr_1.6fr]">
        <div className="rounded-[28px] border border-emerald-400/25 bg-emerald-400/5 p-6 sm:p-8">
          <ShieldCheck className="h-10 w-10 text-emerald-400" />
          <h2 className="mt-4 font-display text-3xl">Safe to go live.</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Protect the show, the audience and your channel — without slowing the energy.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {[
              "Health Score — live production quality",
              "Rights Check — music & clip safety",
              "Keyword Filter — keep chat clean",
              "Kill Switch — stop instantly",
            ].map((x) => (
              <li key={x} className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                {x}
              </li>
            ))}
          </ul>
          <Link
            href="/command-center"
            className="mt-6 inline-block rounded-full border border-emerald-400/50 px-5 py-3 text-sm font-bold hover:bg-emerald-400/10"
          >
            Open Safety Controls →
          </Link>
        </div>
        <div id="pricing" className="scroll-mt-24 rounded-[28px] border border-white/10 bg-[#0c1015] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[.25em] text-[var(--cyan)]">PRICING TEASER</p>
              <h2 className="mt-2 font-display text-3xl">Start free. Scale like a network.</h2>
            </div>
            <div className="flex rounded-full border border-white/15 p-1 text-sm font-bold">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`rounded-full px-4 py-2 ${billing === "monthly" ? "bg-white text-black" : "text-zinc-400"}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`rounded-full px-4 py-2 ${billing === "yearly" ? "bg-[var(--cyan)] text-black" : "text-zinc-400"}`}
              >
                Yearly −20%
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Creator", 19, "1 channel", "Solo studio essentials"],
                ["Studio Pro", 49, "3 channels", "Most Popular"],
                ["Network", 99, "10 channels", "For teams & brands"],
              ] as const
            ).map(([name, m, chan, note], idx) => (
              <div
                key={name}
                className={`rounded-2xl border p-5 ${
                  idx === 1 ? "border-[var(--red)] bg-red-500/10" : "border-white/10 bg-white/[.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{name}</h3>
                  <span className="text-[10px] font-black text-[var(--cyan)]">{note}</span>
                </div>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-display text-4xl">{price(m)}</span>
                  <span className="pb-1 text-xs text-zinc-400">/ mo</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {chan} • {billing === "yearly" ? "Billed yearly" : "Billed monthly"}
                </p>
                <Link
                  href="/login"
                  className={`mt-4 block w-full rounded-full py-2.5 text-center text-sm font-black ${
                    idx === 1 ? "bg-[var(--red)] text-white" : "bg-white text-black"
                  }`}
                >
                  Start Free
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Every plan starts free.{" "}
            <Link href="/pricing" className="text-[var(--cyan)] hover:underline">
              See full pricing →
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Questions, answered.</h2>
            <p className="mt-3 text-sm text-zinc-400">Tap a question to open it.</p>
          </div>
          <div className="space-y-2">
            {faqs.map(([q, a], i) => (
              <div key={q} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-bold"
                >
                  {q}
                  <ChevronDown className={`h-5 w-5 shrink-0 transition ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-400">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-y border-white/10 bg-gradient-to-br from-[#2a0310] via-[#090b0e] to-[#021d24] px-4 py-16 text-center sm:py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/20 blur-[80px]" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold tracking-[.25em]">
            <i className="live-dot inline-block h-2 w-2 rounded-full bg-[var(--red)]" /> YOUR STUDIO IS WAITING
          </span>
          <h2 className="mx-auto mt-5 max-w-4xl font-display text-[clamp(3rem,9vw,7rem)] leading-[.85]">
            BUILD YOUR
            <br />
            <span className="text-[var(--red)]">STUDIO.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-zinc-300">
            Your first show can be live today. Set the scene, press go, and run your own TV channel.
          </p>
          <Link
            href="/command-center"
            className="mt-7 inline-block rounded-full bg-[var(--red)] px-8 py-4 text-lg font-black shadow-[0_0_40px_rgba(255,43,61,.45)] hover:bg-[#ff4152]"
          >
            Enter Command Center →
          </Link>
          <p className="mt-4 text-xs text-zinc-500">Free preview • No card required • Cancel anytime</p>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--red)] font-black">T</span>
              <span className="font-display text-lg">
                TIKCAST <span className="text-[var(--red)]">LIVE</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-400">The control room for your TikTok TV channel.</p>
          </div>
          <div className="flex gap-10 text-sm">
            <div>
              <p className="mb-3 font-bold">Studio</p>
              <div className="space-y-2 text-zinc-400">
                <Link href="/features" className="block hover:text-white">Features</Link>
                <Link href="/showcase" className="block hover:text-white">Showcase</Link>
                <button type="button" onClick={() => go("layouts")} className="block hover:text-white">Scene Layouts</button>
              </div>
            </div>
            <div>
              <p className="mb-3 font-bold">Channel</p>
              <div className="space-y-2 text-zinc-400">
                <Link href="/" className="block hover:text-white">Home</Link>
                <Link href="/command-center" className="block hover:text-white">Command Center</Link>
                <button type="button" onClick={() => go("safety")} className="block hover:text-white">Safety</button>
              </div>
            </div>
            <div>
              <p className="mb-3 font-bold">Company</p>
              <div className="space-y-2 text-zinc-400">
                <Link href="/pricing" className="block hover:text-white">Pricing</Link>
                <Link href="/about" className="block hover:text-white">About</Link>
                <Link href="/login" className="block hover:text-white">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-5 text-xs text-zinc-500">
          <span>© 2026 TIKCAST LIVE. All rights reserved.</span>
          <span>Built for creators • Broadcast-grade • Made for TikTok TV</span>
        </div>
      </footer>
    </div>
  );
}
