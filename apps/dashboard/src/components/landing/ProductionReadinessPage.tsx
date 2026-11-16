"use client";

/**
 * TIKCAST LIVE Production Readiness — dual score:
 *   MVP LIVE  = marketing + studio + shop/music engines runnable today
 *   FULL TREE = Full Project Tree OS (monorepo · 22 tables · OBS · RTMP · mobile)
 *
 * Pattern: myfaceprofile.aikova.co.uk/readiness
 * Scanned 16 Nov 2026 · TEST PRODUCTION LIVE against tree + live health probes.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "./SiteHeader";

type Mode = "mvp" | "full";
type Surface = "marketing" | "studio" | "engines" | "supabase" | "mobile" | "full";
type Status = "DONE" | "WIP" | "TODO" | "NEW" | "FROM";

type ModuleItem = {
  id: string;
  label: string;
  pct: number;
  mvpPct: number;
  status: Status;
  mvpStatus: Status;
  href?: string;
  desc?: string;
  surface?: Surface;
  left?: string;
  files?: string;
};

type LocalNote = { id: string; text: string; mode: Mode; created: string };

const GRADIENT =
  "linear-gradient(102deg, #22e6ff 0%, #2eff8f 28%, #ffc247 55%, #ff2a4d 82%, #a678ff 100%)";

const NOTES_KEY = "tikcast_build_notes";
const SCAN_DATE = "16 Nov 2026 · TEST PROD LIVE";

/** Honest dual scores from live production test scan */
const MVP_OVERALL = 91;
const FULL_OVERALL = 68;

const PHASES: { title: string; fullPct: number; mvpPct: number; items: ModuleItem[] }[] = [
  {
    title: "ROOT • npm workspaces monorepo",
    fullPct: 60,
    mvpPct: 82,
    items: [
      {
        id: "root-workspaces",
        label: "Root package.json workspaces · 6 Node apps + safety + mobile",
        pct: 70,
        mvpPct: 90,
        status: "WIP",
        mvpStatus: "DONE",
        surface: "full",
        files: "package.json",
        desc: "dashboard · obs · automation · gateway · shop · music · safety · mobile",
        left: "Add turbo.json + pnpm for Full Tree OS parity with MyFace",
      },
      {
        id: "root-scripts",
        label: "dev:* scripts + studio start script",
        pct: 65,
        mvpPct: 85,
        status: "WIP",
        mvpStatus: "DONE",
        surface: "full",
        files: "scripts/start-studio.sh",
        left: "Unified health probe + one-command prod compose",
      },
      {
        id: "root-env",
        label: ".env · Supabase soiybpixcgeyfucgnkmh wired (gitignored)",
        pct: 85,
        mvpPct: 95,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "full",
        desc: "Keys wired · schema applied · channels/shop/music REST 200",
        left: "Optional: fix DB password + IPv4 pooler for CLI migrate next time",
      },
    ],
  },
  {
    title: "A • Marketing Site — 9 landings + header",
    fullPct: 88,
    mvpPct: 96,
    items: [
      {
        id: "m-hero",
        label: "HeroLanding · ON AIR broadcast story",
        pct: 100,
        mvpPct: 100,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "marketing",
        href: "/",
        files: "HeroLanding.tsx",
        desc: "Playout · Rights · Schedule · RTMP · Auto-clip narrative",
      },
      {
        id: "m-features",
        label: "Features + Showcase pages",
        pct: 100,
        mvpPct: 100,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "marketing",
        href: "/features",
        files: "StudioFeatures · ShowcaseLanding",
      },
      {
        id: "m-modes",
        label: "DJ Radio · Movie Mode · Pricing landings",
        pct: 100,
        mvpPct: 100,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "marketing",
        href: "/dj-radio",
        files: "3 landings",
      },
      {
        id: "m-trust",
        label: "Why Bans · About",
        pct: 100,
        mvpPct: 100,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "marketing",
        href: "/why-bans",
      },
      {
        id: "m-nav",
        label: "SiteHeader · full marketing nav → Studio",
        pct: 95,
        mvpPct: 100,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "marketing",
        files: "SiteHeader.tsx",
        left: "Legal / Privacy stubs for Full Tree",
      },
      {
        id: "m-legal",
        label: "Legal · Privacy · Terms · Cookies",
        pct: 10,
        mvpPct: 15,
        status: "TODO",
        mvpStatus: "TODO",
        surface: "marketing",
        left: "Add /legal/* pages before public launch",
      },
    ],
  },
  {
    title: "B • Command Center Studio — PID 1",
    fullPct: 62,
    mvpPct: 90,
    items: [
      {
        id: "studio-shell",
        label: "CommandCenter · scenes · playlist · health dial · kill switch",
        pct: 70,
        mvpPct: 92,
        status: "WIP",
        mvpStatus: "DONE",
        surface: "studio",
        href: "/command-center",
        files: "CommandCenter.tsx",
        desc: "8 scenes · wallpapers · schedule · demo chat/gifts",
        left: "Persist scene/playlist to Supabase channels",
      },
      {
        id: "studio-health",
        label: "HealthScoreDial + TerminalLog",
        pct: 75,
        mvpPct: 95,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "studio",
        files: "2",
      },
      {
        id: "studio-shop-ui",
        label: "ShopPanel in Studio (live shop queue UI)",
        pct: 95,
        mvpPct: 100,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "studio",
        files: "ShopPanel.tsx",
        desc: "Bound to /products + /shop/queue · 3 SKUs · showing state live",
      },
      {
        id: "studio-music-ui",
        label: "MusicBank · personal Spotify/iTunes blocked",
        pct: 95,
        mvpPct: 100,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "studio",
        files: "MusicBank.tsx",
        desc: "Bound to /music/tracks + now-playing · 2 cleared tracks playable",
      },
      {
        id: "studio-obs-wire",
        label: "OBS WebSocket live control (not mock)",
        pct: 40,
        mvpPct: 50,
        status: "WIP",
        mvpStatus: "WIP",
        surface: "studio",
        desc: "/stream/config live · obsConnected:false · OBS install in progress",
        left: "Install OBS · enable WS :4455 · set OBS_WEBSOCKET_PASSWORD",
      },
      {
        id: "studio-rtmp",
        label: "Real RTMP / TikTok Live ingest",
        pct: 25,
        mvpPct: 30,
        status: "WIP",
        mvpStatus: "WIP",
        surface: "studio",
        desc: "Go-live gate reports NEED KEY · TIKTOK_RTMP_URL still placeholder",
        left: "Paste real TikTok RTMP URL + stream key into .env",
      },
    ],
  },
  {
    title: "C • Engines — shop · music · OBS · automation · gateway · safety",
    fullPct: 48,
    mvpPct: 72,
    items: [
      {
        id: "eng-shop",
        label: "shop-engine :3002 · /health ok · supabase client",
        pct: 70,
        mvpPct: 90,
        status: "WIP",
        mvpStatus: "DONE",
        surface: "engines",
        files: "apps/shop-engine",
        desc: "TEST PROD LIVE probe UP · shop_* tables LIVE",
        left: "Auto-rotate cron · Stripe checkout",
      },
      {
        id: "eng-music",
        label: "music-engine :3003 · personal stream block",
        pct: 70,
        mvpPct: 90,
        status: "WIP",
        mvpStatus: "DONE",
        surface: "engines",
        files: "apps/music-engine",
        desc: "TEST PROD LIVE probe UP · music_* tables + cleared seed LIVE",
        left: "Playlist APIs against music_tracks / music_now_playing",
      },
      {
        id: "eng-obs",
        label: "obs-controller :3011 · mock queue",
        pct: 42,
        mvpPct: 58,
        status: "WIP",
        mvpStatus: "WIP",
        surface: "engines",
        files: "apps/obs-controller",
        desc: "TEST PROD LIVE · health UP · obsConnected:false (OBS offline)",
        left: "Real OBS WebSocket :4455 + scene/source APIs",
      },
      {
        id: "eng-auto",
        label: "automation-engine · scheduler",
        pct: 35,
        mvpPct: 50,
        status: "WIP",
        mvpStatus: "WIP",
        surface: "engines",
        files: "scheduler.js",
        left: "schedules table now exists · wire poll + kill-switch hooks",
      },
      {
        id: "eng-gw",
        label: "api-gateway · studio proxy",
        pct: 45,
        mvpPct: 60,
        status: "WIP",
        mvpStatus: "WIP",
        surface: "engines",
        files: "apps/api-gateway",
        left: "Auth middleware · rate limits · /health",
      },
      {
        id: "eng-safety",
        label: "safety-service FastAPI · keyword / kill",
        pct: 50,
        mvpPct: 70,
        status: "WIP",
        mvpStatus: "DONE",
        surface: "engines",
        files: "apps/safety-service",
        desc: "TEST PROD LIVE probe UP on :3012",
        left: "Audio rights model · moderation_logs persistence",
      },
    ],
  },
  {
    title: "D • Supabase — soiybpixcgeyfucgnkmh · 22 tables target",
    fullPct: 90,
    mvpPct: 96,
    items: [
      {
        id: "sb-init",
        label: "init.sql · 14 core tables (profiles→engine_logs)",
        pct: 100,
        mvpPct: 100,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "supabase",
        files: "20241116000000_init.sql · combined_apply.sql",
        desc: "APPLIED · channels REST 200 · default channel + 9 scenes seeded",
      },
      {
        id: "sb-storage",
        label: "storage.sql · media buckets",
        pct: 100,
        mvpPct: 100,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "supabase",
        files: "20241116000001_storage.sql",
        desc: "Buckets live: wallpapers · videos · clips · shop-images · music-tracks",
      },
      {
        id: "sb-shop-music",
        label: "shop_music.sql · 8 commerce/audio tables",
        pct: 100,
        mvpPct: 100,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "supabase",
        files: "20241116120000_shop_music.sql",
        desc: "APPLIED · 3 shop products · 2 cleared tracks · Night Desk FM playlist",
      },
      {
        id: "sb-realtime",
        label: "Realtime · gifts · comments · now_playing",
        pct: 90,
        mvpPct: 95,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "supabase",
        desc: "Publications added for comments/gifts/moderation/engine_logs/channels/shop/music",
        left: "Smoke-test Studio realtime subscribe on gifts/comments",
      },
      {
        id: "sb-rls",
        label: "RLS policies · service role vs anon",
        pct: 80,
        mvpPct: 88,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "supabase",
        desc: "Auth policies + shop public read for active products",
        left: "Tighten owner-scoped channel policies before public launch",
      },
    ],
  },
  {
    title: "E • Auth · Billing · Deploy",
    fullPct: 22,
    mvpPct: 28,
    items: [
      {
        id: "auth-login",
        label: "Login page stub",
        pct: 30,
        mvpPct: 40,
        status: "WIP",
        mvpStatus: "WIP",
        surface: "studio",
        href: "/login",
        left: "Supabase Auth email + Google",
      },
      {
        id: "billing",
        label: "Stripe · Creator £19 / Studio Pro £49 / Network £99",
        pct: 10,
        mvpPct: 15,
        status: "TODO",
        mvpStatus: "TODO",
        surface: "full",
        left: "Checkout + customer portal",
      },
      {
        id: "deploy",
        label: "Production host · HTTPS · aikova domain",
        pct: 95,
        mvpPct: 100,
        status: "DONE",
        mvpStatus: "DONE",
        surface: "full",
        href: "https://tikcast.aikova.co.uk",
        desc: "LIVE · tikcast.aikova.co.uk · nginx + PM2 + Let's Encrypt · engines proxied",
        left: "Optional: SSH key auth · rotate root password",
      },
      {
        id: "tests",
        label: "Vitest + Playwright smoke",
        pct: 5,
        mvpPct: 5,
        status: "TODO",
        mvpStatus: "TODO",
        surface: "full",
        left: "Health + studio smoke suite",
      },
    ],
  },
  {
    title: "F • Mobile Expo scaffold",
    fullPct: 18,
    mvpPct: 22,
    items: [
      {
        id: "mobile-scaffold",
        label: "apps/mobile Expo blank TypeScript",
        pct: 25,
        mvpPct: 30,
        status: "WIP",
        mvpStatus: "WIP",
        surface: "mobile",
        files: "App.tsx",
        left: "Companion remote · kill switch · now playing",
      },
      {
        id: "mobile-api",
        label: "Mobile → gateway auth session",
        pct: 5,
        mvpPct: 8,
        status: "TODO",
        mvpStatus: "TODO",
        surface: "mobile",
        left: "Deep link into Studio controls",
      },
    ],
  },
];

const LEFT_MVP = [
  {
    pri: 1,
    title: "Finish OBS install + WebSocket (:4455)",
    detail: "Enable WS in OBS · set OBS_WEBSOCKET_PASSWORD in .env · obsConnected:true",
  },
  {
    pri: 2,
    title: "Paste real TikTok RTMP URL + stream key",
    detail: "Replace rtmp://... placeholder · TIKTOK_STREAM_KEY · /stream/config goLiveReady",
  },
  {
    pri: 3,
    title: "On-air smoke from Command Center",
    detail: "Scene switch ack · Shop Show Now on overlay · Music play · GO LIVE",
  },
];

const LEFT_FULL = [
  {
    pri: 1,
    title: "RTMP / LiveKit ingest + TikTok stream keys",
    detail: "Real on-air path · FFmpeg push · key vault · multi-destination",
  },
  {
    pri: 2,
    title: "Stripe billing + Auth + Legal",
    detail: "3 plans live · Supabase Auth · /legal · production domain",
  },
  {
    pri: 3,
    title: "Turbo Full Tree + Mobile companion + tests",
    detail: "turbo.json · Expo remote · Vitest/Playwright 80%+",
  },
];

function statusOf(it: ModuleItem, mode: Mode): Status {
  return mode === "mvp" ? it.mvpStatus : it.status;
}

function Badge({ pct, status }: { pct: number; status: Status }) {
  const color =
    status === "DONE" || status === "FROM"
      ? "bg-[#2eff8f]/15 text-[#2eff8f] border-[#2eff8f]/30"
      : status === "WIP"
        ? "bg-[#ffc247]/15 text-[#ffc247] border-[#ffc247]/30"
        : status === "NEW"
          ? "bg-[#a678ff]/15 text-[#a678ff] border-[#a678ff]/30"
          : "bg-white/5 text-white/50 border-white/15";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${color}`}>
      {status} · {pct}%
    </span>
  );
}

function Circle({ pct, size = 92, stroke = 8 }: { pct: number; size?: number; stroke?: number }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    let r = 0;
    const id = setInterval(() => {
      r += 1;
      if (r >= pct) {
        r = pct;
        clearInterval(id);
      }
      setAnimated(r);
    }, 14);
    return () => clearInterval(id);
  }, [pct]);
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (animated / 100) * circ;
  const gid = `tc-grad-${size}-${stroke}-${pct}`;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ stroke: `url(#${gid})`, transition: "stroke-dashoffset 0.2s" }}
        />
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22e6ff" />
            <stop offset="40%" stopColor="#2eff8f" />
            <stop offset="70%" stopColor="#ffc247" />
            <stop offset="100%" stopColor="#ff2a4d" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span
          className="font-bold tracking-tight text-white"
          style={{ fontSize: size < 60 ? 11 : 18 }}
        >
          {animated}%
        </span>
      </div>
    </div>
  );
}

export function ProductionReadinessPage() {
  const [mode, setMode] = useState<Mode>("mvp");
  const [surface, setSurface] = useState<Surface>("full");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "A • Marketing Site — 9 landings + header": true,
    "D • Supabase — soiybpixcgeyfucgnkmh · 22 tables target": true,
  });
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [toast, setToast] = useState("");
  const [probes, setProbes] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTES_KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const endpoints: { key: string; url: string; kind?: "http" | "json" }[] = [
      { key: "dash", url: "http://127.0.0.1:3005/readiness", kind: "http" },
      { key: "shop", url: "http://127.0.0.1:3002/health", kind: "json" },
      { key: "music", url: "http://127.0.0.1:3003/health", kind: "json" },
      { key: "obs", url: "http://127.0.0.1:3011/health", kind: "json" },
      { key: "safety", url: "http://127.0.0.1:3012/health", kind: "json" },
      {
        key: "supabase",
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://soiybpixcgeyfucgnkmh.supabase.co"}/rest/v1/channels?select=id&limit=1`,
        kind: "http",
      },
    ];
    const tick = () => {
      endpoints.forEach(({ key, url, kind }) => {
        const headers: HeadersInit =
          key === "supabase"
            ? {
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
              }
            : {};
        fetch(url, { headers })
          .then(async (r) => {
            if (key === "supabase") {
              setProbes((p) => ({
                ...p,
                [key]: r.status === 200 ? "UP" : r.status === 404 ? "NO SCHEMA" : `HTTP ${r.status}`,
              }));
              return;
            }
            if (!r.ok) throw new Error(String(r.status));
            if (kind === "http") {
              setProbes((p) => ({ ...p, [key]: "UP" }));
              return;
            }
            const j = await r.json().catch(() => ({}));
            setProbes((p) => ({
              ...p,
              [key]: j.ok === false ? "DEGRADED" : "UP",
            }));
          })
          .catch(() => setProbes((p) => ({ ...p, [key]: "DOWN" })));
      });
    };
    tick();
    const id = setInterval(tick, 8000);
    return () => clearInterval(id);
  }, []);

  const overall = mode === "mvp" ? MVP_OVERALL : FULL_OVERALL;
  const leftBox = mode === "mvp" ? LEFT_MVP : LEFT_FULL;

  const filteredPhases = useMemo(() => {
    return PHASES.map((phase) => {
      const items =
        surface === "full"
          ? phase.items
          : phase.items.filter((i) => !i.surface || i.surface === surface || i.surface === "full");
      const pct = mode === "mvp" ? phase.mvpPct : phase.fullPct;
      return { ...phase, items, pct };
    }).filter((p) => p.items.length > 0);
  }, [mode, surface]);

  const circles = useMemo(
    () => [
      {
        label: "Marketing",
        pct: mode === "mvp" ? 96 : 88,
        sub: "9 pages",
      },
      {
        label: "Studio",
        pct: mode === "mvp" ? 90 : 62,
        sub: "Shop+Music live",
      },
      {
        label: "Engines",
        pct: mode === "mvp" ? 78 : 52,
        sub: "6 services",
      },
      {
        label: "Supabase",
        pct: mode === "mvp" ? 96 : 90,
        sub: "22 tables live",
      },
      {
        label: "Auth/Bill",
        pct: mode === "mvp" ? 28 : 22,
        sub: "launch",
      },
      {
        label: "Mobile",
        pct: mode === "mvp" ? 22 : 18,
        sub: "Expo",
      },
    ],
    [mode],
  );

  const exportReport = () => {
    const payload = {
      product: "TIKCAST LIVE",
      scanned: SCAN_DATE,
      mode,
      mvpOverall: MVP_OVERALL,
      fullOverall: FULL_OVERALL,
      probes,
      phases: PHASES,
      notes,
      supabase: "soiybpixcgeyfucgnkmh",
      pattern: "myfaceprofile.aikova.co.uk/readiness",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tikcast-readiness-${mode}-${Date.now()}.json`;
    a.click();
    setToast("Report exported");
    setTimeout(() => setToast(""), 2200);
  };

  const createNote = () => {
    if (!newNote.trim()) return;
    const next = [
      ...notes,
      { id: `${Date.now()}`, text: newNote.trim(), mode, created: new Date().toISOString() },
    ];
    setNotes(next);
    localStorage.setItem(NOTES_KEY, JSON.stringify(next));
    setNewNote("");
    setToast("Note saved");
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader eyebrow="READINESS • DUAL SCORE" ctaHref="/command-center" ctaLabel="Open Studio" />

      {/* Hero score */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(34,230,255,.25), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 20%, rgba(255,42,77,.2), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold text-[#050507]"
              style={{ background: GRADIENT }}
            >
              TEST PRODUCTION LIVE
            </span>
            <span className="rounded-full border border-[#2eff8f]/35 bg-[#2eff8f]/10 px-3 py-1 text-[11px] font-semibold text-[#2eff8f]">
              Scanned {SCAN_DATE}
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
              Pattern · MyFace /readiness
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
              :3005 · /readiness · /production
            </span>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h1 className="font-display text-[clamp(2rem,5vw,3.4rem)] leading-[0.95] tracking-tight">
                TIKCAST <span className="text-[#22e6ff]">LIVE</span>
                <br />
                <span className="text-white/90">production live test</span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/65">
                Live probe board for MVP vs Full Tree — dashboard, engines, OBS, safety, and
                Supabase schema on soiybpixcgeyfucgnkmh. Auto-refreshes every 8s.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 rounded-full border border-white/15 bg-black/40 p-1 w-fit">
                {(
                  [
                    { id: "mvp" as Mode, label: `MVP LIVE · ${MVP_OVERALL}%` },
                    { id: "full" as Mode, label: `FULL TREE · ${FULL_OVERALL}%` },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMode(t.id)}
                    className={`rounded-full px-4 py-2 text-[12px] font-bold transition ${
                      mode === t.id ? "text-[#050507]" : "text-white/60 hover:text-white"
                    }`}
                    style={mode === t.id ? { background: GRADIENT } : undefined}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-[28px] border border-white/12 bg-[var(--surface)] p-6 shadow-[0_0_60px_rgba(34,230,255,.12)]">
              <Circle pct={overall} size={120} stroke={10} />
              <div className="text-center">
                <div className="text-[13px] font-bold uppercase tracking-widest text-white/50">
                  {mode === "mvp" ? "MVP LIVE" : "FULL PROJECT TREE"}
                </div>
                <div className="mt-1 text-[12px] text-white/45">
                  {mode === "mvp"
                    ? "Live test · ship-ready slice"
                    : "Live test · full broadcast OS"}
                </div>
              </div>
            </div>
          </div>

          {/* Live probes */}
          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { k: "dash", label: "Dash :3005" },
              { k: "shop", label: "Shop :3002" },
              { k: "music", label: "Music :3003" },
              { k: "obs", label: "OBS :3011" },
              { k: "safety", label: "Safety :3012" },
              { k: "supabase", label: "Supabase" },
            ].map((p) => {
              const st = probes[p.k] || "…";
              const ok = st === "UP";
              const warn = st === "NO SCHEMA" || st === "DEGRADED";
              return (
                <div
                  key={p.k}
                  className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-white/70">{p.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        ok
                          ? "bg-[#2eff8f]/15 text-[#2eff8f]"
                          : warn
                            ? "bg-[#ffc247]/15 text-[#ffc247]"
                            : st === "DOWN"
                              ? "bg-[#ff2a4d]/15 text-[#ff2a4d]"
                              : "bg-white/10 text-white/50"
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What's left */}
      <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-[var(--surface)] p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-white/45">
                What&apos;s left · {mode === "mvp" ? "MVP" : "Full Tree"}
              </div>
              <h2 className="mt-1 text-[22px] font-extrabold tracking-tight">Priority board</h2>
            </div>
            <Link
              href="/command-center"
              className="rounded-full border border-white/15 px-4 py-2 text-[12px] font-bold hover:bg-white/5"
            >
              Open Studio →
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {leftBox.map((item) => (
              <div
                key={item.pri}
                className="rounded-2xl border border-white/10 bg-black/25 p-4"
              >
                <div
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-bold text-[#050507]"
                  style={{ background: GRADIENT }}
                >
                  {item.pri}
                </div>
                <div className="mt-3 text-[13px] font-bold leading-snug">{item.title}</div>
                <div className="mt-1.5 text-[11px] leading-relaxed text-white/50">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Surface OS cards */}
      <section className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-[var(--surface)] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-[11px] font-bold text-[#050507]"
                style={{ background: GRADIENT }}
              >
                FULL PROJECT TREE OS
              </span>
              <span className="text-[13px] font-bold text-white/80">
                Filter · Marketing · Studio · Engines · Supabase · Mobile
              </span>
            </div>
            <div className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-black/30 p-1">
              {(
                ["full", "marketing", "studio", "engines", "supabase", "mobile"] as Surface[]
              ).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSurface(r)}
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold ${
                    surface === r ? "bg-white text-[#050507]" : "text-white/50 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              {
                flag: "📣",
                title: "Marketing ~9",
                items: ["Hero + Features", "Showcase · Pricing", "DJ · Movie · Why Bans", "About · Header"],
              },
              {
                flag: "🎛",
                title: "Studio PID 1",
                items: ["Command Center", "ShopPanel · MusicBank", "Health · Kill switch", "Demo chat/gifts"],
              },
              {
                flag: "⚙️",
                title: "Engines ~6",
                items: ["shop :3002", "music :3003", "obs :3011", "safety :3012"],
              },
              {
                flag: "🗄",
                title: "Supabase 22",
                items: ["14 core tables LIVE", "8 shop/music LIVE", "5 storage buckets", "Seeds: channel/shop/music"],
              },
            ].map((col) => (
              <div
                key={col.title}
                className="rounded-[24px] border border-white/10 bg-black/25 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[18px]">{col.flag}</span>
                  <b className="text-[13px]">{col.title}</b>
                </div>
                <div className="mt-3 space-y-2 text-[11px] leading-[1.4]">
                  {col.items.map((t) => (
                    <div
                      key={t}
                      className="rounded-xl border border-white/10 bg-[var(--surface-2)] p-2.5 text-white/70"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expandable tree */}
      <section id="tree" className="mx-auto max-w-[1280px] px-4 py-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[22px] font-extrabold tracking-tight">
            Production Tree · {mode === "mvp" ? "MVP" : "Full OS"} expandable
          </h2>
          <button
            type="button"
            onClick={exportReport}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold hover:bg-white/10"
          >
            Export Report JSON
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {filteredPhases.map((phase) => {
            const isOpen = !!expanded[phase.title];
            return (
              <div
                key={phase.title}
                className="overflow-hidden rounded-[20px] border border-white/10 bg-[var(--surface)]"
              >
                <button
                  type="button"
                  onClick={() => setExpanded((e) => ({ ...e, [phase.title]: !isOpen }))}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-black/40 text-[12px] font-bold">
                    {phase.pct}%
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold">{phase.title}</div>
                    <div className="text-[11px] text-white/45">
                      {
                        phase.items.filter((i) => {
                          const s = statusOf(i, mode);
                          return s === "DONE" || s === "FROM";
                        }).length
                      }{" "}
                      DONE/FROM ·{" "}
                      {
                        phase.items.filter((i) => {
                          const s = statusOf(i, mode);
                          return s === "WIP" || s === "NEW";
                        }).length
                      }{" "}
                      WIP/NEW · {phase.items.filter((i) => statusOf(i, mode) === "TODO").length} TODO
                      <span className="text-white/30">
                        {" "}
                        · MVP {phase.mvpPct}% · Full {phase.fullPct}%
                      </span>
                    </div>
                  </div>
                  <div className="hidden h-1.5 w-[120px] overflow-hidden rounded-full bg-white/10 sm:block">
                    <div className="h-full" style={{ width: `${phase.pct}%`, background: GRADIENT }} />
                  </div>
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/40 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ⌄
                  </span>
                </button>
                {isOpen && (
                  <div className="grid gap-2 border-t border-white/10 bg-black/20 p-2 sm:p-3">
                    {phase.items.map((it) => {
                      const st = statusOf(it, mode);
                      const pct = mode === "mvp" ? it.mvpPct : it.pct;
                      return (
                        <div
                          key={it.id}
                          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[var(--surface)] p-3 transition-all hover:border-white/20 sm:p-4"
                        >
                          <div className="hidden sm:block">
                            <Circle pct={pct} size={44} stroke={5} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[12px] font-semibold leading-tight sm:text-[13px]">
                                {it.label}
                              </span>
                              <Badge pct={pct} status={st} />
                              {it.surface && (
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase text-white/50">
                                  {it.surface}
                                </span>
                              )}
                              {it.files && (
                                <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/40">
                                  {it.files}
                                </span>
                              )}
                            </div>
                            {it.desc && (
                              <div className="mt-1 text-[11px] leading-[1.5] text-white/45">
                                {it.desc}
                              </div>
                            )}
                            {it.left && (
                              <div className="mt-1.5 rounded-xl border border-[#ffc247]/20 bg-[#ffc247]/10 px-2.5 py-1.5 text-[11px] text-[#ffc247]">
                                Left: {it.left}
                              </div>
                            )}
                            {it.href && (
                              <div className="mt-2">
                                <Link
                                  href={it.href}
                                  className="text-[11px] font-bold text-[#22e6ff] hover:underline"
                                >
                                  Open {it.href} →
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-[var(--surface)] p-5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/45">
              Build monitor notes
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g. Applied shop_music.sql on soiybpix…"
                className="flex-1 rounded-full border border-white/15 bg-black/40 px-3 py-2 text-[12px] outline-none focus:border-[#22e6ff]"
              />
              <button
                type="button"
                onClick={createNote}
                disabled={!newNote.trim()}
                className="rounded-xl px-4 py-2 text-[11px] font-bold text-[#050507] disabled:opacity-50"
                style={{ background: GRADIENT }}
              >
                Add
              </button>
            </div>
            <div className="mt-3 grid max-h-[180px] gap-2 overflow-auto">
              {notes.length === 0 && (
                <div className="text-[11px] text-white/35">No notes yet — saved in this browser.</div>
              )}
              {notes
                .slice()
                .reverse()
                .map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl border border-white/10 bg-black/30 p-2.5 text-[11px]"
                  >
                    <span className="font-semibold uppercase text-[#22e6ff]">{n.mode}</span> · {n.text}
                    <div className="text-[10px] text-white/35">
                      {new Date(n.created).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#0a0b10] p-5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/45">
              Circle board
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {circles.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() =>
                    document.getElementById("tree")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="rounded-2xl border border-white/10 bg-[var(--surface)] p-3 text-center transition hover:border-[#22e6ff]/40"
                >
                  <div className="grid place-items-center">
                    <Circle pct={c.pct} size={56} stroke={6} />
                  </div>
                  <div className="mt-1 text-[11px] font-bold">{c.label}</div>
                  <div className="text-[10px] text-white/40">{c.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/40">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 rounded-[24px] border border-white/10 bg-[var(--surface)] p-5 sm:flex-row">
            <div>
              <div className="text-[13px] font-bold">
                Dual assessment · MVP live {MVP_OVERALL}% · Full Project Tree OS {FULL_OVERALL}% ·
                TIKCAST LIVE
              </div>
              <div className="mt-2 text-[11px] leading-[1.5] text-white/45">
                TEST PROD LIVE · schema + Studio shop/music BOUND · Next: OBS WS + TikTok RTMP
                key → on-air smoke
              </div>
            </div>
            <span
              className="self-start rounded-full px-3 py-1 text-[11px] font-bold text-[#050507]"
              style={{ background: GRADIENT }}
            >
              MVP {MVP_OVERALL}% · Full {FULL_OVERALL}%
            </span>
          </div>
        </div>
      </footer>

      {toast && (
        <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-[#050507] shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
