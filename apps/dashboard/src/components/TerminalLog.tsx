"use client";

import { useEffect, useRef } from "react";
import { TerminalSquare } from "lucide-react";

export function TerminalLog({ logs }: { logs: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
      <h3 className="font-bold flex items-center gap-2 mb-3">
        <TerminalSquare size={16} className="text-[var(--cyan)]" /> ENGINE LOG
      </h3>
      <div
        ref={ref}
        className="mono text-[11px] leading-relaxed h-[160px] overflow-y-auto rounded-xl bg-black/40 border border-white/10 p-3 space-y-1"
      >
        {logs.map((line, i) => (
          <div key={`${i}-${line.slice(0, 24)}`} className="text-emerald-300/90">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
