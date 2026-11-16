"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clapperboard,
  Disc3,
  Download,
  FileText,
  HeartHandshake,
  HelpCircle,
  Mail,
  Megaphone,
  MessageSquare,
  MonitorPlay,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { SiteHeader } from "./SiteHeader";

type WaitlistForm = {
  name: string;
  handle: string;
  email: string;
  type: string;
  message: string;
};

type WaitlistRow = WaitlistForm & { id: string; createdAt: string };

const STORAGE_KEY = "tikcast_waitlist_signups";
const emptyForm: WaitlistForm = {
  name: "",
  handle: "",
  email: "",
  type: "Morning Show",
  message: "",
};

const docs = [
  {
    id: "blueprint",
    icon: BookOpen,
    title: "The Blueprint",
    tag: "START HERE",
    desc: "How a TikTok channel becomes a station: formats, segments, and the daily rundown.",
    body: "Start with one repeatable format, not ten ideas. Pick a time slot, a host voice, and three segments you can run every show. The Blueprint shows how to turn that into a schedule people can return to.",
    steps: [
      "Choose one format and one time slot",
      "Build a 3-segment rundown",
      "Name the show like a station would",
    ],
  },
  {
    id: "obs",
    icon: Wrench,
    title: "OBS Setup Guide",
    tag: "SETUP",
    desc: "Scenes, sources, audio, and the control-room layout — without a broadcast degree.",
    body: "Connect TikTok RTMP in OBS, then layer scenes for opening, main show, breaks, and closing. Keep audio on one clean path so your voice always wins over music and clips.",
    steps: [
      "Add TikTok RTMP as your stream destination",
      "Create Opening / Main / Break / Closing scenes",
      "Test audio levels before you go live",
    ],
  },
  {
    id: "safety",
    icon: ShieldCheck,
    title: "Safety Policy",
    tag: "PROTECTION",
    desc: "The rules that keep your account standing: permission, labeling, and live presence.",
    body: "Safety is a workflow, not a warning. Label replays, keep permission on file, stay present on camera, and check risky content before it airs. If a segment cannot pass Rights Check, it does not go live.",
    steps: [
      "Label every replay clearly",
      "Keep permission for every borrowed clip",
      "Stay present and in control of the broadcast",
    ],
  },
  {
    id: "permission",
    icon: FileText,
    title: "Permission DM Templates",
    tag: "TEMPLATES",
    desc: "Short, respectful messages creators actually answer — for clips, music, and collabs.",
    body: "Ask before you air. Say who you are, where the clip would run, how it will be credited, and how the owner can say no. Save the reply with the clip so your team can prove permission later.",
    steps: [
      "Introduce the show and the exact use",
      "Offer credit and an easy way to decline",
      "Save the reply with the clip record",
    ],
  },
  {
    id: "pricing",
    icon: CircleDollarSign,
    title: "Pricing Guide",
    tag: "PLANS",
    desc: "What is included at each level — and what you can run for free while you learn.",
    body: "Start free, learn the control room, and grow into paid features only when your schedule needs them. The guide compares what each plan unlocks, from scenes to monitoring and team seats.",
    steps: [
      "Start free and learn the control room",
      "Compare scene, monitoring, and team limits",
      "Upgrade only when your schedule needs it",
    ],
  },
  {
    id: "faq-doc",
    icon: HelpCircle,
    title: "FAQ",
    tag: "ANSWERS",
    desc: "The questions every new station owner asks before the first broadcast.",
    body: "The FAQ below covers affiliation, devices, bans, permission, and Health Score. If a question is not answered, use the waitlist form to ask it and we will route it to the right guide.",
    steps: [
      "Read the six starter questions below",
      "Check the Safety Policy for account rules",
      "Ask anything else through the waitlist form",
    ],
  },
];

const faqs = [
  {
    q: "Is TIKCAST affiliated with TikTok?",
    a: "No. TIKCAST LIVE is an independent creator tool. TikTok is a platform you stream to; TIKCAST helps you plan, produce, and monitor that broadcast. You remain responsible for following TikTok’s own rules.",
  },
  {
    q: "Do I need a PC?",
    a: "For the full control-room experience, yes — a PC running OBS gives you scenes, wallpapers, monitoring, and Health Score in one place. You can still plan your schedule and prepare permission checks on another device.",
  },
  {
    q: "Can I use it on phone?",
    a: "Your phone can be part of the show — as a camera, a second screen, or a way to watch chat — but the studio itself is built for a PC control room. Phone-only creators can start with planning and grow into the full setup.",
  },
  {
    q: "Will I get banned using TIKCAST?",
    a: "No tool can promise that, and we will not pretend otherwise. TIKCAST is built to reduce avoidable risk: Rights Check, replay labels, permission records, and live presence. Your choices on air still matter most.",
  },
  {
    q: "How do I get permission for videos?",
    a: "Ask the owner directly, in writing, before you air the clip. Use the Permission DM Templates, state exactly how you will use it, credit the creator, and keep the reply saved. No reply means no permission.",
  },
  {
    q: "What if my Health Score drops?",
    a: "Treat it as an early warning, not a verdict. Check what changed — permission, labels, presence, or risky content — fix that segment, and do not repeat it. The monitor is there so you can correct course before a small issue becomes a strike.",
  },
];

const timeline = [
  {
    n: "01",
    title: "We heard creators complain about bans",
    text: "The same story kept appearing: a strike with no clear warning, a ban after a good run, a channel rebuilt from zero. Creators were not asking for shortcuts. They were asking for a safer way to do the work they loved.",
    icon: Megaphone,
  },
  {
    n: "02",
    title: "We built the first OBS control room",
    text: "We stopped thinking in clips and started thinking in shows. Scenes, wallpapers, segments, schedules — a small studio a creator could run from one PC, with the broadcast always in view.",
    icon: MonitorPlay,
  },
  {
    n: "03",
    title: "We added Rights Check + Safety Net",
    text: "Growth should not cost an account. We built checks for permission, replay labeling, and live presence — plus a Health Score that flags risk while there is still time to fix it.",
    icon: ShieldCheck,
  },
  {
    n: "04",
    title: "We launched TIKCAST LIVE for all creators",
    text: "Morning shows, DJ radio, movie nights, and talk formats — one station mindset, many voices. Built by a creator, for creators, with safety treated as part of the show.",
    icon: Radio,
  },
];

const values = [
  {
    icon: Users,
    title: "Creator First",
    lead: "Your channel, your rules.",
    text: "The schedule, the voice, the format, and the audience stay yours. TIKCAST is the control room — you are the station.",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    lead: "Never risk the account to grow it.",
    text: "A viral moment is not worth a strike. We would rather help you skip a segment than help you gamble a channel.",
  },
  {
    icon: HeartHandshake,
    title: "Transparency",
    lead: "Label replays, get permission, be present.",
    text: "Tell viewers what they are watching. Credit the people who made it. Show up for your own broadcast.",
  },
];

function loadWaitlist(): WaitlistRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WaitlistRow[]) : [];
  } catch {
    return [];
  }
}

function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-bold tracking-[0.28em] text-[#22d3ee]">{kicker}</p>
      <h2 className="movie-display mt-3 text-[clamp(2.4rem,7vw,4.2rem)] leading-[0.92]">{title}</h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-[#aab6c1] sm:text-lg">{sub}</p>}
    </div>
  );
}

export function AboutLanding() {
  const [activeDoc, setActiveDoc] = useState(docs[0]);
  const [openFaq, setOpenFaq] = useState(0);
  const [form, setForm] = useState<WaitlistForm>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    setWaitlistCount(loadWaitlist().length);
  }, []);

  function setField(key: keyof WaitlistForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
    setFormError(null);
  }

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!form.name.trim() || !form.handle.trim() || !form.email.trim()) {
      setFormError("Please add your name, TikTok handle, and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    setFormError(null);
    const row: WaitlistRow = {
      id: `waitlist-${Date.now()}`,
      name: form.name.trim(),
      handle: form.handle.trim().replace(/^@/, ""),
      email: form.email.trim().toLowerCase(),
      type: form.type,
      message: form.message.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [row, ...loadWaitlist()].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setWaitlistCount(next.length);
    setSaved(true);
    setForm(emptyForm);
    setBusy(false);
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#07090c] text-[#f2f5f7]">
      <SiteHeader eyebrow="ABOUT + DOCS" ctaLabel="Join Waitlist" ctaHref="#join" />

      <main id="top">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="hero-grid absolute inset-0" aria-hidden="true" />
          <div
            className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-[rgba(255,45,63,0.16)] blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-40 h-72 w-72 rounded-full bg-[rgba(34,211,238,0.12)] blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16 lg:pb-16">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-[#0d1117] px-3 py-1.5 text-[11px] font-bold tracking-[0.18em] text-[#22d3ee]">
                ● ON AIR · CREATOR STATION
              </span>
              <span className="rounded-full bg-[rgba(255,45,63,.14)] px-3 py-1.5 text-[11px] font-bold text-[#ff9aa3]">
                EST. 2026
              </span>
            </div>
            <h1 className="movie-display mt-6 max-w-5xl text-[clamp(3rem,9.5vw,7.2rem)] leading-[0.86]">
              WE BUILT TIKCAST BECAUSE TIKTOK KEPT BANNING{" "}
              <span className="text-[#ff2d3f]">CREATORS</span> WE LOVED.
            </h1>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
              <p className="max-w-2xl text-lg leading-relaxed text-[#aab6c1] sm:text-xl">
                Creators were crying out — bans, strikes, no warning. We wanted a studio that lets you run
                TikTok like a real TV channel, safely, with permission, with a safety net. So we built it.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => go("join")}
                  className="rounded-full bg-[#ff2d3f] px-6 py-3.5 font-bold hover:bg-[#e01d2e]"
                >
                  Join the Waitlist <ArrowRight className="ml-1 inline h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go("story")}
                  className="rounded-full border border-white/20 bg-[#0d1117] px-6 py-3.5 font-bold hover:border-[#22d3ee]"
                >
                  Read Our Story
                </button>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
              {(
                [
                  ["Built 2026", "A new station era"],
                  ["Creator-First", "Your channel, your rules"],
                  ["Safety-First", "Never gamble the account"],
                  ["Community-Driven", "Built with creators"],
                ] as const
              ).map(([a, b]) => (
                <div key={a} className="bg-[#0d1117] p-5">
                  <p className="movie-display text-2xl sm:text-3xl">{a}</p>
                  <p className="mt-1 text-sm text-[#aab6c1]">{b}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#aab6c1]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff2d3f]" /> CONTROL ROOM · MORNING SHOW
                </span>
                <span className="rounded-full bg-[rgba(34,211,238,.14)] px-2.5 py-1 text-[11px] font-bold text-[#22d3ee]">
                  HEALTH 94
                </span>
              </div>
              <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-[1.55fr_.75fr_.7fr]">
                <div className="relative flex min-h-[190px] items-end overflow-hidden rounded-xl bg-gradient-to-br from-[#38131a] via-[#171021] to-[#072027] p-4">
                  <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] font-bold tracking-widest">
                    LIVE · 08:00
                  </span>
                  <div>
                    <p className="movie-display text-3xl leading-none sm:text-4xl">
                      GOOD MORNING,
                      <br />
                      CREATOR.
                    </p>
                    <p className="mt-2 text-sm text-white/70">Opening segment · Chat is on</p>
                  </div>
                  <span className="absolute bottom-3 right-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-black">
                    YOU ARE PRESENT
                  </span>
                </div>
                <div className="rounded-xl bg-[#141a21] p-4">
                  <p className="text-xs font-bold tracking-widest text-[#aab6c1]">UP NEXT</p>
                  <div className="mt-3 space-y-3 text-sm">
                    <p className="flex gap-2">
                      <span className="text-[#22d3ee]">08:15</span> Creator spotlight
                    </p>
                    <p className="flex gap-2">
                      <span className="text-[#22d3ee]">08:30</span> Rights Check
                    </p>
                    <p className="flex gap-2">
                      <span className="text-[#22d3ee]">08:45</span> DJ takeover
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-[#141a21] p-4">
                  <p className="text-xs font-bold tracking-widest text-[#aab6c1]">SAFETY CHECKS</p>
                  <div className="mt-3 space-y-2.5 text-sm">
                    <p className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#22d3ee]" /> Permission saved
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#22d3ee]" /> Replay labeled
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#22d3ee]" /> Host present
                    </p>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40">
                    <div className="h-full w-[94%] rounded-full bg-[#22d3ee]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden border-t border-white/10 py-3" aria-hidden="true">
            <div className="marquee flex w-max whitespace-nowrap text-xs font-bold tracking-[0.24em] text-[#aab6c1]">
              <span className="pr-8">
                MORNING SHOW ✦ DJ RADIO ✦ MOVIE NIGHT ✦ TALK ✦ PERMISSION FIRST ✦ LABEL REPLAYS ✦ STAY PRESENT
                ✦&nbsp;
              </span>
              <span className="pr-8">
                MORNING SHOW ✦ DJ RADIO ✦ MOVIE NIGHT ✦ TALK ✦ PERMISSION FIRST ✦ LABEL REPLAYS ✦ STAY PRESENT
                ✦&nbsp;
              </span>
            </div>
          </div>
        </section>

        {/* STORY */}
        <section id="story" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeading
            kicker="01 — OUR STORY"
            title="A FRUSTRATION BECAME A STUDIO."
            sub="We did not start with a product idea. We started by listening — and by refusing to accept that good creators should lose everything overnight."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {timeline.map((s) => (
              <article
                key={s.n}
                className="relative flex flex-col rounded-2xl border border-white/10 bg-[#0d1117] p-6 pt-8 hover:border-[rgba(34,211,238,.45)]"
              >
                <span className="movie-display absolute -top-3 left-5 bg-[#07090c] px-2 text-2xl text-[#ff2d3f]">
                  {s.n}
                </span>
                <s.icon className="h-7 w-7 text-[#22d3ee]" />
                <h3 className="mt-4 text-xl font-bold leading-snug">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#aab6c1]">{s.text}</p>
              </article>
            ))}
          </div>
          <blockquote className="mt-8 rounded-2xl border-l-4 border-[#ff2d3f] bg-[#141a21] p-6 sm:p-8">
            <p className="text-xl font-semibold leading-relaxed sm:text-2xl">
              “We wanted a place where a creator could be ambitious — and still wake up with their channel
              intact.”
            </p>
            <p className="mt-3 text-sm font-bold tracking-widest text-[#aab6c1]">
              THE TIKCAST TEAM · FOUNDING BELIEF
            </p>
          </blockquote>
        </section>

        {/* VALUES */}
        <section id="safety" className="scroll-mt-24 border-y border-white/10 bg-[#0a0e13]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionHeading
              kicker="02 — MISSION / VALUES"
              title="THREE RULES. EVERY SHOW."
              sub="These are not slogans on a wall. They decide what gets built, what gets aired, and what gets stopped."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {values.map((v, i) => (
                <article
                  key={v.title}
                  className={`rounded-2xl border p-6 sm:p-7 ${
                    i === 1
                      ? "border-[rgba(255,45,63,.5)] bg-[rgba(255,45,63,.14)]"
                      : "border-white/10 bg-[#0d1117]"
                  }`}
                >
                  <v.icon className={`h-9 w-9 ${i === 1 ? "text-[#ff2d3f]" : "text-[#22d3ee]"}`} />
                  <h3 className="movie-display mt-5 text-3xl">{v.title}</h3>
                  <p className="mt-2 font-bold">{v.lead}</p>
                  <p className="mt-3 leading-relaxed text-[#aab6c1]">{v.text}</p>
                </article>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#0d1117] p-4 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
              <p className="min-w-0 flex-1">
                <strong>Safety is a workflow.</strong>{" "}
                <span className="text-[#aab6c1]">
                  Permission, labels, and presence — checked before the show, not after a strike.
                </span>
              </p>
              <button type="button" onClick={() => go("docs")} className="font-bold text-[#22d3ee]">
                Read the Safety Policy →
              </button>
            </div>
          </div>
        </section>

        {/* HOW + DOCS */}
        <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeading
            kicker="03 — HOW IT WORKS / DOCS"
            title="FROM SETUP TO ON AIR, IN FOUR MOVES."
            sub="A clear path for your first broadcast — and the docs to back up every step."
          />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                {
                  icon: Download,
                  t: "Download + Connect TikTok RTMP",
                  d: "Install the studio, connect your TikTok RTMP destination, and test your stream before anyone watches.",
                },
                {
                  icon: Clapperboard,
                  t: "Pick Scenes + Wallpapers",
                  d: "Choose opening, main, break, and closing scenes. Make the channel look like a station, not a webcam.",
                },
                {
                  icon: CalendarClock,
                  t: "Set Schedule + Rights Check",
                  d: "Lock the time slot. Check permission, labels, and risky content before it can reach the air.",
                },
                {
                  icon: Activity,
                  t: "Go Live + Monitor Health Score",
                  d: "Run the show from one control room. Watch Health Score and fix small issues while they are small.",
                },
              ] as const
            ).map((s, i) => (
              <li key={s.t} className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(34,211,238,.14)] text-[#22d3ee]">
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-[11px] font-bold tracking-[0.22em] text-[#aab6c1]">STEP {i + 1}</p>
                <h3 className="mt-2 font-bold leading-snug">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#aab6c1]">{s.d}</p>
              </li>
            ))}
          </ol>

          <div id="docs" className="mt-14 grid scroll-mt-24 gap-5 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-[11px] font-bold tracking-[0.28em] text-[#22d3ee]">DOCUMENTATION</p>
              <h3 className="movie-display mt-2 text-4xl leading-none">
                PICK A GUIDE.
                <br />
                START WHERE YOU ARE.
              </h3>
              <p className="mt-3 text-[#aab6c1]">
                Select a card to read its summary and first steps. Each guide is written for a creator, not an
                engineer.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {docs.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setActiveDoc(d);
                      if (d.id === "pricing") {
                        /* keep on page */
                      }
                      if (d.id === "faq-doc") go("faq");
                      if (d.id === "safety") setActiveDoc(d);
                    }}
                    aria-pressed={activeDoc.id === d.id}
                    className={`rounded-xl border p-4 text-left transition ${
                      activeDoc.id === d.id
                        ? "border-[#22d3ee] bg-[rgba(34,211,238,.14)]"
                        : "border-white/10 bg-[#0d1117] hover:border-white/20"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <d.icon className="h-5 w-5 text-[#22d3ee]" />
                      {activeDoc.id === d.id && <Check className="h-4 w-4 text-[#22d3ee]" />}
                    </span>
                    <span className="mt-3 block font-bold">{d.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#aab6c1]">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div
              className="self-start rounded-2xl border border-white/10 bg-[#141a21] p-6 sm:p-7 lg:sticky lg:top-24"
              aria-live="polite"
            >
              <span className="rounded-full bg-[#ff2d3f] px-3 py-1 text-[11px] font-bold tracking-widest">
                {activeDoc.tag}
              </span>
              <h4 className="movie-display mt-4 text-4xl leading-none">{activeDoc.title}</h4>
              <p className="mt-4 leading-relaxed text-[#aab6c1]">{activeDoc.body}</p>
              <p className="mt-6 text-xs font-bold tracking-[0.22em] text-[#aab6c1]">FIRST STEPS</p>
              <ol className="mt-3 space-y-3">
                {activeDoc.steps.map((s, i) => (
                  <li key={s} className="flex gap-3 text-sm">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#22d3ee] text-xs font-bold text-black">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              {activeDoc.id === "pricing" ? (
                <Link
                  href="/pricing"
                  className="mt-6 block w-full rounded-full border border-[#22d3ee] py-3 text-center font-bold text-[#22d3ee] hover:bg-[rgba(34,211,238,.14)]"
                >
                  Open full Pricing →
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => go("join")}
                  className="mt-6 w-full rounded-full border border-[#22d3ee] py-3 font-bold text-[#22d3ee] hover:bg-[rgba(34,211,238,.14)]"
                >
                  Start with this guide — Join Free
                </button>
              )}
            </div>
          </div>
        </section>

        {/* WAITLIST */}
        <section id="join" className="scroll-mt-24 border-y border-white/10 bg-[#0a0e13]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <SectionHeading
                kicker="04 — CONTACT / JOIN"
                title="TELL US WHAT STATION YOU WANT TO BUILD."
                sub="Join the waitlist. Tell us your format, your schedule dream, and what has held your channel back. We read every message."
              />
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d1117] p-4">
                  <Mail className="h-5 w-5 text-[#22d3ee]" />
                  <div>
                    <p className="text-xs font-bold tracking-widest text-[#aab6c1]">EMAIL</p>
                    <p className="font-bold">
                      hello@tikcast.live{" "}
                      <span className="ml-1 text-xs font-normal text-[#aab6c1]">(placeholder)</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d1117] p-4">
                  <MessageSquare className="h-5 w-5 text-[#22d3ee]" />
                  <div>
                    <p className="text-xs font-bold tracking-widest text-[#aab6c1]">SUPPORT + COMMUNITY</p>
                    <p className="font-bold">Support for setup &amp; safety · Community for creators</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d1117] p-4">
                  <Disc3 className="h-5 w-5 text-[#22d3ee]" />
                  <div>
                    <p className="text-xs font-bold tracking-widest text-[#aab6c1]">FORMATS WE LOVE</p>
                    <p className="font-bold">Morning Show · DJ Radio · Movie Night · Talk</p>
                  </div>
                </div>
              </div>
              {waitlistCount > 0 && (
                <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[rgba(34,211,238,.14)] px-3 py-1.5 text-sm font-semibold text-[#22d3ee]">
                  <Sparkles className="h-4 w-4" /> {waitlistCount} creator
                  {waitlistCount === 1 ? "" : "s"} on the waitlist
                </p>
              )}
            </div>

            <form
              onSubmit={submit}
              className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 sm:p-7"
              noValidate
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="movie-display text-3xl">JOIN THE WAITLIST</h3>
                <span className="rounded-full bg-[rgba(255,45,63,.14)] px-3 py-1 text-xs font-bold text-[#ff9aa3]">
                  FREE
                </span>
              </div>
              <p className="mt-1 text-sm text-[#aab6c1]">No spam. One welcome, then real updates.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold tracking-wider">NAME *</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-white/10 bg-[#141a21] px-3.5 py-3 text-sm outline-none focus:border-[#22d3ee]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold tracking-wider">TIKTOK HANDLE *</span>
                  <input
                    required
                    value={form.handle}
                    onChange={(e) => setField("handle", e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full rounded-lg border border-white/10 bg-[#141a21] px-3.5 py-3 text-sm outline-none focus:border-[#22d3ee]"
                  />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-bold tracking-wider">EMAIL *</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/10 bg-[#141a21] px-3.5 py-3 text-sm outline-none focus:border-[#22d3ee]"
                />
              </label>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-bold tracking-wider">WHAT TYPE OF CHANNEL?</span>
                <select
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#141a21] px-3.5 py-3 text-sm outline-none focus:border-[#22d3ee]"
                >
                  <option>Morning Show</option>
                  <option>DJ Radio</option>
                  <option>Movie Night</option>
                  <option>Talk</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-bold tracking-wider">MESSAGE</span>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setField("message", e.target.value)}
                  placeholder="What do you want your station to become?"
                  className="w-full resize-y rounded-lg border border-white/10 bg-[#141a21] px-3.5 py-3 text-sm outline-none focus:border-[#22d3ee]"
                />
              </label>
              {formError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-[rgba(255,45,63,.14)] px-3 py-2.5 text-sm font-semibold text-[#ff9aa3]"
                >
                  {formError}
                </p>
              )}
              {saved && (
                <p
                  role="status"
                  className="mt-4 flex items-start gap-2 rounded-lg bg-[rgba(34,211,238,.14)] px-3 py-2.5 text-sm font-semibold text-[#22d3ee]"
                >
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" /> You are on the list. Welcome to the
                  station — we will be in touch.
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="mt-5 w-full rounded-full bg-[#ff2d3f] py-3.5 font-bold hover:bg-[#e01d2e] disabled:opacity-60"
              >
                {busy ? "Joining…" : "Join Waitlist →"}
              </button>
              <p className="mt-3 text-center text-xs text-[#aab6c1]">
                By joining, you agree to receive waitlist updates. Entries are saved on this device.
              </p>
            </form>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeading
            kicker="05 — FAQ"
            title="QUESTIONS? GOOD. ASK THEM."
            sub="Straight answers before your first broadcast."
          />
          <div className="mt-9 space-y-3">
            {faqs.map((f, i) => (
              <div
                key={f.q}
                className={`overflow-hidden rounded-xl border ${
                  openFaq === i
                    ? "border-[#22d3ee] bg-[#141a21]"
                    : "border-white/10 bg-[#0d1117]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  aria-expanded={openFaq === i}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-bold">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#22d3ee] transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-5 leading-relaxed text-[#aab6c1]">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden border-t border-white/10 bg-gradient-to-br from-[#220a0e] via-[#0a0e13] to-[#062027]">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24">
            <p className="text-[11px] font-bold tracking-[0.3em] text-[#22d3ee]">YOUR TIME SLOT IS WAITING</p>
            <h2 className="movie-display mx-auto mt-4 max-w-4xl text-[clamp(2.8rem,8vw,6rem)] leading-[0.9]">
              JOIN THE STATION.
              <br />
              <span className="text-[#ff2d3f]">BUILD YOUR CHANNEL.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[#aab6c1]">
              Run TikTok like a real TV channel — safely, with permission, with a safety net.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => go("join")}
                className="rounded-full bg-[#ff2d3f] px-7 py-3.5 font-bold hover:bg-[#e01d2e]"
              >
                Start Free <ArrowRight className="ml-1 inline h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go("docs")}
                className="rounded-full border border-white/25 bg-black/20 px-7 py-3.5 font-bold hover:border-[#22d3ee]"
              >
                Explore the Docs
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#05070a]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-xs">
              <p className="movie-display text-2xl">
                TIKCAST <span className="text-[#ff2d3f]">LIVE</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#aab6c1]">
                Built by a creator, for creators. Who got tired of bans.
              </p>
              <p className="mt-3 text-sm">
                <span className="text-[#aab6c1]">Contact:</span> <strong>hello@tikcast.live</strong>{" "}
                <span className="text-[#aab6c1]">(placeholder)</span>
              </p>
            </div>
            <nav aria-label="Sitemap">
              <p className="text-xs font-bold tracking-[0.22em] text-[#aab6c1]">SITEMAP</p>
              <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm font-semibold">
                <li>
                  <Link href="/" className="hover:text-[#22d3ee]">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-[#22d3ee]">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/dj-radio" className="hover:text-[#22d3ee]">
                    DJ Radio
                  </Link>
                </li>
                <li>
                  <Link href="/movie-mode" className="hover:text-[#22d3ee]">
                    Movie Mode
                  </Link>
                </li>
                <li>
                  <Link href="/showcase" className="hover:text-[#22d3ee]">
                    Showcase
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-[#22d3ee]">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#22d3ee]">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/command-center" className="hover:text-[#22d3ee]">
                    Studio
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-[#7d8b97]">
            <span>
              © {new Date().getFullYear()} TIKCAST LIVE. Independent creator tool — not affiliated with TikTok.
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#22d3ee]" /> Permission first. Safety first.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
