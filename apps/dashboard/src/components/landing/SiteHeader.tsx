"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Radio, X } from "lucide-react";

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "/showcase", label: "Showcase" },
  { href: "/dj-radio", label: "DJ Radio" },
  { href: "/movie-mode", label: "Movie Mode" },
  { href: "/pricing", label: "Pricing" },
  { href: "/why-bans", label: "Why Bans" },
  { href: "/about", label: "About" },
  { href: "/readiness", label: "Readiness" },
  { href: "/command-center", label: "Studio" },
];

type Props = {
  eyebrow?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function SiteHeader({
  eyebrow = "ON AIR • STUDIO",
  ctaHref = "/command-center",
  ctaLabel = "Start Broadcasting",
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#ff2a4d] shadow-[0_0_22px_rgba(255,42,77,.55)]">
            <Radio className="h-5 w-5 text-white" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[17px] tracking-tight">
              TIKCAST <span className="text-[#22e6ff]">LIVE</span>
            </span>
            <span className="mt-1 flex items-center gap-1 text-[10px] font-bold tracking-[.22em] text-[#ff5d73]">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[#ff2a4d]" /> {eyebrow}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-white/70 lg:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`transition hover:text-white ${active ? "text-white" : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full border border-white/20 px-4 py-2 text-sm font-bold sm:block hover:bg-white/5"
          >
            Sign in
          </Link>
          <Link
            href={ctaHref}
            className="rounded-full bg-[#ff2a4d] px-4 py-2.5 text-sm font-bold shadow-[0_0_24px_rgba(255,42,77,.45)] transition hover:bg-[#ff425f] sm:px-5"
          >
            {ctaLabel}
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-black/95 px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-[1360px] flex-col gap-1">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname?.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                    active ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
