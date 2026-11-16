import React, { useEffect, useState } from "react";
import { Activity, AudioWaveform, Ban, CalendarClock, CheckCircle2, ChevronRight, Clapperboard, Clapperboard as MovieIcon, Cpu, Flame, Gift, HeartPulse, Layers, MonitorPlay, Music2, Play, Radio, RotateCcw, Scissors, ShieldCheck, Siren, Sparkles, UploadCloud, Zap } from "lucide-react";

const steps = [
  { n: "01", icon: UploadCloud, title: "Upload / Import", text: "Drop in clips, shows, music & promos. Build a library in minutes.", tone: "#22e6ff" },
  { n: "02", icon: ShieldCheck, title: "Rights Check", text: "Instant scan. Green means go. Yellow means review. Red means swap it.", tone: "#2eff8f" },
  { n: "03", icon: CalendarClock, title: "Schedule", text: "Drag your week into place. Fill every slot — even while you sleep.", tone: "#ffc247" },
  { n: "04", icon: Radio, title: "Go Live via RTMP", text: "One stream key. One click. Your channel is on air everywhere.", tone: "#ff2a4d" },
  { n: "05", icon: Scissors, title: "Auto-Clip + Repost", text: "Highlights cut themselves. Repost to grow while you broadcast.", tone: "#a678ff" },
];

const features = [
  { n: "01", icon: MonitorPlay, title: "Playout Engine", text: "24/7 automated playout. No dead air. No awkward gaps. Just a channel that never sleeps.", tag: "ALWAYS ON" },
  { n: "02", icon: Layers, title: "Multi-Screen", text: "Split-screen hosts, guests, gameplay, reactions — up to 8 scene layouts in one tap.", tag: "8 LAYOUTS" },
  { n: "03", icon: AudioWaveform, title: "DJ Radio Mode", text: "Audio-only shows with animated wallpaper. Keep the vibe alive without being on camera.", tag: "AUDIO FIRST" },
  { n: "04", icon: Clapperboard, title: "Movie Mode", text: "Turn long-form video into a cinema night. Curtains, countdowns, intermissions and all.", tag: "CINEMA" },
  { n: "05", icon: Sparkles, title: "Wallpaper System MP4", text: "Looping animated backgrounds that make every scene look designed, not improvised.", tag: "MOTION" },
  { n: "06", icon: ShieldCheck, title: "Safety Net Dashboard", text: "Live health score, keyword filters, kill switch and rights alerts — before TikTok notices.", tag: "PROTECTED" },
];

const banReasons = ["Copyrighted music", "Repeated content", "Misleading claims", "Unsafe challenges", "Spam behaviour", "Restricted goods", "Harassment", "Policy strikes"];
const protections = [
  { icon: ShieldCheck, title: "Keyword Filter", text: "Block risky words in titles, chat and captions before they publish." },
  { icon: Siren, title: "Flag / Suspend", text: "Pause one scene instantly without killing the whole broadcast." },
  { icon: Zap, title: "Kill Switch", text: "Cut to a safe wallpaper + music loop in under a second." },
  { icon: CheckCircle2, title: "Rights Check", text: "Music and clip checks with clear green, yellow and red signals." },
];

function Waveform({ color = "#22e6ff" }: { color?: string }) {
  return <div className="flex h-12 items-end gap-[5px]" aria-hidden="true">{[28, 52, 88, 42, 96, 62, 34, 78, 58, 92, 40, 68, 48, 84, 36, 72, 56, 96, 44, 66].map((h, i) => <span key={i} className="wave-bar w-[5px] rounded-full" style={{ height: `${h}%`, background: color, animationDelay: `${i * 0.08}s` }} />)}</div>;
}

function App() {
  const [scene, setScene] = useState("Split Screen");
  const [playing, setPlaying] = useState(true);
  const [health, setHealth] = useState(92);
  const [demoNote, setDemoNote] = useState("");
  const [chat, setChat] = useState("Maya: THIS SETUP IS INSANE 🔥 • Jordan: best channel on TikTok • Leo: play the next track • Aisha: love this show •");

  useEffect(() => {
    const t = setInterval(() => setHealth(h => Math.max(88, Math.min(96, h + (Math.random() > .5 ? 1 : -1)))), 2600);
    return () => clearInterval(t);
  }, []);

  const scenes = ["Split Screen", "Solo Host", "DJ Booth", "Movie Night"];

  return (
    <div data-safe-area-inset-root style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)", minHeight: "100vh", background: "var(--bg)" }} className="overflow-x-clip text-[var(--text)]">
      {/* ambient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-[8%] h-72 w-72 rounded-full bg-[#ff2a4d]/25 blur-[110px]" />
        <div className="absolute top-[42%] right-[-80px] h-96 w-96 rounded-full bg-[#22e6ff]/15 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[35%] h-64 w-64 rounded-full bg-[#7b4dff]/20 blur-[110px]" />
      </div>

      {/* NAV */}
      <header data-safe-area-sticky-top style={{ top: "var(--safe-area-inset-top)" }} className="sticky z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ff2a4d] font-display text-lg shadow-[0_0_22px_rgba(255,42,77,.55)]">T</span>
            <span className="leading-none"><span className="block font-display text-[17px] tracking-tight">TIKCAST <span className="text-[#22e6ff]">LIVE</span></span><span className="mt-1 flex items-center gap-1 text-[10px] font-bold tracking-[.22em] text-[#ff5d73]"><span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[#ff2a4d]" /> ON AIR • STUDIO</span></span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-white/70 lg:flex">
            <a className="hover:text-white" href="#studio">Studio</a><a className="hover:text-white" href="#dj-movie">DJ Radio</a><a className="hover:text-white" href="#safety">Safety</a><a className="hover:text-white" href="#pricing">Pricing</a><a className="hover:text-white" href="#ban">Why No Ban</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#pricing" className="hidden rounded-full border border-white/20 px-4 py-2 text-sm font-bold sm:block">Sign in</a>
            <a href="#final" className="rounded-full bg-[#ff2a4d] px-4 py-2.5 text-sm font-bold shadow-[0_0_24px_rgba(255,42,77,.45)] transition hover:bg-[#ff425f] sm:px-5">Start Broadcasting Free</a>
          </div>
        </div>
      </header>

      <main id="top" className="relative z-10">
        {/* HERO */}
        <section className="mx-auto max-w-[1280px] px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold tracking-[.18em]"><span className="text-[#ffc247]">★</span> THE BROADCAST STUDIO FOR TIKTOK <span className="rounded-full bg-[#22e6ff] px-2 py-0.5 text-black">NEW</span></div>
              <h1 className="mt-5 font-display text-[clamp(2.8rem,8vw,5.7rem)] leading-[.86] tracking-tight">RUN TIKTOK<br /><span className="text-[#ff2a4d]">LIKE A TV</span><br /><span className="text-outline">CHANNEL.</span></h1>
              <p className="mt-5 max-w-[560px] text-base leading-relaxed text-white/70 sm:text-lg">Playout. Split-Screen. DJ Radio. Movie Mode. Safety Net. <span className="text-white">All in one studio.</span></p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#pricing" className="inline-flex items-center gap-2 rounded-full bg-[#ff2a4d] px-6 py-3.5 font-bold shadow-[0_12px_35px_rgba(255,42,77,.35)]">Start Free <ChevronRight size={18} /></a>
                <button onClick={() => { setPlaying(v => !v); setDemoNote(playing ? "Demo preview paused — tap again to resume the live mock." : "Demo preview is live — this is the control-room experience."); }} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3.5 font-bold"><span className="grid h-6 w-6 place-items-center rounded-full bg-white text-black">{playing ? "❚❚" : <Play size={13} fill="currentColor" />}</span> {playing ? "Pause Demo" : "Watch Demo"}</button>
              </div>
              {demoNote && <p role="status" className="mt-3 max-w-[520px] rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">{demoNote}</p>}
              <div className="mt-8 grid max-w-[560px] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/10 sm:grid-cols-4">
                {[["24/7", "Playout"], ["8", "Scene Layouts"], ["100", "Health Score"], ["0", "Bans"]].map(([v, l]) => <div key={l} className="bg-[#0c0d12] px-3 py-4 text-center"><div className="font-display text-xl text-white sm:text-2xl">{v}</div><div className="mt-1 text-[10px] font-bold tracking-wider text-white/50 uppercase">{l}</div></div>)}
              </div>
              <div className="mt-5 flex items-center gap-3 text-xs text-white/55"><span className="flex -space-x-2"><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-black bg-[#ff2a4d]">🎙️</span><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-black bg-[#22e6ff] text-black">🎧</span><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-black bg-[#ffc247] text-black">🎬</span></span> Built for creators, DJs, hosts &amp; movie nights.</div>
            </div>

            {/* CONTROL ROOM */}
            <div id="studio" className="relative pb-4 pr-1 sm:pr-6">
              <div className="glass relative overflow-hidden rounded-[24px] p-3 shadow-[0_30px_90px_rgba(0,0,0,.55)]">
                <div className="flex items-center justify-between px-2 py-1"><div className="flex items-center gap-2 text-xs font-bold"><span className="flex gap-1"><i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" /></span> TIKCAST STUDIO</div><span className="rounded-full bg-[#ff2a4d] px-2 py-1 text-[10px] font-black tracking-widest">● ON AIR</span></div>
                <div className="hero-gradient relative mt-2 overflow-hidden rounded-2xl p-[2px]">
                  <div className="relative overflow-hidden rounded-2xl bg-[#0a0b12]">
                    <div className="grid grid-cols-2">
                      <div className="relative min-h-[150px] bg-gradient-to-br from-[#ff2a4d] via-[#7b2f6d] to-[#171126] p-3 sm:min-h-[176px]"><span className="absolute top-2 left-2 rounded bg-black/55 px-2 py-1 text-[10px] font-bold">HOST • YOU</span><div className="absolute bottom-8 left-3 h-14 w-14 rounded-full bg-[#ffd2d9] shadow-xl sm:h-16 sm:w-16"><span className="absolute top-5 left-3 text-lg">👀</span><span className="absolute top-5 right-3 text-lg">👀</span><span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-lg">😀</span></div><div className="absolute right-3 bottom-3 text-3xl">🎙️</div></div>
                      <div className="relative min-h-[150px] bg-gradient-to-br from-[#00c2ff] via-[#163a78] to-[#061225] p-3 sm:min-h-[176px]"><span className="absolute top-2 left-2 rounded bg-black/55 px-2 py-1 text-[10px] font-bold">VIDEO • CLIP 04</span><div className="absolute inset-0 grid place-items-center"><button onClick={() => setPlaying(v => !v)} aria-label={playing ? "Pause preview" : "Play preview"} className="grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-xl">{playing ? "❚❚" : <Play fill="currentColor" />}</button></div><span className="absolute right-3 bottom-3 rounded bg-black/60 px-2 py-1 text-[10px]">04:12 / 08:40</span></div>
                    </div>
                    <div className="flex items-center justify-between bg-black/70 px-3 py-2"><div><p className="text-[10px] font-bold tracking-[.2em] text-[#22e6ff]">TIKCAST LIVE</p><p className="font-display text-sm sm:text-base">MORNING SHOW • EP. 214</p></div><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-black">LIVE • 12.4K</span></div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2"><div className="flex flex-wrap gap-1.5">{scenes.map(s => <button key={s} onClick={() => setScene(s)} className={`rounded-full px-3 py-2 text-[11px] font-bold transition ${scene === s ? "bg-white text-black" : "border border-white/15 bg-white/5 hover:bg-white/10"}`}>{s}</button>)}</div><span className="hidden shrink-0 rounded-full bg-[#2eff8f]/15 px-2 py-1 text-[10px] font-bold text-[#2eff8f] sm:block">SCENE: {scene.toUpperCase()}</span></div>
                <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/40"><div className="ticker-track flex w-max whitespace-nowrap py-2 text-xs font-semibold text-white/80"><span className="pr-8">{chat}</span><span className="pr-8">{chat}</span></div></div>
              </div>
              <div className="floaty absolute -top-3 -left-1 z-10 rounded-2xl border border-[#2eff8f]/30 bg-[#07130d]/95 px-3 py-2 shadow-xl sm:-left-4"><p className="flex items-center gap-1 text-[10px] font-bold text-[#2eff8f]"><HeartPulse size={13} /> HEALTH SCORE {health}</p><p className="font-display text-sm">SAFE TO BROADCAST</p></div>
              <div className="floaty-2 absolute top-[42%] -right-1 z-10 rounded-2xl border border-white/20 bg-[#0c0d12]/95 px-3 py-2 shadow-xl sm:right-[-18px]"><p className="text-[10px] font-bold text-[#22e6ff]">NOW PLAYING</p><p className="text-sm font-bold">Morning Show ☀️</p></div>
              <div className="floaty-3 gift-pop absolute -bottom-1 right-5 z-10 flex items-center gap-2 rounded-2xl bg-[#ff2a4d] px-3 py-2 shadow-[0_0_30px_rgba(255,42,77,.5)]"><Gift size={18} /><div><p className="text-[10px] font-bold">GIFT ALERT</p><p className="font-display text-sm">+500 🔥</p></div></div>
            </div>
          </div>
        </section>

        {/* INFOGRAPHIC STRIP */}
        <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black tracking-[.25em] text-[#22e6ff]">THE TIKCAST WORKFLOW</p><h2 className="mt-2 font-display text-3xl leading-none sm:text-5xl">FROM IDEA<br />TO <span className="text-[#ff2a4d]">ON AIR.</span></h2></div><p className="max-w-[360px] text-sm leading-relaxed text-white/60">Five moves. One studio. A channel that runs like television — without the television budget.</p></div>
          <div className="relative rounded-[28px] border border-white/10 bg-[#0b0c12] p-4 sm:p-7">
            <div className="absolute top-[58px] right-[8%] left-[8%] hidden h-[2px] bg-gradient-to-r from-[#22e6ff] via-[#ffc247] to-[#ff2a4d] lg:block" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
              {steps.map((s, i) => <article key={s.title} className="relative rounded-2xl border border-white/10 bg-[#12131b] p-4 transition hover:-translate-y-1 hover:border-white/25"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: `${s.tone}22`, color: s.tone, border: `1px solid ${s.tone}55` }}><s.icon size={22} /></span><span className="font-display text-2xl text-white/15">{s.n}</span></div><h3 className="mt-5 font-display text-base leading-tight">{s.title}</h3><p className="mt-2 text-sm leading-relaxed text-white/60">{s.text}</p>{i === 1 && <div className="mt-3 flex gap-1"><span className="rounded bg-[#2eff8f] px-2 py-1 text-[10px] font-black text-black">GREEN</span><span className="rounded bg-[#ffc247] px-2 py-1 text-[10px] font-black text-black">YELLOW</span><span className="rounded bg-[#ff2a4d] px-2 py-1 text-[10px] font-black text-white">RED</span></div>}{i < 4 && <span className="absolute top-1/2 -right-2 z-10 hidden h-6 w-6 place-items-center rounded-full bg-[#ff2a4d] text-xs lg:grid">→</span>}</article>)}
            </div>
          </div>
        </section>

        {/* FEATURE GRID */}
        <section className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mb-7 text-center"><p className="text-xs font-black tracking-[.25em] text-[#ff2a4d]">ONE STUDIO • SIX SUPERPOWERS</p><h2 className="mx-auto mt-2 max-w-[820px] font-display text-3xl leading-[.95] sm:text-5xl">EVERYTHING A TV STATION HAS. <span className="text-[#22e6ff]">IN YOUR POCKET.</span></h2></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(f => <article key={f.n} className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0d0e15] p-5 transition hover:border-[#22e6ff]/40"><span className="absolute -top-4 right-3 font-display text-[92px] leading-none text-white/[.045]">{f.n}</span><span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-2 py-1 text-[10px] font-black tracking-widest text-[#22e6ff]"><f.icon size={13} /> {f.tag}</span><h3 className="mt-8 font-display text-2xl">{f.title}</h3><p className="mt-2 text-sm leading-relaxed text-white/60">{f.text}</p><div className="mt-5 flex items-center gap-1 text-sm font-bold text-white/70">Explore mode <ChevronRight size={16} className="transition group-hover:translate-x-1" /></div></article>)}
          </div>
        </section>

        {/* DJ vs MOVIE */}
        <section id="dj-movie" className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><h2 className="font-display text-3xl leading-none sm:text-5xl">PICK YOUR <span className="text-[#22e6ff]">VIBE.</span></h2><p className="max-w-[380px] text-sm text-white/60">Two moods. One channel. Switch the whole atmosphere without stopping the show.</p></div>
          <div className="grid overflow-hidden rounded-[28px] border border-white/12 md:grid-cols-2">
            <div className="relative min-h-[340px] overflow-hidden bg-gradient-to-br from-[#ff2a4d] via-[#5c1668] to-[#060318] p-6 sm:p-8"><span className="rounded-full bg-black/35 px-3 py-1 text-[11px] font-black tracking-widest">DJ RADIO MODE</span><h3 className="mt-24 font-display text-4xl leading-[.9] sm:text-5xl">TURN UP<br />THE NIGHT.</h3><p className="mt-3 max-w-[360px] text-sm text-white/80">Audio-only sets, live shout-outs and animated wallpaper that moves with the music.</p><div className="mt-6"><Waveform color="#ffc247" /></div><span className="absolute top-5 right-6 text-5xl">🎧</span></div>
            <div className="relative min-h-[340px] overflow-hidden bg-gradient-to-br from-[#071a36] via-[#102c56] to-[#020308] p-6 sm:p-8"><span className="rounded-full bg-black/35 px-3 py-1 text-[11px] font-black tracking-widest">MOVIE MODE</span><h3 className="mt-24 font-display text-4xl leading-[.9] sm:text-5xl">LIGHTS<br />DOWN.</h3><p className="mt-3 max-w-[360px] text-sm text-white/80">Cinema curtain, countdown, intermission cards and a community watching together.</p><button onClick={() => setPlaying(v => !v)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-bold text-black"><Play size={16} fill="currentColor" /> {playing ? "Pause Movie Night" : "Start Movie Night"}</button><span className="absolute top-5 right-6 text-5xl">🎬</span></div>
          </div>
        </section>

        {/* SAFETY */}
        <section id="safety" className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0b11] lg:grid-cols-[.9fr_1.1fr]">
            <div className="relative flex flex-col items-center justify-center border-b border-white/10 p-7 text-center lg:border-r lg:border-b-0">
              <p className="text-xs font-black tracking-[.25em] text-[#2eff8f]">SAFETY NET • LIVE HEALTH</p>
              <div className="relative mt-6 h-48 w-48"><div className="absolute inset-0 rounded-full border-[16px] border-white/10" /><div className="absolute inset-0 rounded-full border-[16px] border-transparent border-t-[#2eff8f] border-r-[#2eff8f] rotate-45" /><div className="absolute inset-0 grid place-items-center"><div><div className="font-display text-6xl">{health}<span className="text-2xl text-white/40">/100</span></div><p className="mt-1 font-black tracking-widest text-[#2eff8f]">● SAFE</p></div></div></div>
              <p className="mt-5 max-w-[330px] text-sm leading-relaxed text-white/60">Your broadcast is checked in real time. If risk rises, TikCast warns you <span className="text-white">before</span> it becomes a problem.</p>
              <div className="mt-5 grid w-full grid-cols-2 gap-2 text-left"><div className="rounded-xl bg-[#ff2a4d]/10 p-3"><p className="text-xs font-black text-[#ff5d73]">⚠ WITHOUT TIKCAST</p><p className="mt-1 text-sm">Surprise strikes. No warning.</p></div><div className="rounded-xl bg-[#2eff8f]/10 p-3"><p className="text-xs font-black text-[#2eff8f]">✓ WITH TIKCAST</p><p className="mt-1 text-sm">Early alerts. Safer choices.</p></div></div>
            </div>
            <div className="p-6 sm:p-8"><h2 className="font-display text-3xl leading-none sm:text-4xl">PROTECTION IS<br />PART OF THE SHOW.</h2><div className="mt-6 space-y-3">{protections.map(p => <div key={p.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#22e6ff]/10 text-[#22e6ff]"><p.icon size={20} /></span><div><h3 className="font-bold">{p.title}</h3><p className="mt-1 text-sm leading-relaxed text-white/60">{p.text}</p></div></div>)}</div></div>
          </div>
        </section>

        {/* BAN REASONS */}
        <section id="ban" className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-[#ff2a4d]/25 bg-gradient-to-br from-[#1a0710] to-[#0a0b11] p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-black tracking-[.25em] text-[#ff5d73]"><Ban size={16} /> KNOW THE RISK</p><h2 className="mt-2 font-display text-3xl leading-none sm:text-4xl">8 REASONS TIKTOK BANS.<br /><span className="text-[#2eff8f]">ONE SYSTEM THAT HELPS YOU AVOID THEM.</span></h2></div><div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-black"><ShieldCheck size={17} /> CHECKED BEFORE YOU GO LIVE</div></div>
            <div className="mt-6 flex flex-wrap gap-2">{banReasons.map((b, i) => <span key={b} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#ff2a4d] text-[11px] font-black">{i + 1}</span> {b}</span>)}</div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mb-7 text-center"><p className="text-xs font-black tracking-[.25em] text-[#22e6ff]">PRICING TEASER</p><h2 className="mt-2 font-display text-4xl sm:text-5xl">START SMALL. <span className="text-[#ff2a4d]">GO NETWORK.</span></h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[{ name: "Creator", price: "£19", blurb: "For your first channel.", feats: ["1 live channel", "3 scene layouts", "Rights Check", "Auto-clips"] }, { name: "Studio Pro", price: "£49", blurb: "For serious broadcasters.", feats: ["3 live channels", "All 8 layouts", "DJ + Movie Mode", "Full Safety Net"], popular: true }, { name: "Network", price: "£99", blurb: "For teams & stations.", feats: ["Unlimited channels", "Team controls", "Advanced scheduling", "Priority support"] }].map(p => <article key={p.name} className={`relative rounded-[26px] border p-6 ${p.popular ? "border-[#ff2a4d] bg-gradient-to-b from-[#251017] to-[#0c0d12] shadow-[0_0_45px_rgba(255,42,77,.18)] md:-translate-y-2" : "border-white/12 bg-[#0d0e15]"}`}>{p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#ff2a4d] px-3 py-1 text-[11px] font-black tracking-widest">MOST POPULAR</span>}<h3 className="font-display text-xl">{p.name}</h3><p className="mt-1 text-sm text-white/55">{p.blurb}</p><p className="mt-5"><span className="font-display text-5xl">{p.price}</span><span className="text-white/50"> / month</span></p><ul className="mt-5 space-y-2">{p.feats.map(f => <li key={f} className="flex gap-2 text-sm text-white/75"><CheckCircle2 size={17} className="shrink-0 text-[#2eff8f]" /> {f}</li>)}</ul><a href="#final" className={`mt-6 block rounded-full py-3 text-center font-bold ${p.popular ? "bg-[#ff2a4d]" : "border border-white/20 bg-white/5"}`}>Choose {p.name}</a></article>)}
          </div>
        </section>

        {/* FINAL CTA */}
        <section id="final" className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-[#10060e] px-5 py-14 text-center sm:px-8 sm:py-20">
            <div className="hero-gradient absolute inset-0 opacity-20" /><div className="relative"><span className="inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-black tracking-[.2em] text-[#22e6ff]"><Flame size={14} /> YOUR STATION IS WAITING</span><h2 className="mx-auto mt-5 max-w-[900px] font-display text-[clamp(2.2rem,7vw,5rem)] leading-[.9]">YOUR CHANNEL.<br />YOUR RULES.<br /><span className="text-[#ff2a4d]">YOUR STATION.</span></h2><p className="mx-auto mt-4 max-w-[560px] text-white/70">Build the channel you wish existed. Go live tonight — with a studio that has your back.</p><div className="mt-7 flex flex-wrap items-center justify-center gap-3"><a href="#pricing" className="rounded-full bg-[#ff2a4d] px-7 py-4 font-black shadow-[0_0_35px_rgba(255,42,77,.5)]">Start Free →</a><span className="text-sm font-semibold text-white/65">No credit card needed</span></div></div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/60">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div><p className="font-display text-lg">TIKCAST <span className="text-[#22e6ff]">LIVE</span></p><p className="mt-1 text-sm text-white/50">Your own TV channel, hosted by TikTok.</p></div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/65"><a href="#studio">Studio</a><a href="#dj-movie">DJ Radio</a><a href="#safety">Safety</a><a href="#pricing">Pricing</a><a href="#ban">Why No Ban</a></nav>
          <p className="text-xs text-white/40">© 2026 TikCast Live • Broadcast boldly. Stay safe.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
