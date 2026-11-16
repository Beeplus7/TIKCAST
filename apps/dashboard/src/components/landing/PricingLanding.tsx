"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Clapperboard,
  Infinity as InfinityIcon,
  MousePointerClick,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import { SiteHeader } from "./SiteHeader";

type Billing = "monthly" | "annual";

const plans = [
  {
    id: "Starter",
    name: "STARTER",
    tag: "For your first live",
    annual: 0,
    monthlyLabel: "£0",
    annualLabel: "£0",
    monthlyNote: "forever free",
    annualNote: "forever free",
    cta: "Start Free",
    features: [
      "1 channel",
      "3 scenes",
      "PNG wallpapers only",
      "Manual switching",
      "Basic moderation",
      "Community support",
    ],
    featured: false,
  },
  {
    id: "Creator",
    name: "CREATOR",
    tag: "Look pro, fast",
    annual: 190,
    monthlyLabel: "£19",
    annualLabel: "£190",
    monthlyNote: "/ month",
    annualNote: "/ year",
    cta: "Start Creator",
    features: [
      "Everything in Starter +",
      "Full scheduler",
      "Animated MP4 wallpapers",
      "Split-screen + Reaction",
      "Auto-clipping · 10 / mo",
      "Rights Check: Green / Yellow / Red",
      "DJ Radio Basic",
    ],
    featured: false,
  },
  {
    id: "Studio Pro",
    name: "STUDIO PRO",
    tag: "Run it like a channel",
    annual: 490,
    monthlyLabel: "£49",
    annualLabel: "£490",
    monthlyNote: "/ month",
    annualNote: "/ year",
    cta: "Go Pro",
    features: [
      "Everything in Creator +",
      "24/7 Playout",
      "Full DJ Radio + Movie Mode",
      "Safety Net Dashboard + Health Score",
      "Unlimited auto-clipping",
      "Auto-captions + Auto-posting",
      "3 team seats",
      "Priority support",
    ],
    featured: true,
  },
  {
    id: "Network",
    name: "NETWORK",
    tag: "For multi-channel brands",
    annual: 990,
    monthlyLabel: "£99",
    annualLabel: "£990",
    monthlyNote: "/ month",
    annualNote: "/ year",
    cta: "Go Network",
    features: [
      "Everything in Pro +",
      "5 channels",
      "10 team seats",
      "Multi-channel dashboard",
      "API access",
      "White-label",
      "Failover + Dedicated support",
    ],
    featured: false,
  },
];

const comparison: { label: string; values: string[] }[] = [
  { label: "Channels", values: ["1", "1", "1", "5"] },
  { label: "Scenes", values: ["3", "Unlimited", "Unlimited", "Unlimited"] },
  { label: "Wallpapers", values: ["PNG only", "Animated MP4", "Animated MP4", "Animated MP4"] },
  { label: "Scheduler", values: ["—", "Full scheduler", "Full scheduler", "Full scheduler"] },
  { label: "DJ Radio", values: ["—", "Basic", "Full", "Full"] },
  { label: "Movie Mode", values: ["—", "—", "Included", "Included"] },
  { label: "Safety Net", values: ["—", "Rights Check", "Dashboard + Health Score", "Dashboard + Health Score"] },
  { label: "Auto-clipping", values: ["—", "10 / month", "Unlimited", "Unlimited"] },
  { label: "Team seats", values: ["1", "1", "3", "10"] },
  { label: "Support", values: ["Community", "Community", "Priority", "Dedicated"] },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Your plan stays active until the end of the billing period, then moves back to Starter. There are no cancellation fees and no lock-in.",
  },
  {
    q: "Do I need OBS?",
    a: "No. TIKCAST LIVE is built as an all-in-one studio. You can design scenes, switch layouts, run wallpapers, and manage audio without adding another broadcast tool.",
  },
  {
    q: "Will TIKCAST guarantee no ban?",
    a: "No platform can guarantee that. What paid plans give you is Safety Net: Rights Check signals, a live Health Score, and clearer warnings before a risky clip, track, or format goes live.",
  },
  {
    q: "Can I switch tiers?",
    a: "Yes. Upgrade or downgrade whenever your channel changes. Upgrades apply right away; downgrades apply at the next billing cycle.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Yes. Try Studio Pro free for 7 days. No card is needed to start the trial, and you can cancel in one click.",
  },
];

const whyPro = [
  {
    icon: ShieldCheck,
    title: "Safety Net alone saves your account",
    text: "Catch risky content before it goes live. Clear signals, a live Health Score, and a dashboard built to protect the channel you worked for.",
    accent: "#ff2d55",
  },
  {
    icon: Clapperboard,
    title: "MP4 wallpapers = a pro look",
    text: "Animated scenes make a first-time viewer stop, stay, and follow. It is the difference between a webcam feed and a real show.",
    accent: "#22e6ff",
  },
  {
    icon: Timer,
    title: "24/7 Playout = earn while you sleep",
    text: "Keep your channel live around the clock. Schedule shows, DJ Radio, and Movie Mode — even when you are offline.",
    accent: "#ffd166",
  },
];

export function PricingLanding() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [selected, setSelected] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState(0);

  function scrollToPricing() {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#07090f] text-[#f8fafc]">
      <SiteHeader eyebrow="PRICING · PLANS" ctaLabel="Start Free" ctaHref="/command-center" />

      <main id="top" className="relative overflow-x-clip">
        {/* HERO */}
        <section className="relative">
          <div className="grid-bg absolute inset-0" aria-hidden="true" />
          <div
            className="absolute left-1/2 top-0 h-[420px] w-[min(900px,95vw)] -translate-x-1/2 rounded-full bg-[#ff2d55] opacity-[.16] blur-[120px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-[1280px] px-4 pb-12 pt-12 text-center sm:px-6 sm:pt-20 lg:px-8">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold tracking-[.16em] text-[#6cf7ff] sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" /> START FREE · UPGRADE WHEN YOUR CHANNEL GROWS
            </div>
            <h1 className="font-display mx-auto mt-6 max-w-[980px] text-[clamp(2.35rem,7.2vw,5.4rem)] font-black leading-[.92] tracking-[-.04em]">
              PRICING THAT GROWS
              <br />
              <span className="text-gradient">WITH YOUR CHANNEL.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[680px] text-base leading-relaxed text-[#aab3c5] sm:text-lg">
              No hidden fees. Cancel anytime. Safety Net included on paid plans.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3">
              <div
                className="relative flex rounded-full border border-white/15 bg-black/40 p-1.5"
                role="group"
                aria-label="Billing period"
              >
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition sm:px-7 ${
                    billing === "monthly" ? "bg-white text-black shadow" : "text-[#aab3c5] hover:text-white"
                  }`}
                  aria-pressed={billing === "monthly"}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("annual")}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition sm:px-7 ${
                    billing === "annual" ? "bg-white text-black shadow" : "text-[#aab3c5] hover:text-white"
                  }`}
                  aria-pressed={billing === "annual"}
                >
                  Annual
                </button>
              </div>
              <p className="text-sm text-[#aab3c5]">
                Annual billing: <strong className="text-[#6cf7ff]">2 months free</strong> on Creator, Pro &amp;
                Network ·{" "}
                <span className="text-white">You save £{billing === "annual" ? "98" : "0"} on Pro</span>
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 text-left sm:grid-cols-4">
              {(
                [
                  [Zap, "Set up in minutes"],
                  [ShieldCheck, "Safety Net built in"],
                  [Radio, "DJ Radio + Movie Mode"],
                  [BadgeCheck, "No card for free trial"],
                ] as const
              ).map(([Icon, t]) => (
                <div
                  key={t}
                  className="glass flex items-center gap-2 rounded-2xl px-3 py-3 text-xs font-semibold sm:text-sm"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#22e6ff]" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANS */}
        <section id="pricing" className="mx-auto max-w-[1280px] scroll-mt-24 px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[.22em] text-[#ff2d55]">CHOOSE YOUR STAGE</p>
              <h2 className="font-display mt-2 text-3xl font-black sm:text-4xl">Pick the plan that fits today.</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#aab3c5]">
              Start free. Upgrade when the audience, schedule, or team grows.
            </p>
          </div>

          {selected && (
            <div
              className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#22e6ff]/40 bg-[#22e6ff]/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              role="status"
            >
              <p>
                <strong>{selected}</strong> selected —{" "}
                {billing === "annual" ? "annual billing, 2 months free." : "monthly billing, cancel anytime."}{" "}
                <span className="text-[#aab3c5]">This is your starting point; you can change tiers later.</span>
              </p>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 rounded-full border border-white/25 px-4 py-2 text-sm font-bold"
              >
                Clear selection
              </button>
            </div>
          )}

          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex flex-col overflow-hidden rounded-[26px] p-5 pt-6 sm:p-6 ${
                  plan.featured
                    ? "glass pro-glow bg-gradient-to-b from-[#25101f] to-[#0c101b] xl:-translate-y-3 xl:scale-[1.02]"
                    : "glass"
                }`}
              >
                {plan.featured && (
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#22e6ff] px-2.5 py-1 text-[10px] font-black tracking-wider text-black">
                    <Star className="h-3 w-3 fill-black" /> MOST POPULAR
                  </div>
                )}
                <p
                  className={`text-xs font-black tracking-[.2em] ${
                    plan.featured ? "text-[#6cf7ff]" : "text-[#aab3c5]"
                  }`}
                >
                  {plan.name}
                </p>
                <p className="mt-2 text-sm text-[#aab3c5]">{plan.tag}</p>
                <div className="mt-6 flex items-end gap-1.5">
                  <span className="font-display text-[clamp(2.6rem,5vw,3.5rem)] font-black leading-none tracking-tight">
                    {billing === "monthly" ? plan.monthlyLabel : plan.annualLabel}
                  </span>
                  <span className="pb-1.5 text-sm font-medium text-[#aab3c5]">
                    {billing === "monthly" ? plan.monthlyNote : plan.annualNote}
                  </span>
                </div>
                {plan.id !== "Starter" && (
                  <p className="mt-2 text-xs text-[#aab3c5]">
                    {billing === "annual"
                      ? `Billed once a year · £${Math.round(plan.annual / 12)} / mo equivalent`
                      : "Billed monthly · switch to annual to save"}
                  </p>
                )}
                <div className="my-5 h-px bg-white/10" />
                <ul className="flex-1 space-y-2.5 text-sm leading-snug text-[#d7ddec]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          plan.featured ? "text-[#22e6ff]" : "text-[#ff2d55]"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setSelected(plan.id)}
                  className={`mt-6 w-full rounded-full py-3.5 text-sm font-black transition ${
                    plan.featured
                      ? "bg-[#ff2d55] text-white shadow-[0_12px_35px_rgba(255,45,85,.45)] hover:bg-[#ff4d6e]"
                      : selected === plan.id
                        ? "bg-[#22e6ff] text-black"
                        : "border border-white/20 bg-white/5 hover:bg-white hover:text-black"
                  }`}
                  aria-pressed={selected === plan.id}
                >
                  {selected === plan.id ? `✓ Selected — ${plan.cta}` : plan.cta}
                </button>
                {plan.featured && (
                  <p className="mt-3 text-center text-[11px] text-[#aab3c5]">7-day Pro trial · No card needed</p>
                )}
                {selected === plan.id && (
                  <Link
                    href="/command-center"
                    className="mt-3 block text-center text-sm font-bold text-[#6cf7ff] hover:text-white"
                  >
                    Continue to Studio →
                  </Link>
                )}
              </article>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-[#aab3c5]">
            Prices in GBP. Annual plans are billed once per year. Creator, Pro and Network include 2 months free on
            annual billing.
          </p>
        </section>

        {/* COMPARISON */}
        <section className="border-y border-white/10 bg-[#090c14] py-16">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[.22em] text-[#22e6ff]">SIDE BY SIDE</p>
                <h2 className="font-display mt-2 text-3xl font-black sm:text-4xl">Compare every plan.</h2>
              </div>
              <p className="max-w-sm text-sm text-[#aab3c5]">
                Find the exact point where free stops — and your show levels up.
              </p>
            </div>
            <div className="compare-scroll overflow-x-auto rounded-3xl border border-white/10 bg-[#07090f]">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-4 font-semibold text-[#aab3c5] sm:px-5">Feature</th>
                    {plans.map((p) => (
                      <th
                        key={p.id}
                        className={`px-3 py-4 text-center sm:px-4 ${
                          p.featured ? "bg-[#22e6ff]/10 text-[#6cf7ff]" : ""
                        }`}
                      >
                        <span className="block text-xs font-black tracking-wider sm:text-sm">{p.name}</span>
                        {p.featured && (
                          <span className="mt-1 inline-block rounded-full bg-[#22e6ff] px-2 py-0.5 text-[9px] font-black text-black">
                            MOST POPULAR
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.label} className="border-b border-white/5 last:border-0 hover:bg-white/[.02]">
                      <th className="px-4 py-3.5 font-medium text-[#d7ddec] sm:px-5">{row.label}</th>
                      {row.values.map((v, i) => (
                        <td
                          key={`${row.label}-${i}`}
                          className={`px-3 py-3.5 text-center text-[#aab3c5] sm:px-4 ${
                            i === 2 ? "bg-[#22e6ff]/[0.05] font-semibold text-white" : ""
                          }`}
                        >
                          {v === "—" ? <span className="opacity-35">—</span> : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[#aab3c5] sm:hidden">Swipe sideways to compare all four plans.</p>
          </div>
        </section>

        {/* WHY PRO */}
        <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[.22em] text-[#ff2d55]">WHY PRO IS WORTH IT</p>
            <h2 className="font-display mt-2 text-3xl font-black leading-tight sm:text-4xl">
              One upgrade. Three ways your channel gets stronger.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {whyPro.map((item) => (
              <article
                key={item.title}
                className="glass group rounded-[26px] p-6 transition hover:-translate-y-1"
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-2xl"
                  style={{ background: `${item.accent}1f`, color: item.accent }}
                >
                  <item.icon className="h-6 w-6" />
                </span>
                <h3 className="font-display mt-5 text-xl font-extrabold leading-snug">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#aab3c5]">{item.text}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelected("Studio Pro");
                    scrollToPricing();
                  }}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-bold"
                  style={{ color: item.accent }}
                >
                  Included in Studio Pro <ArrowRight className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-4 rounded-[26px] border border-[#ff2d55]/30 bg-gradient-to-r from-[rgba(255,45,85,.14)] via-[#11131f] to-[rgba(34,230,255,.12)] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
            <div>
              <p className="text-xs font-black tracking-[.2em] text-[#6cf7ff]">
                7-DAY PRO TRIAL · NO CARD NEEDED · CANCEL IN 1 CLICK
              </p>
              <h3 className="font-display mt-2 text-2xl font-black sm:text-3xl">
                Try the full studio. Keep the free plan if it’s not for you.
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected("Studio Pro");
                scrollToPricing();
              }}
              className="rounded-full bg-white px-6 py-3.5 font-black text-black transition hover:bg-[#6cf7ff]"
            >
              Start 7-Day Pro Trial
            </button>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-[900px] px-4 pb-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold tracking-[.22em] text-[#22e6ff]">QUESTIONS</p>
            <h2 className="font-display mt-2 text-3xl font-black sm:text-4xl">Everything else, answered.</h2>
          </div>
          <div className="mt-8 space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  className={`overflow-hidden rounded-2xl border transition ${
                    open ? "border-[#22e6ff]/40 bg-white/[.06]" : "border-white/10 bg-white/[.03]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold sm:px-6 sm:py-5"
                    aria-expanded={open}
                  >
                    <span>{f.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#22e6ff] transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <p className="px-5 pb-5 text-sm leading-relaxed text-[#aab3c5] sm:px-6 sm:text-[15px]">{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden border-t border-white/10">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,45,85,.28),transparent_55%),radial-gradient(circle_at_85%_0%,rgba(34,230,255,.18),transparent_45%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-[900px] px-4 py-16 text-center sm:py-24">
            <Play className="mx-auto h-10 w-10 fill-[#ff2d55] text-[#ff2d55]" />
            <h2 className="font-display mt-5 text-[clamp(2.1rem,6vw,4.2rem)] font-black leading-[.95] tracking-tight">
              START FREE.
              <br />
              <span className="text-gradient">GO PRO WHEN YOU’RE READY.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#aab3c5]">
              Build your first show today. Your audience, schedule, and studio can grow from there.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/command-center"
                className="w-full rounded-full bg-[#ff2d55] px-8 py-4 text-center font-black shadow-[0_16px_45px_rgba(255,45,85,.4)] hover:bg-[#ff4d6e] sm:w-auto"
              >
                Start Free
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSelected("Studio Pro");
                  scrollToPricing();
                }}
                className="w-full rounded-full border border-white/25 bg-white/5 px-8 py-4 font-black hover:bg-white hover:text-black sm:w-auto"
              >
                Try Pro Free for 7 Days
              </button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#aab3c5]">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <MousePointerClick className="h-3.5 w-3.5" /> Cancel in 1 click
              </span>
              <span className="flex items-center gap-1.5">
                <InfinityIcon className="h-3.5 w-3.5" /> Free plan forever
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#05070c]">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#ff2d55]">
                <Radio className="h-4 w-4 text-white" />
              </span>
              <span className="font-display text-lg font-black">
                TIKCAST <span className="text-[#ff2d55]">LIVE</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#aab3c5]">
              A broadcast studio that grows with your channel — from your first live to a 24/7 network.
            </p>
          </div>
          <nav aria-label="Studio">
            <h3 className="text-sm font-bold tracking-wider text-white">Studio</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#aab3c5]">
              <li>
                <Link href="/features" className="hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/command-center" className="hover:text-white">
                  Command Center
                </Link>
              </li>
              <li>
                <Link href="/showcase" className="hover:text-white">
                  Showcase
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Broadcast">
            <h3 className="text-sm font-bold tracking-wider text-white">Broadcast</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#aab3c5]">
              <li>
                <Link href="/features#dj" className="hover:text-white">
                  DJ Radio
                </Link>
              </li>
              <li>
                <Link href="/features#safety" className="hover:text-white">
                  Safety Net
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h3 className="text-sm font-bold tracking-wider text-white">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#aab3c5]">
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/command-center" className="hover:text-white">
                  Start Free
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-5 text-xs text-[#aab3c5] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <span>© {new Date().getFullYear()} TIKCAST LIVE. All rights reserved.</span>
            <span>No hidden fees. Cancel anytime.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
