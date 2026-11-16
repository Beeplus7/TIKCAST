import Link from "next/link";

const LAYERS = [
  { n: "01", t: "Hardware Control Room", d: "Playout PC, monitors, Stream Deck, mic, UPS." },
  { n: "02", t: "Ingest Layer", d: "Media QC, tags, guest calls, chat & gifts." },
  { n: "03", t: "Production Layer", d: "OBS scenes, automation brain, overlays." },
  { n: "04", t: "Broadcast Layer", d: "TikTok RTMP 1080×1920 + LIVE API." },
  { n: "05", t: "Content Factory", d: "Auto-clip, caption, republish." },
];

export default function BlueprintPage() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-[var(--muted)] hover:text-white">
        ← Home
      </Link>
      <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight">
        Creator Studio <span className="text-[var(--cyan)]">Blueprint</span>
      </h1>
      <p className="mt-3 text-[var(--muted)] max-w-2xl">
        Five layers. One channel. Signal path: You → TIKCAST Studio → TikTok LIVE → Viewers.
      </p>
      <div className="mt-10 space-y-3">
        {LAYERS.map((l) => (
          <div
            key={l.n}
            className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 flex gap-4"
          >
            <span className="mono text-[var(--red)] font-bold">{l.n}</span>
            <div>
              <h2 className="font-bold text-lg">{l.t}</h2>
              <p className="text-sm text-[var(--muted)] mt-1">{l.d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 mono text-xs text-[var(--muted-2)]">
        Dashboard → API Gateway → OBS / Automation / Safety → TikTok LIVE
      </div>
    </div>
  );
}
