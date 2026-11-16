"use client";

import { ShieldCheck, ShieldAlert } from "lucide-react";

export function HealthScoreDial({ score }: { score: number }) {
  const color = score >= 75 ? "#2bff88" : score >= 50 ? "#ffcb1f" : "#ff2b3d";
  const label = score >= 75 ? "SAFE" : score >= 50 ? "WATCH" : "AT RISK";
  const Icon = score >= 50 ? ShieldCheck : ShieldAlert;
  const offset = 125.6 * (1 - score / 100);

  return (
    <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--line)] rounded-2xl px-3 py-2">
      <div className="relative w-[46px] h-[46px] shrink-0">
        <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#1e2a36" strokeWidth="5" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="125.6"
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-[13px]">
          {score}
        </span>
      </div>
      <div className="leading-tight">
        <p className="text-[10px] text-[var(--muted)] tracking-widest">HEALTH SCORE</p>
        <p className="font-bold text-[13px] flex items-center gap-1" style={{ color }}>
          <Icon size={13} /> {label}
        </p>
      </div>
    </div>
  );
}
