"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Ban,
  BellRing,
  Check,
  ChevronDown,
  Copy,
  Eye,
  FileCheck,
  Gauge,
  ListFilter,
  Megaphone,
  MessageSquareWarning,
  Mic,
  Music,
  Power,
  Radio,
  RefreshCw,
  Shield,
  ShieldCheck,
  Siren,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { SiteHeader } from "./SiteHeader";

const reasons = [
  {
    id: 1,
    title: "Re-streaming Other People's Content Without Permission",
    tag: "CREDIT ≠ PERMISSION",
    icon: Copy,
    color: "#fe2c55",
    why: "TikTok treats unlicensed re-streams as stolen content — even if you shout out the original creator. A credit in the caption does not transfer rights.",
    example:
      "A creator re-streamed a viral YouTube documentary with “credit to owner” on screen. The rights holder reported it. Strike one, then a LIVE ban.",
    fix: "Permission DM System logs written approval before you go live. No permission on file? The segment is blocked from your playlist.",
  },
  {
    id: 2,
    title: "Fake / Misleading LIVE",
    tag: "LOOP = FAKE LIVE",
    icon: RefreshCw,
    color: "#25f4ee",
    why: "Looping a pre-recorded video while pretending you are live breaks trust. TikTok’s systems and viewers both flag repeated, non-interactive streams.",
    example:
      "A channel looped the same 20-minute clip overnight and replied “I’m live!” in chat. Viewers reported it as misleading. The account lost LIVE access.",
    fix: "TIKCAST labels every replay as REPLAY and requires a live host check-in. Your audience always knows what is live and what is not.",
  },
  {
    id: 3,
    title: "Copyrighted Music / Movies / Sports Clips",
    tag: "RIGHTS CHECK",
    icon: Music,
    color: "#ffc531",
    why: "A few seconds of a hit song, a film scene, or a match highlight can trigger a copyright claim, a muted stream, or a strike — even in the background.",
    example:
      "A creator played a chart playlist during a chill stream. Three tracks were claimed. The VOD was removed and the account received a warning.",
    fix: "Green / Yellow / Red Rights Check scans your playlist before air. Red items are blocked. Yellow items need permission or a swap.",
  },
  {
    id: 4,
    title: "Toxic Chat — Hate, Threats, Self-Harm in Comments",
    tag: "YOUR CHAT = YOUR DUTY",
    icon: MessageSquareWarning,
    color: "#fe2c55",
    why: "TikTok holds the host responsible for what stays visible in chat. Leaving hate, threats, or self-harm comments up is treated as allowing it.",
    example:
      "A busy host missed a thread of threats in fast chat. A viewer reported the stream. TikTok removed the LIVE for harassment in comments.",
    fix: "Auto-moderation Bot hides flagged comments instantly, queues them for a human, and logs the action — so your chat never stays toxic while you are busy hosting.",
  },
  {
    id: 5,
    title: "Banned Words on Mic",
    tag: "ONE WORD CAN END IT",
    icon: Mic,
    color: "#ff5a76",
    why: "Slurs, threats, and violent language picked up live can end a stream in seconds — whether it came from you, a guest, or a loud clip.",
    example:
      "A guest dropped a slur during a heated debate segment. The stream was cut mid-sentence. The host said they “didn’t hear it in time.”",
    fix: "Real-time Vocal + Keyword Filter listens for banned terms, mutes the moment, and flags the clip for review before TikTok has to act.",
  },
  {
    id: 6,
    title: "Spammy Behaviour",
    tag: "GROWTH ≠ SPAM",
    icon: Zap,
    color: "#25f4ee",
    why: "Repetitive loops, mass-following prompts, gift-baiting, and “follow for follow” pressure look like manipulation — not community building.",
    example:
      "A stream ran “gift to unlock the next clip” on a loop for hours. It was flagged as deceptive engagement and gift baiting.",
    fix: "TIKCAST removes gift-gated content from your rundown and flags repetitive loops, so growth stays clean and explainable.",
  },
  {
    id: 7,
    title: "Dangerous / Graphic Content",
    tag: "IF IN DOUBT, CUT IT",
    icon: Siren,
    color: "#ffc531",
    why: "Blood, violence, graphic injury, and self-harm shown on screen are high-risk for TikTok — even in news, reaction, or documentary context.",
    example:
      "A reaction stream played an uncensored graphic clip “for context.” The LIVE was removed for graphic content, despite a warning on screen.",
    fix: "Playlist Blocker + Kill Switch let you cut to BRB in one tap. Risky segments are held for review instead of going straight to air.",
  },
  {
    id: 8,
    title: "No Human Oversight",
    tag: "AUTOMATION NEEDS A HOST",
    icon: Eye,
    color: "#fe2c55",
    why: "24/7 automation with no host and no moderation looks unattended. When something goes wrong, nobody is there to stop it — and TikTok notices.",
    example:
      "An always-on channel ran unattended overnight. A flagged clip played for hours with no one moderating. The account was restricted for unmanaged LIVE.",
    fix: "TIKCAST requires a host presence check, a moderator queue, and a health score. Automation supports you — it never replaces you.",
  },
];

const safetyNet = [
  {
    icon: FileCheck,
    title: "Green / Yellow / Red Rights Check",
    desc: "Every clip is checked before air. Red is blocked. Yellow needs permission. Green is cleared.",
    badge: "PRE-AIR",
  },
  {
    icon: Mic,
    title: "Real-time Vocal + Keyword Filter",
    desc: "Banned terms are muted the moment they are spoken — on mic, from guests, or in clips.",
    badge: "LIVE",
  },
  {
    icon: ShieldCheck,
    title: "Flag vs Suspend Moderation",
    desc: "Flag for review when it is borderline. Suspend instantly when it is clearly unsafe. No guessing.",
    badge: "MODERATION",
  },
  {
    icon: Gauge,
    title: "Health Score 0–100 Dashboard",
    desc: "One number that shows how safe your stream is right now — and what is dragging it down.",
    badge: "DASHBOARD",
  },
  {
    icon: Power,
    title: "Kill Switch to BRB",
    desc: "One tap cuts to a branded BRB screen while you fix the problem. No panic, no dead air.",
    badge: "EMERGENCY",
  },
  {
    icon: Users,
    title: "Permission DM System",
    desc: "Request, store, and prove permission for every re-streamed clip in one place.",
    badge: "LICENSING",
  },
  {
    icon: ListFilter,
    title: "Auto-moderation Bot",
    desc: "Hides toxic chat, holds it for a human, and keeps a clean audit trail.",
    badge: "CHAT",
  },
  {
    icon: Ban,
    title: "Playlist Blocker",
    desc: "Copyrighted, graphic, or unapproved items never make it into your live rundown.",
    badge: "PLAYLIST",
  },
];

const pillars = [
  {
    n: "01",
    title: "Be Transparent",
    desc: "Label replays as replays. Say what is live, what is not, and who made it. Trust is a format, not a disclaimer.",
    icon: Eye,
  },
  {
    n: "02",
    title: "Be Licensed",
    desc: "Get permission first, keep proof forever. A DM, an email, a licence — saved, searchable, showable.",
    icon: BadgeCheck,
  },
  {
    n: "03",
    title: "Be Present",
    desc: "Host on screen. Moderate in real time. TikTok rewards streams that are actually hosted, not left running.",
    icon: UserCheck,
  },
  {
    n: "04",
    title: "Be Proactive",
    desc: "Self-moderate before TikTok does. Catch it, cut it, fix it — and show your work in the log.",
    icon: BellRing,
  },
];

const faqs = [
  {
    q: "Will TIKCAST guarantee I never get banned?",
    a: "No tool can guarantee that — TikTok makes the final call. What TIKCAST does is remove the most common, preventable reasons creators get banned: unlicensed clips, fake LIVE, toxic chat, banned words, and unattended automation. You still host responsibly. TIKCAST makes that much easier to prove.",
  },
  {
    q: "Can I still play YouTube videos?",
    a: "Yes — if you have permission or a valid licence for that use. Credit alone is not permission. Use the Permission DM System to request approval, store the reply, and only add the clip once it is marked Green. If you do not have permission, choose a licensed alternative.",
  },
  {
    q: "Does TikTok allow OBS / RTMP?",
    a: "TikTok allows approved live tools and streaming setups when they follow its LIVE policies. The risk is not the tool — it is what you stream through it. Looped fake LIVE, unlicensed content, and unmoderated chat are policy problems, whatever software you use.",
  },
  {
    q: "Is credit enough?",
    a: "No. Credit tells people who made it. Permission tells TikTok you are allowed to use it. A credit on screen does not stop a copyright claim, a strike, or a ban. Get the permission, save the proof, and keep it attached to the clip.",
  },
  {
    q: "What happens if something slips through live?",
    a: "Use the Kill Switch to cut to BRB, flag the moment for review, and let the log show you acted fast. Early, visible self-moderation is one of the strongest signals you can send to TikTok — and to your audience.",
  },
];

const checks = [
  {
    id: "restream",
    label: "Do you restream YouTube, TikTok, or other creators’ videos?",
    weight: 3,
    hint: "Without written permission, this is your biggest exposure.",
  },
  {
    id: "loop",
    label: "Do you loop videos and present them as live?",
    weight: 3,
    hint: "Looped fake LIVE is one of the fastest ways to lose LIVE access.",
  },
  {
    id: "music",
    label: "Do you play copyrighted music, movies, or sports clips?",
    weight: 2,
    hint: "Background music still counts. Rights checks catch it before air.",
  },
  {
    id: "chat",
    label: "Do you leave chat unmoderated while you host?",
    weight: 2,
    hint: "You are responsible for what stays visible in your chat.",
  },
  {
    id: "words",
    label: "Have banned words or slurs ever slipped out on mic?",
    weight: 2,
    hint: "One moment on mic can end a stream. A live filter is your seatbelt.",
  },
  {
    id: "unattended",
    label: "Do you run streams with no host on screen?",
    weight: 2,
    hint: "Unattended automation reads as unmanaged LIVE to TikTok.",
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function WhyBanLanding() {
  const [openReason, setOpenReason] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);
  const [selected, setSelected] = useState<string[]>(["restream"]);
  const [showResult, setShowResult] = useState(false);

  const score = useMemo(
    () => selected.reduce((sum, id) => sum + (checks.find((c) => c.id === id)?.weight || 0), 0),
    [selected]
  );

  const level =
    score <= 2
      ? {
          label: "LOW",
          color: "#2ee66b",
          desc: "You are running a relatively clean setup. Keep it that way with pre-air checks and a visible host.",
        }
      : score <= 6
        ? {
            label: "MEDIUM",
            color: "#ffc531",
            desc: "You have real, fixable exposure. One or two habits are putting your account at risk — most creators fix this in a week.",
          }
        : {
            label: "HIGH",
            color: "#fe2c55",
            desc: "You are broadcasting on borrowed time. Stop the highest-risk habit today, get permission on file, and put a filter + moderator in place.",
          };

  function toggle(id: string) {
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    setShowResult(false);
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#08080d] text-[#f6f6f8]">
      <SiteHeader eyebrow="BROADCAST SAFELY" ctaLabel="Check Your Risk →" ctaHref="#risk" />

      <div className="overflow-hidden border-b border-[#262635] bg-[#0e0e16] py-2">
        <div className="marquee-track flex w-max whitespace-nowrap text-[11px] font-bold tracking-[0.14em] text-[#a9a9bd]">
          {[0, 1].map((i) => (
            <span key={i} className="flex gap-8 pr-8">
              <span>● CREDIT IS NOT PERMISSION</span>
              <span className="text-[#25f4ee]">● LOOPING ≠ LIVE</span>
              <span>● YOUR CHAT IS YOUR RESPONSIBILITY</span>
              <span className="text-[#fe2c55]">● ONE WORD CAN END A STREAM</span>
              <span>● BE TRANSPARENT • BE LICENSED • BE PRESENT • BE PROACTIVE</span>
            </span>
          ))}
        </div>
      </div>

      <main id="top">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(720px 360px at 18% 8%, rgba(254,44,85,.28), transparent 60%), radial-gradient(680px 360px at 88% 20%, rgba(37,244,238,.18), transparent 60%)",
            }}
          />
          <div className="relative mx-auto grid max-w-[1180px] gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#262635] bg-white/5 px-3 py-1.5 text-[11px] font-bold tracking-wide">
                <span className="live-dot h-2 w-2 rounded-full bg-[#fe2c55]" /> FOR CREATORS WHO HAVE HEARD
                “ACCOUNT RESTRICTED” TOO MANY TIMES{" "}
                <span className="rounded-full bg-[#fe2c55] px-2 py-0.5 text-white">ON AIR</span>
              </div>
              <h1 className="font-display mt-5 text-balance text-[clamp(38px,7vw,72px)] font-black leading-[0.92] tracking-tight">
                TikTok Didn’t Ban You For <span className="text-[#fe2c55]">No Reason.</span>
                <br />
                <span className="text-[#25f4ee]">Here’s Why.</span>
              </h1>
              <p className="mt-5 max-w-[620px] text-[16px] leading-relaxed text-[#a9a9bd] sm:text-[18px]">
                Creators have cried out loud about bans for years — strikes with no warning, LIVE access gone
                overnight, accounts lost over one clip. Most bans are not random. They follow a pattern.{" "}
                <strong className="text-white">
                  TIKCAST LIVE shows you the pattern, then helps you broadcast past it.
                </strong>
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => scrollToId("safety")}
                  className="rounded-full bg-[#fe2c55] px-6 py-3.5 text-[15px] font-bold shadow-[0_10px_30px_rgba(254,44,85,.35)] hover:bg-[#ff4a6a]"
                >
                  See How TIKCAST Protects You <ArrowRight className="ml-1 inline h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToId("risk")}
                  className="rounded-full border border-[#25f4ee] bg-[#25f4ee]/10 px-6 py-3.5 text-[15px] font-bold text-[#25f4ee] hover:bg-[#25f4ee]/20"
                >
                  Check Your Risk <Shield className="ml-1 inline h-4 w-4" />
                </button>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#a9a9bd]">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#2ee66b]" /> No guesswork
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#2ee66b]" /> Early warning before TikTok acts
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#2ee66b]" /> Proof for every clip
                </span>
              </div>
              <p className="mt-6 max-w-[620px] border-l-2 border-[#25f4ee] pl-4 text-[14px] italic leading-relaxed text-[#d8d8e6]">
                “Stop guessing. Start broadcasting safely. Your own TV channel, hosted by TikTok — without the
                ban.”
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#262635] bg-[#12121c] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#262635] px-4 py-3">
                <div className="flex items-center gap-2 text-[12px] font-bold">
                  <span className="live-dot h-2.5 w-2.5 rounded-full bg-[#fe2c55]" /> LIVE • STUDIO CONTROL
                </div>
                <span className="rounded-full bg-[#25f4ee]/15 px-2 py-1 text-[11px] font-bold text-[#25f4ee]">
                  HEALTH 94 / 100
                </span>
              </div>
              <div className="relative bg-[#0b0b14] p-4">
                <div className="relative overflow-hidden rounded-xl border border-[#262635] bg-gradient-to-br from-[#251018] via-[#101428] to-[#071a1a] p-4">
                  <div className="scanline absolute left-0 h-[2px] w-full bg-[#25f4ee]/40" />
                  <div className="flex items-start justify-between">
                    <span className="rounded bg-[#fe2c55] px-2 py-1 text-[10px] font-black tracking-widest">
                      ● LIVE
                    </span>
                    <span className="rounded bg-black/50 px-2 py-1 text-[11px]">12,408 watching</span>
                  </div>
                  <div className="mt-10 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#fe2c55] font-display text-xl font-black">
                      YOU
                    </div>
                    <div>
                      <div className="font-display text-[18px] font-black">YOUR SHOW, HOSTED LIVE</div>
                      <div className="text-[12px] text-[#a9a9bd]">
                        Host on screen • Chat moderated • Rights checked
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="rounded-full bg-[#2ee66b]/15 px-2 py-1 text-[#2ee66b]">✓ RIGHTS: GREEN</span>
                    <span className="rounded-full bg-[#25f4ee]/15 px-2 py-1 text-[#25f4ee]">✓ FILTER: ON</span>
                    <span className="rounded-full bg-white/10 px-2 py-1">✓ MOD: ACTIVE</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                  <div className="rounded-lg bg-white/5 p-2.5">
                    <div className="text-[#2ee66b]">GREEN</div>
                    <div className="mt-1 text-[#a9a9bd]">Rights Check</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2.5">
                    <div className="text-[#25f4ee]">FILTERED</div>
                    <div className="mt-1 text-[#a9a9bd]">Vocal Filter</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2.5">
                    <div className="text-[#ffc531]">BRB READY</div>
                    <div className="mt-1 text-[#a9a9bd]">Kill Switch</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToId("risk")}
                  className="mt-3 w-full rounded-xl bg-white py-3 text-[14px] font-black text-black hover:bg-[#25f4ee]"
                >
                  RUN MY RISK CHECK — IT TAKES 30 SECONDS
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-y border-[#262635] bg-[#0e0e16]">
          <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4">
            {(
              [
                ["8", "Ban patterns, explained plainly"],
                ["24h", "Early warning before TikTok acts*"],
                ["0–100", "Health Score on every stream"],
                ["1 tap", "Kill Switch to a safe BRB screen"],
              ] as const
            ).map(([n, l]) => (
              <div key={l} className="px-4 py-5">
                <div className="font-display text-[28px] font-black text-[#25f4ee]">{n}</div>
                <div className="mt-1 text-[13px] leading-snug text-[#a9a9bd]">{l}</div>
              </div>
            ))}
          </div>
          <p className="mx-auto max-w-[1180px] px-4 pb-4 text-[11px] text-[#a9a9bd] sm:px-6">
            *Early warning means TIKCAST flags risky content in your own checks before you publish — it does not
            mean TikTok notifies you early.
          </p>
        </section>

        {/* 8 REASONS */}
        <section id="reasons" className="mx-auto max-w-[1180px] scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-black tracking-[0.2em] text-[#fe2c55]">THE PATTERN BEHIND THE BAN</p>
              <h2 className="font-display mt-2 max-w-[720px] text-[clamp(30px,5vw,48px)] font-black leading-[0.95]">
                The 8 Reasons TikTok Bans Creators
              </h2>
              <p className="mt-3 max-w-[720px] text-[#a9a9bd]">
                Tap a card. Each one shows why TikTok acts, what it looks like in real life, and exactly how
                TIKCAST fixes it.
              </p>
            </div>
            <span className="rounded-full border border-[#262635] px-3 py-1.5 text-[12px] font-bold text-[#a9a9bd]">
              8 cards • Expandable
            </span>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {reasons.map((r) => {
              const open = openReason === r.id;
              return (
                <article
                  key={r.id}
                  className={`overflow-hidden rounded-2xl border bg-[#12121c] transition ${
                    open
                      ? "border-[#fe2c55]/60 shadow-[0_16px_40px_rgba(254,44,85,.12)]"
                      : "border-[#262635] hover:border-white/25"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenReason(open ? 0 : r.id)}
                    className="flex w-full items-start gap-3 p-4 text-left sm:p-5"
                    aria-expanded={open}
                  >
                    <span
                      className="font-display shrink-0 text-[28px] font-black"
                      style={{ color: r.color }}
                    >
                      {String(r.id).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="mb-1.5 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-black tracking-widest"
                        style={{ color: r.color }}
                      >
                        {r.tag}
                      </span>
                      <span className="block font-display text-[17px] font-extrabold leading-tight sm:text-[19px]">
                        {r.title}
                      </span>
                    </span>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5">
                      <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                    </span>
                  </button>
                  {open && (
                    <div className="space-y-4 border-t border-[#262635] p-4 sm:p-5">
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-[11px] font-black tracking-widest text-[#fe2c55]">
                          <AlertTriangle className="h-4 w-4" /> WHY TIKTOK BANS
                        </div>
                        <p className="text-[14px] leading-relaxed text-[#d8d8e6]">{r.why}</p>
                      </div>
                      <div className="rounded-xl bg-black/30 p-3.5">
                        <div className="mb-1 flex items-center gap-2 text-[11px] font-black tracking-widest text-[#ffc531]">
                          <Megaphone className="h-4 w-4" /> REAL EXAMPLE
                        </div>
                        <p className="text-[14px] leading-relaxed text-[#a9a9bd]">{r.example}</p>
                      </div>
                      <div className="rounded-xl border border-[#25f4ee]/25 bg-[#25f4ee]/5 p-3.5">
                        <div className="mb-1 flex items-center gap-2 text-[11px] font-black tracking-widest text-[#25f4ee]">
                          <ShieldCheck className="h-4 w-4" /> HOW TIKCAST FIXES IT
                        </div>
                        <p className="text-[14px] leading-relaxed">{r.fix}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => scrollToId("risk")}
                        className="text-[13px] font-bold text-[#25f4ee] hover:underline"
                      >
                        Check if this is your risk →
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* SAFETY NET */}
        <section id="safety" className="scroll-mt-24 border-y border-[#262635] bg-[#0e0e16]">
          <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-[12px] font-black tracking-[0.2em] text-[#25f4ee]">THE TIKCAST SAFETY NET</p>
                <h2 className="font-display mt-2 text-[clamp(30px,5vw,46px)] font-black leading-[0.95]">
                  Not luck.
                  <br />
                  A system.
                </h2>
                <p className="mt-4 leading-relaxed text-[#a9a9bd]">
                  Bans rarely come from one bad moment. They come from no system. The Safety Net puts a check
                  before, during, and after every stream — so a mistake becomes a fix, not a strike.
                </p>
                <div className="mt-6 rounded-2xl border border-[#262635] bg-[#12121c] p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Your stream health</span>
                    <span className="font-display text-2xl font-black text-[#2ee66b]">94 / 100</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-[#25f4ee] to-[#2ee66b]" />
                  </div>
                  <p className="mt-3 text-[13px] text-[#a9a9bd]">
                    Green rights • Filter on • Moderator active • Host present. One amber item: a Yellow clip
                    needs permission.
                  </p>
                  <button
                    type="button"
                    onClick={() => scrollToId("risk")}
                    className="mt-4 w-full rounded-full bg-[#25f4ee] py-3 text-[14px] font-black text-black hover:bg-white"
                  >
                    Get my Health Score →
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {safetyNet.map((s) => {
                  const I = s.icon;
                  return (
                    <div
                      key={s.title}
                      className="rounded-2xl border border-[#262635] bg-[#12121c] p-4 hover:border-[#25f4ee]/40"
                    >
                      <span className="inline-block rounded-full bg-white/5 px-2 py-1 text-[10px] font-black tracking-widest text-[#25f4ee]">
                        {s.badge}
                      </span>
                      <I className="mt-3 h-6 w-6 text-[#25f4ee]" />
                      <h3 className="mt-2 font-display text-[16px] font-extrabold leading-tight">{s.title}</h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-[#a9a9bd]">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* BEFORE / AFTER */}
        <section className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-center text-[clamp(30px,5vw,46px)] font-black">
            Before TIKCAST. <span className="text-[#25f4ee]">After TIKCAST.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[640px] text-center text-[#a9a9bd]">
            Same creator. Same ambition. A completely different relationship with TikTok.
          </p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#262635]">
            <div className="grid grid-cols-3 bg-[#12121c] text-[12px] font-black tracking-wide sm:text-[13px]">
              <div className="p-3 sm:p-4">WHAT HAPPENS</div>
              <div className="border-l border-[#262635] p-3 text-[#fe2c55] sm:p-4">WITHOUT TIKCAST</div>
              <div className="border-l border-[#262635] bg-[#25f4ee]/10 p-3 text-[#25f4ee] sm:p-4">
                WITH TIKCAST
              </div>
            </div>
            {(
              [
                ["Planning", "Guessing what is allowed", "Checked — Green / Yellow / Red before air"],
                ["Going live", "Risky restream, no warning", "Safe rundown, permission on file"],
                ["On mic", "No filter, one slip = strike", "Vocal + keyword filter, muted instantly"],
                ["In chat", "Toxic comments stay up", "Auto-mod hides, human reviews"],
                ["When it goes wrong", "Panic, no proof", "Kill Switch to BRB + action log"],
                [
                  "TikTok relationship",
                  "Reactive, defensive",
                  "Proactive, transparent, documented",
                ],
              ] as const
            ).map(([a, b, c]) => (
              <div
                key={a}
                className="grid grid-cols-3 border-t border-[#262635] text-[13px] leading-snug sm:text-[14px]"
              >
                <div className="p-3 font-bold sm:p-4">{a}</div>
                <div className="border-l border-[#262635] p-3 text-[#a9a9bd] sm:p-4">{b}</div>
                <div className="border-l border-[#262635] bg-[#25f4ee]/5 p-3 font-semibold sm:p-4">{c}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-[#ffc531]/30 bg-[#ffc531]/5 p-4 text-center text-[14px]">
            <strong className="text-[#ffc531]">Early warning, explained:</strong>{" "}
            <span className="text-[#a9a9bd]">
              TIKCAST flags risky clips up to 24 hours before your scheduled stream — so you can swap, get
              permission, or cut it before TikTok ever sees it.
            </span>
          </div>
        </section>

        {/* PILLARS */}
        <section className="border-y border-[#262635] bg-[#0e0e16]">
          <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-center text-[12px] font-black tracking-[0.2em] text-[#fe2c55]">
              REPAIR THE RELATIONSHIP
            </p>
            <h2 className="font-display mx-auto mt-2 max-w-[760px] text-center text-[clamp(30px,5vw,46px)] font-black leading-[0.95]">
              Improve Your Relationship With TikTok
            </h2>
            <p className="mx-auto mt-3 max-w-[640px] text-center text-[#a9a9bd]">
              TikTok trusts creators who make its job easier. These four habits do exactly that.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((p) => {
                const I = p.icon;
                return (
                  <div key={p.title} className="rounded-2xl border border-[#262635] bg-[#12121c] p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[28px] font-black text-white/15">{p.n}</span>
                      <I className="h-6 w-6 text-[#fe2c55]" />
                    </div>
                    <h3 className="font-display mt-4 text-[20px] font-black">{p.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-[#a9a9bd]">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RISK CHECKER */}
        <section id="risk" className="mx-auto max-w-[1180px] scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-6 overflow-hidden rounded-[28px] border border-[#fe2c55]/30 bg-gradient-to-br from-[#1a0f16] via-[#12121c] to-[#0d1a1a] p-5 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="flex items-center gap-2 text-[12px] font-black tracking-[0.2em] text-[#fe2c55]">
                <Siren className="h-4 w-4" /> INTERACTIVE • 30 SECONDS
              </p>
              <h2 className="font-display mt-2 text-[clamp(30px,5vw,44px)] font-black leading-[0.95]">
                Check Your Risk.
                <br />
                Before TikTok Does.
              </h2>
              <p className="mt-3 text-[#a9a9bd]">
                Tick what is true for your streams. Be honest — this is for you, not TikTok.
              </p>
              <div className="mt-6 space-y-2.5">
                {checks.map((c) => {
                  const on = selected.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggle(c.id)}
                      aria-pressed={on}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                        on
                          ? "border-[#fe2c55] bg-[#fe2c55]/10"
                          : "border-[#262635] bg-black/20 hover:border-white/30"
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${
                          on ? "border-[#fe2c55] bg-[#fe2c55]" : "border-white/30"
                        }`}
                      >
                        {on && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span>
                        <span className="block text-[14px] font-semibold leading-snug">{c.label}</span>
                        {on && <span className="mt-1 block text-[12px] text-[#a9a9bd]">{c.hint}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setShowResult(true)}
                className="mt-5 w-full rounded-full bg-[#fe2c55] py-3.5 font-bold hover:bg-[#ff4a6a]"
              >
                See My Risk Level →
              </button>
            </div>
            <div className="rounded-2xl border border-[#262635] bg-black/30 p-5 sm:p-6">
              {!showResult ? (
                <div className="grid h-full place-items-center py-8 text-center">
                  <div>
                    <Gauge className="mx-auto h-10 w-10 text-[#25f4ee]" />
                    <p className="font-display mt-4 text-[20px] font-black">Your result is waiting</p>
                    <p className="mt-2 text-[14px] text-[#a9a9bd]">
                      Select your habits, then tap <strong className="text-white">See My Risk Level</strong>.
                      <br />
                      Currently selected: <strong className="text-white">{selected.length}</strong>
                    </p>
                    <div className="mt-5 inline-flex gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[12px]">
                        Score so far: <strong>{score} / 14</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-black tracking-widest text-[#a9a9bd]">YOUR RISK LEVEL</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[12px]">SCORE {score} / 14</span>
                  </div>
                  <div
                    className="font-display mt-3 text-[clamp(44px,9vw,72px)] font-black leading-none"
                    style={{ color: level.color }}
                  >
                    {level.label}
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (score / 14) * 100)}%`,
                        background: level.color,
                      }}
                    />
                  </div>
                  <p className="mt-4 leading-relaxed text-[#a9a9bd]">{level.desc}</p>
                  <div className="mt-5 rounded-xl bg-white/5 p-4">
                    <p className="font-bold">Your next move</p>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-[#a9a9bd]">
                      {score <= 2
                        ? "Keep your host on screen, run a Rights Check on every new clip, and keep a moderator in chat."
                        : score <= 6
                          ? "Fix your highest-weight habit first. If it is restreaming, get permission on file or swap the clip. Turn on a vocal filter and a chat filter before your next LIVE."
                          : "Pause the riskiest habit today. Do not loop, do not restream without permission, and do not go live unattended. Rebuild with licensed clips, a host, and moderation."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToId("safety")}
                    className="mt-4 w-full rounded-full bg-[#25f4ee] py-3 font-black text-black"
                  >
                    Protect Me With TIKCAST →
                  </button>
                  <p className="mt-3 text-center text-[11px] text-[#a9a9bd]">
                    This is a self-check, not a TikTok decision. Use it to fix habits before they become strikes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* QUOTES */}
        <section className="border-y border-[#262635] bg-[#0e0e16]">
          <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16">
            <h2 className="font-display text-center text-[clamp(28px,5vw,42px)] font-black">
              Creators Who Stopped Guessing
            </h2>
            <p className="mt-2 text-center text-[#a9a9bd]">
              Illustrative creator stories — not named endorsements.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {(
                [
                  [
                    "I got 2 strikes before TIKCAST. I thought credit was enough. It wasn’t. Now every clip has permission on file — and I sleep before I go live.",
                    "A reaction creator • 2 strikes, then a system",
                  ],
                  [
                    "I used to loop overnight and hope no one noticed. Now I label replays, host live, and my chat actually trusts me again.",
                    "A late-night host • Rebuilt after a LIVE ban",
                  ],
                  [
                    "One guest said one word and my stream died. The vocal filter caught it next time. That one save paid for the whole year.",
                    "A debate show host • Saved by the filter",
                  ],
                ] as const
              ).map(([q, a]) => (
                <figure
                  key={a}
                  className="flex flex-col rounded-2xl border border-[#262635] bg-[#12121c] p-5"
                >
                  <span className="font-display text-[36px] leading-none text-[#fe2c55]">“</span>
                  <blockquote className="flex-1 text-[15px] leading-relaxed">{q}</blockquote>
                  <figcaption className="mt-5 border-t border-[#262635] pt-3 text-[12px] font-bold text-[#a9a9bd]">
                    {a}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING TEASER */}
        <section id="pricing-teaser" className="mx-auto max-w-[1180px] scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-center text-[12px] font-black tracking-[0.2em] text-[#25f4ee]">START SAFE</p>
          <h2 className="font-display mt-2 text-center text-[clamp(30px,5vw,46px)] font-black">
            Safety Shouldn’t Be a Luxury
          </h2>
          <p className="mx-auto mt-3 max-w-[600px] text-center text-[#a9a9bd]">
            Start free. Upgrade when your channel grows. The Safety Net is included on every paid plan.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                {
                  name: "Starter",
                  price: "Free",
                  desc: "Try the Safety Net",
                  features: ["Rights Check — 5 clips / mo", "Risk Checker", "BRB screen", "Community guide"],
                  cta: "Start Free",
                  hot: false,
                },
                {
                  name: "Creator",
                  price: "£19",
                  desc: "For regular live creators",
                  features: [
                    "Safety Net included",
                    "Vocal + keyword filter",
                    "Auto-moderation bot",
                    "Health Score dashboard",
                  ],
                  cta: "Start Safe",
                  hot: true,
                },
                {
                  name: "Studio Pro",
                  price: "£49",
                  desc: "For shows & multi-guest streams",
                  features: [
                    "Everything in Creator",
                    "Permission DM System",
                    "Flag vs Suspend queue",
                    "Playlist Blocker + Kill Switch",
                  ],
                  cta: "Go Pro",
                  hot: false,
                },
                {
                  name: "Network",
                  price: "£99",
                  desc: "For teams & channels",
                  features: [
                    "Everything in Studio Pro",
                    "Multiple hosts & moderators",
                    "Team audit log",
                    "Priority support",
                  ],
                  cta: "Build a Network",
                  hot: false,
                },
              ] as const
            ).map((p) => (
              <article
                key={p.name}
                className={`relative flex flex-col rounded-2xl border p-5 ${
                  p.hot
                    ? "border-[#fe2c55] bg-[#1a0f16] shadow-[0_18px_40px_rgba(254,44,85,.18)]"
                    : "border-[#262635] bg-[#12121c]"
                }`}
              >
                {p.hot && (
                  <span className="absolute -top-3 left-4 rounded-full bg-[#fe2c55] px-3 py-1 text-[11px] font-black">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="font-display text-[18px] font-black">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-[34px] font-black">{p.price}</span>
                  <span className="text-[12px] text-[#a9a9bd]">/ month</span>
                </div>
                <p className="mt-1 text-[13px] text-[#a9a9bd]">{p.desc}</p>
                <ul className="mt-4 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-[13px] leading-snug">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#25f4ee]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className={`mt-5 block w-full rounded-full py-3 text-center text-[14px] font-bold ${
                    p.hot ? "bg-[#fe2c55] hover:bg-[#ff4a6a]" : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {p.cta} →
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-4 text-center text-[12px] text-[#a9a9bd]">
            Prices shown as a teaser. See full plans on{" "}
            <Link href="/pricing" className="text-[#25f4ee] underline">
              Pricing
            </Link>
            .
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 border-t border-[#262635] bg-[#0e0e16]">
          <div className="mx-auto max-w-[880px] px-4 py-12 sm:px-6 sm:py-16">
            <h2 className="font-display text-center text-[clamp(30px,5vw,44px)] font-black">
              Questions Creators Actually Ask
            </h2>
            <div className="mt-8 space-y-3">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={f.q}
                    className="overflow-hidden rounded-2xl border border-[#262635] bg-[#12121c]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
                      aria-expanded={open}
                    >
                      <span className="font-display text-[16px] font-bold leading-snug sm:text-[18px]">
                        {f.q}
                      </span>
                      <ChevronDown className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && (
                      <p className="border-t border-[#262635] p-4 pt-4 text-[14px] leading-relaxed text-[#a9a9bd] sm:px-5">
                        {f.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16">
          <div className="relative overflow-hidden rounded-[28px] bg-[#fe2c55] p-6 text-center sm:p-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                background: "radial-gradient(500px 220px at 85% 10%, #25f4ee, transparent 60%)",
              }}
            />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-[12px] font-bold">
                <Radio className="h-4 w-4" /> YOUR CHANNEL. YOUR RULES. YOUR PROOF.
              </span>
              <h2 className="font-display mx-auto mt-4 max-w-[760px] text-[clamp(30px,6vw,56px)] font-black leading-[0.95]">
                Stop Guessing.
                <br />
                Start Broadcasting Safely.
              </h2>
              <p className="mx-auto mt-4 max-w-[600px] text-[15px] leading-relaxed text-white/90">
                Check your risk, fix the habit, and go live with a Safety Net behind you.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollToId("risk")}
                  className="rounded-full bg-white px-6 py-3.5 font-black text-black hover:bg-[#25f4ee]"
                >
                  Check Your Risk — Free
                </button>
                <Link
                  href="/command-center"
                  className="rounded-full border-2 border-white/70 px-6 py-3.5 font-bold hover:bg-black/20"
                >
                  Open Studio
                </Link>
              </div>
            </div>
          </div>
          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#262635] pt-6 text-[12px] text-[#a9a9bd]">
            <span className="font-display font-black text-white">
              TIKCAST <span className="text-[#25f4ee]">LIVE</span>
            </span>
            <span>Broadcast safely. Be transparent. Be licensed. Be present. Be proactive.</span>
            <span>TIKCAST is not affiliated with or endorsed by TikTok.</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
