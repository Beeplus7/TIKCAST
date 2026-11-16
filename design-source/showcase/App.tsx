import React, { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, ChevronRight, Clapperboard, Clock3, Flame, Heart, Megaphone, Play, Radio, RadioTower, ShieldCheck, ShoppingBag, Sparkles, Tv, Users, Zap } from 'lucide-react';

type Creator = {
  name: string; channel: string; category: string; live: boolean; initials: string;
  gradient: string; desc: string; schedule: string; followers: string; viewers: string; health: number; tag: string;
};

const creators: Creator[] = [
  { name: 'Maya Morning', channel: 'The Morning Show', category: 'Morning Shows', live: true, initials: 'MM', gradient: 'from-[#ff2d55] via-[#ff6a3d] to-[#ffc24b]', desc: 'News, coffee talk, and a city waking up — one unmissable first hour.', schedule: '7:00 AM Daily', followers: '184K', viewers: '12.4K', health: 98, tag: 'FLAGSHIP' },
  { name: 'DJ Kaze', channel: 'Late Night Radio', category: 'DJ Radio', live: true, initials: 'DK', gradient: 'from-[#22d8e5] via-[#2563eb] to-[#7c3aed]', desc: 'After-dark selections, call-ins, and slow-burn sets for night owls.', schedule: '11:00 PM Fri', followers: '142K', viewers: '9.8K', health: 97, tag: 'NIGHT OWL' },
  { name: 'Cinema With Sam', channel: 'Horror Night', category: 'Movie Nights', live: false, initials: 'CS', gradient: 'from-[#111827] via-[#7f1d1d] to-[#ff2d55]', desc: 'A hosted fright night with live reactions, trivia, and audience votes.', schedule: 'Sat 9:00 PM', followers: '96K', viewers: '7.1K', health: 96, tag: 'EVENT' },
  { name: 'Coach Lee', channel: 'Fitness Live + Replays', category: 'Morning Shows', live: true, initials: 'CL', gradient: 'from-[#22d8e5] via-[#10b981] to-[#a3e635]', desc: 'Six o’clock movement, real coaching, and replays that keep working all day.', schedule: '6:00 AM Daily', followers: '121K', viewers: '8.3K', health: 99, tag: 'DAILY' },
  { name: 'Shop With Ana', channel: 'Live Shopping', category: 'Shopping', live: true, initials: 'SA', gradient: 'from-[#f472b6] via-[#ff2d55] to-[#fb923c]', desc: 'Try-ons, honest picks, and drops that sell out while the show is still live.', schedule: '8:00 PM Daily', followers: '208K', viewers: '15.2K', health: 95, tag: 'TOP SELLER' },
  { name: 'Gamer Jay', channel: 'Split-Screen Gaming', category: 'Gaming', live: false, initials: 'GJ', gradient: 'from-[#22d8e5] via-[#0ea5e9] to-[#312e81]', desc: 'Two screens, one rivalry. Community matches, strategy, and chaos.', schedule: '7:00 PM Daily', followers: '173K', viewers: '11.6K', health: 94, tag: 'COMMUNITY' },
  { name: 'Lofi Luna', channel: 'Chill Radio 24/7', category: 'DJ Radio', live: true, initials: 'LL', gradient: 'from-[#8b5cf6] via-[#22d8e5] to-[#34d399]', desc: 'An always-on room for focus, study, and slow evenings. No pressure.', schedule: '24/7 Always On', followers: '261K', viewers: '18.9K', health: 99, tag: 'ALWAYS ON' },
  { name: 'Talk With T', channel: 'News Desk Talk', category: 'Talk Shows', live: false, initials: 'TT', gradient: 'from-[#f59e0b] via-[#ff2d55] to-[#7c2d12]', desc: 'Sharp questions, clear context, and a desk that never talks down.', schedule: '6:00 PM Weekdays', followers: '88K', viewers: '6.4K', health: 93, tag: 'DESK' },
];

const filters = ['All', 'Morning Shows', 'DJ Radio', 'Movie Nights', 'Talk Shows', 'Gaming', 'Shopping'];

type Application = { id: string; value: { channelName: string; category: string; link: string; createdLabel: string } };

async function api(action: string, args: Record<string, unknown>) {
  const res = await fetch("actions", { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, args }) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(json.error || `Request failed (${res.status})`);
  return json.data;
}

export default function App() {
  const [filter, setFilter] = useState('All');
  const [spotlightPlaying, setSpotlightPlaying] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [category, setCategory] = useState('Morning Shows');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formResult, setFormResult] = useState<{ saved: number; remaining: number; error: string | null; reloadError: string | null } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCreator, setActiveCreator] = useState<Creator>(creators[0]);

  const reloadRecords = useCallback(async () => {
    const data = await api("records.list", { collection: "showcase_applications" });
    const rows = (data?.records || []) as Application[];
    setApplications(rows.slice(0, 6));
    setLoadError(null);
  }, []);

  useEffect(() => {
    reloadRecords().catch((e) => setLoadError(e instanceof Error ? e.message : 'Applications could not be loaded yet.'));
  }, [reloadRecords]);

  const filtered = filter === 'All' ? creators : creators.filter((c) => c.category === filter);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  async function submitApplication(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const cleanName = channelName.trim();
    const cleanLink = link.trim();
    if (!cleanName || !cleanLink) { setFormError('Add a channel name and a channel link to apply.'); return; }
    const row = { channelName: cleanName, category, link: cleanLink, createdLabel: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) };
    const key = `showcase-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setBusy(true); setFormError(null); setFormResult(null);
    let saved = 0; let error: string | null = null;
    try {
      await api("records.create", { collection: "showcase_applications", value: row, idempotency_key: key });
      saved = 1;
      setChannelName(''); setLink('');
    } catch (err) { error = err instanceof Error ? err.message : String(err); }
    let reloadError: string | null = null;
    try { await reloadRecords(); } catch (err) { reloadError = err instanceof Error ? err.message : String(err); }
    setFormResult({ saved, remaining: 1 - saved, error, reloadError });
    if (error) setFormError(error);
    setBusy(false);
  }

  return (
    <div data-safe-area-inset-root style={{ boxSizing: 'border-box', paddingTop: 'var(--safe-area-inset-top)', minHeight: '100vh', background: 'var(--bg)' }} className="overflow-x-clip">
      {/* NAV */}
      <header data-safe-area-sticky-top style={{ top: 'var(--safe-area-inset-top)' }} className="sticky z-50 border-b border-[#232a3a] bg-[#07080c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-2.5" aria-label="TIKCAST LIVE home">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#ff2d55] shadow-[0_0_28px_rgba(255,45,85,.55)]"><Radio className="h-5 w-5 text-white" /></span>
            <span className="leading-none"><span className="block text-[17px] font-bold tracking-tight">TIKCAST <span className="text-[#ff2d55]">LIVE</span></span><span className="mono mt-1 block text-[9px] tracking-[.22em] text-[#a4aebd]">CREATOR SHOWCASE</span></span>
          </a>
          <nav className="ml-auto hidden items-center gap-6 text-[13px] font-medium text-[#cbd2df] lg:flex">
            {['Studio', 'DJ Radio', 'Movie Mode', 'Safety', 'Pricing'].map((item) => (
              <button key={item} onClick={() => scrollTo(item === 'Studio' ? 'showcase' : item === 'Pricing' ? 'join' : 'journey')} className="transition hover:text-white">{item}</button>
            ))}
          </nav>
          <button onClick={() => scrollTo('join')} className="ml-auto flex items-center gap-2 rounded-full bg-[#ff2d55] px-4 py-2.5 text-[13px] font-bold shadow-[0_8px_28px_rgba(255,45,85,.35)] transition hover:bg-[#ff456b] lg:ml-4">Start Your Channel <ArrowUpRight className="h-4 w-4" /></button>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="relative overflow-x-clip border-b border-[#232a3a]">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(720px 360px at 12% 8%, rgba(255,45,85,.24), transparent 65%), radial-gradient(700px 420px at 88% 30%, rgba(34,216,229,.18), transparent 62%), linear-gradient(180deg, transparent, #07080c)' }} />
          <div className="relative mx-auto max-w-[1360px] px-4 pb-10 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pb-16">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ff2d55]/50 bg-[#ff2d55]/10 px-3 py-1.5 text-[11px] font-bold tracking-wider text-white"><span className="live-dot h-2 w-2 rounded-full bg-[#ff2d55]" /> NOW SHOWCASING · 8 CHANNELS</span>
              <span className="mono rounded-full border border-[#232a3a] px-3 py-1.5 text-[11px] text-[#a4aebd]">CHANNELS RUNNING ON TIKCAST</span>
            </div>
            <div className="mt-7 grid items-end gap-8 lg:grid-cols-[1.35fr_.65fr]">
              <div>
                <p className="mono mb-3 text-xs tracking-[.28em] text-[#22d8e5]">REAL CREATORS. REAL TV STATIONS.</p>
                <h1 className="hero-title font-bold">MEET THE<br /><span className="text-transparent" style={{ WebkitTextStroke: '2px #fff' }}>CHANNELS.</span></h1>
                <p className="mt-6 max-w-[680px] text-base leading-relaxed text-[#cbd2df] sm:text-lg">Creators who stopped “going live” and started running a channel. From morning shows to late-night radio to movie nights.</p>
              </div>
              <div className="rounded-2xl border border-[#232a3a] bg-[#0d1017]/90 p-4">
                <div className="flex items-center justify-between"><span className="mono text-[11px] tracking-widest text-[#a4aebd]">ON AIR NOW</span><span className="text-xs font-bold text-[#ff2d55]">5 LIVE</span></div>
                <p className="mt-3 text-lg font-bold leading-tight">Lofi Luna · Chill Radio 24/7</p>
                <p className="mt-1 text-sm text-[#a4aebd]">18.9K watching · focus room is open</p>
                <button onClick={() => { setSpotlightPlaying(true); scrollTo('spotlight'); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#22d8e5] py-3 text-sm font-bold text-black transition hover:bg-[#6df2ff]"><Play className="h-4 w-4 fill-black" /> Watch featured channel</button>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#232a3a] bg-[#232a3a] lg:grid-cols-4">
              {[
                ['120+', 'Channels', 'Growing every week'], ['2.4M', 'Hours Watched', 'Across showcase channels'], ['98%', 'Ban-Free', 'Built for safe, steady shows'], ['24/7', 'Live', 'Channels that never clock out'],
              ].map(([n, l, s]) => (
                <div key={l} className="bg-[#0d1017] p-4 sm:p-5"><p className="text-2xl font-bold sm:text-4xl">{n}</p><p className="mt-1 text-sm font-semibold">{l}</p><p className="text-xs text-[#a4aebd]">{s}</p></div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden border-y border-[#232a3a] bg-[#ff2d55] py-2.5">
            <div className="ticker flex w-max whitespace-nowrap text-[13px] font-bold tracking-[.16em] text-white">{Array.from({ length: 2 }).map((_, i) => <span key={i} className="flex shrink-0 items-center">{Array.from({ length: 6 }).map((__, j) => <span key={j} className="mx-5 flex items-center gap-5">MORNING SHOWS <Sparkles className="h-4 w-4" /> DJ RADIO <Sparkles className="h-4 w-4" /> MOVIE NIGHTS <Sparkles className="h-4 w-4" /> TALK SHOWS <Sparkles className="h-4 w-4" /></span>)}</span>)}</div>
          </div>
        </section>

        {/* FILTER + GRID */}
        <section id="showcase" className="mx-auto max-w-[1360px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="mono text-xs tracking-[.25em] text-[#22d8e5]">01 — THE LINEUP</p><h2 className="section-title mt-3 font-bold">Find your next<br />regular show.</h2></div>
            <p className="max-w-[360px] text-sm leading-relaxed text-[#a4aebd]">Every card is a working format, not a one-off live. Pick a lane, follow the schedule, and come back when the show starts.</p>
          </div>

          <div className="no-scrollbar sticky top-[72px] z-30 -mx-4 mt-8 flex gap-2 overflow-x-auto bg-[#07080c]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
            {filters.map((f) => {
              const active = filter === f;
              const count = f === 'All' ? creators.length : creators.filter((c) => c.category === f).length;
              return <button key={f} onClick={() => setFilter(f)} aria-pressed={active} className={`shrink-0 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition ${active ? 'border-[#ff2d55] bg-[#ff2d55] text-white shadow-[0_8px_24px_rgba(255,45,85,.3)]' : 'border-[#232a3a] bg-[#0d1017] text-[#cbd2df] hover:border-[#22d8e5] hover:text-white'}`}>{f} <span className="mono ml-1 text-[11px] opacity-70">{count}</span></button>;
            })}
          </div>

          <div className="mt-5 flex items-center justify-between text-sm text-[#a4aebd]"><span>Showing <strong className="text-white">{filtered.length}</strong> of {creators.length} channels</span><span className="mono hidden text-[11px] tracking-widest sm:block">FILTER: {filter.toUpperCase()}</span></div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((c) => (
              <article key={c.name} className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-[#232a3a] bg-[#0d1017]">
                <div className={`relative bg-gradient-to-br ${c.gradient} p-4 pb-10`}>
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-bold tracking-wider backdrop-blur">{c.tag}</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${c.live ? 'bg-[#ff2d55] text-white' : 'bg-black/45 text-white'}`}>{c.live && <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" />} {c.live ? 'LIVE' : 'OFFLINE'}</span>
                  </div>
                  <div className="mt-8 flex items-end justify-between">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-white/80 bg-black/35 text-xl font-bold shadow-xl backdrop-blur">{c.initials}</div>
                    <span className="mono rounded-md bg-black/35 px-2 py-1 text-[10px]">TIKCAST / {c.category.toUpperCase()}</span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0d1017] to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-4 pt-2">
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-[#22d8e5]/40 bg-[#22d8e5]/10 px-2.5 py-1 text-[11px] font-bold text-[#6df2ff]">{c.category}</span><span className="mono text-[11px] text-[#a4aebd]">{c.channel}</span></div>
                  <h3 className="mt-3 text-xl font-bold">{c.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#a4aebd]">{c.desc}</p>
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#131826] px-3 py-2.5 text-xs font-semibold"><Clock3 className="h-4 w-4 text-[#22d8e5]" /> {c.schedule}</div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#232a3a] pt-3 text-center">
                    <div><p className="text-sm font-bold">{c.followers}</p><p className="text-[10px] text-[#a4aebd]">Followers</p></div>
                    <div><p className="text-sm font-bold">{c.viewers}</p><p className="text-[10px] text-[#a4aebd]">Avg Viewers</p></div>
                    <div><p className="text-sm font-bold text-[#22d8e5]">{c.health}%</p><p className="text-[10px] text-[#a4aebd]">Health</p></div>
                  </div>
                  <button onClick={() => { setActiveCreator(c); scrollTo('spotlight'); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#232a3a] py-2.5 text-sm font-bold transition hover:border-[#ff2d55] hover:bg-[#ff2d55]">View channel <ArrowRight className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-[#232a3a] p-10 text-center text-[#a4aebd]">No channels in this lane yet — check back after the next showcase drop.</div>}
        </section>

        {/* SPOTLIGHT */}
        <section id="spotlight" className="border-y border-[#232a3a] bg-[#0d1017]">
          <div className="mx-auto grid max-w-[1360px] gap-0 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-16">
            <div className={`relative min-h-[340px] overflow-hidden rounded-t-2xl bg-gradient-to-br ${activeCreator.gradient} p-5 sm:p-8 lg:rounded-l-2xl lg:rounded-tr-none`}>
              <div className="flex items-center justify-between"><span className="rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-bold">FEATURED CHANNEL</span><span className="rounded-full bg-[#ff2d55] px-3 py-1.5 text-[11px] font-bold">● {activeCreator.live ? 'LIVE NOW' : 'NEXT SHOW SOON'}</span></div>
              <div className="mt-14 sm:mt-20">
                <div className="grid h-20 w-20 place-items-center rounded-3xl border-2 border-white/80 bg-black/35 text-2xl font-bold">{activeCreator.initials}</div>
                <h3 className="mt-5 text-3xl font-bold leading-none sm:text-5xl">{activeCreator.name}</h3>
                <p className="mt-2 text-lg font-semibold text-white/90">{activeCreator.channel} · {activeCreator.category}</p>
                <p className="mt-3 max-w-[520px] leading-relaxed text-white/85">{activeCreator.desc}</p>
              </div>
              <button onClick={() => setSpotlightPlaying(!spotlightPlaying)} className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:scale-[1.02]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff2d55] text-white"><Play className="h-4 w-4 fill-white" /></span>{spotlightPlaying ? 'Now previewing — tap to pause' : 'Play channel preview'}</button>
              {spotlightPlaying && <p className="mono mt-4 inline-block rounded-lg bg-black/45 px-3 py-2 text-[11px]">▶ PREVIEW ACTIVE · {activeCreator.schedule.toUpperCase()} · HEALTH {activeCreator.health}%</p>}
            </div>
            <div className="rounded-b-2xl border border-[#232a3a] bg-[#131826] p-5 sm:p-8 lg:rounded-r-2xl lg:rounded-bl-none lg:border-l-0">
              <p className="mono text-xs tracking-[.25em] text-[#22d8e5]">02 — WHY IT WORKS</p>
              <h3 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">A schedule people can plan around.</h3>
              <div className="mt-5 space-y-3">
                {[
                  ['Fixed time slot', 'Viewers know exactly when to return.'],
                  ['Safe format', 'The show runs inside clear, repeatable guardrails.'],
                  ['Always a next episode', 'Replays and reruns keep the channel alive between shows.'],
                ].map(([t, d]) => <div key={t} className="flex gap-3 rounded-xl bg-[#0d1017] p-3.5"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#22d8e5]" /><div><p className="font-bold">{t}</p><p className="text-sm text-[#a4aebd]">{d}</p></div></div>)}
              </div>
              <blockquote className="mt-5 border-l-2 border-[#ff2d55] pl-4 text-[15px] leading-relaxed text-[#d7dce6]">“I stopped chasing the algorithm. Now my audience chases the schedule — and my channel finally feels like a station, not a gamble.”<footer className="mt-2 text-sm font-bold text-white">— {activeCreator.name}, {activeCreator.channel}</footer></blockquote>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-[#0d1017] p-3"><p className="font-bold">{activeCreator.followers}</p><p className="text-[10px] text-[#a4aebd]">Followers</p></div><div className="rounded-lg bg-[#0d1017] p-3"><p className="font-bold">{activeCreator.viewers}</p><p className="text-[10px] text-[#a4aebd]">Avg Viewers</p></div><div className="rounded-lg bg-[#0d1017] p-3"><p className="font-bold text-[#22d8e5]">{activeCreator.health}%</p><p className="text-[10px] text-[#a4aebd]">Health</p></div></div>
              <button onClick={() => scrollTo('join')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff2d55] py-3.5 text-sm font-bold transition hover:bg-[#ff456b]">Apply for the spotlight <ArrowUpRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>

        {/* JOURNEY */}
        <section id="journey" className="mx-auto max-w-[1360px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mono text-xs tracking-[.25em] text-[#22d8e5]">03 — THE CREATOR JOURNEY</p><h2 className="section-title mt-3 font-bold">From random lives<br />to a real channel.</h2></div><span className="mono rounded-full border border-[#232a3a] px-3 py-2 text-[11px] text-[#a4aebd]">BEFORE → WITH → AFTER</span></div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { n: '01', icon: Flame, title: 'Before TIKCAST', color: '#a4aebd', items: ['Random lives, no rhythm', 'Bans and burnout', 'Starting from zero every time'] },
              { n: '02', icon: Zap, title: 'With TIKCAST', color: '#22d8e5', items: ['Scheduled, repeatable shows', 'Safe formats and guardrails', 'Automation between episodes'] },
              { n: '03', icon: Activity, title: 'After', color: '#ff2d55', items: ['A growing channel people return to', 'A team around the show', 'Revenue built on consistency'] },
            ].map((s) => (
              <article key={s.n} className="rounded-2xl border border-[#232a3a] bg-[#0d1017] p-5 sm:p-6">
                <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#131826]" style={{ color: s.color }}><s.icon className="h-5 w-5" /></span><span className="mono text-3xl font-bold text-[#232a3a]">{s.n}</span></div>
                <h3 className="mt-5 text-2xl font-bold">{s.title}</h3>
                <ul className="mt-4 space-y-3">{s.items.map((it) => <li key={it} className="flex gap-2.5 text-sm leading-relaxed text-[#cbd2df]"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#ff2d55]" />{it}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        {/* JOIN */}
        <section id="join" className="border-y border-[#232a3a] bg-[#0d1017]">
          <div className="mx-auto grid max-w-[1360px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_.95fr] lg:px-8 lg:py-16">
            <div>
              <p className="mono text-xs tracking-[.25em] text-[#22d8e5]">04 — JOIN THE SHOWCASE</p>
              <h2 className="section-title mt-3 font-bold">Want your channel featured?</h2>
              <p className="mt-4 max-w-[520px] text-lg leading-relaxed text-[#cbd2df]"><strong className="text-white">Start Free, Run 7 Days, Apply To Be Featured.</strong><br />Tell us about your show. Applications are saved here so the showcase team can review the latest entries.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[[Tv, 'Start Free', 'Set up your first format'], [CalendarDays, 'Run 7 Days', 'Prove the schedule'], [Megaphone, 'Apply', 'Get featured in the lineup']].map(([Icon, t, d]: any) => <div key={t} className="rounded-xl border border-[#232a3a] bg-[#131826] p-4"><Icon className="h-5 w-5 text-[#22d8e5]" /><p className="mt-3 font-bold">{t}</p><p className="text-xs leading-relaxed text-[#a4aebd]">{d}</p></div>)}
              </div>
              <div className="mt-6 rounded-2xl border border-[#232a3a] bg-[#131826] p-4">
                <div className="flex items-center justify-between"><h3 className="font-bold">Latest applications</h3><span className="mono text-[11px] text-[#a4aebd]">{applications.length} SHOWN</span></div>
                {loadError && <p className="mt-3 rounded-lg bg-[#ff2d55]/10 px-3 py-2 text-sm text-[#ffb3c1]">Saved applications could not be loaded yet. Your new application will still be attempted below.</p>}
                {applications.length === 0 && !loadError ? <p className="mt-3 text-sm text-[#a4aebd]">No applications yet — yours could be the first in this list.</p> : null}
                <ul className="mt-3 divide-y divide-[#232a3a]">{applications.map((a) => <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"><span><strong>{a.value.channelName}</strong> <span className="text-[#a4aebd]">· {a.value.category}</span></span><span className="mono max-w-[220px] truncate text-xs text-[#22d8e5]">{a.value.link}</span></li>)}</ul>
              </div>
            </div>
            <form onSubmit={submitApplication} className="h-fit rounded-2xl border border-[#232a3a] bg-[#131826] p-5 shadow-2xl sm:p-6">
              <div className="flex items-center gap-2"><RadioTower className="h-5 w-5 text-[#ff2d55]" /><h3 className="text-xl font-bold">Showcase application</h3></div>
              <p className="mt-1 text-sm text-[#a4aebd]">A saved application — not a public post until reviewed.</p>
              <label className="mt-5 block text-sm font-bold" htmlFor="channel-name">Channel Name</label>
              <input id="channel-name" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="e.g. Sunrise With Jo" className="mt-2 w-full rounded-xl border border-[#2b3448] bg-[#07080c] px-4 py-3.5 text-sm text-white placeholder:text-[#687189]" />
              <label className="mt-4 block text-sm font-bold" htmlFor="category">Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full appearance-none rounded-xl border border-[#2b3448] bg-[#07080c] px-4 py-3.5 text-sm text-white">{filters.filter((f) => f !== 'All').map((f) => <option key={f} value={f}>{f}</option>)}</select>
              <label className="mt-4 block text-sm font-bold" htmlFor="channel-link">Channel Link</label>
              <input id="channel-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://your-channel-link" inputMode="url" className="mt-2 w-full rounded-xl border border-[#2b3448] bg-[#07080c] px-4 py-3.5 text-sm text-white placeholder:text-[#687189]" />
              <button type="submit" disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff2d55] py-4 text-sm font-bold transition hover:bg-[#ff456b] disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Saving application…' : 'Submit application'} <ArrowRight className="h-4 w-4" /></button>
              {formResult && !formResult.error && <p role="status" className="mt-3 flex gap-2 rounded-lg bg-[#22d8e5]/10 px-3 py-2.5 text-sm text-[#b8fbff]"><CheckCircle2 className="h-5 w-5 shrink-0" /> Saved {formResult.saved} application. It now appears in the latest applications list.</p>}
              {formError && <p role="alert" className="mt-3 rounded-lg bg-[#ff2d55]/10 px-3 py-2.5 text-sm text-[#ffb3c1]">{formError}</p>}
              {formResult && formResult.reloadError && <p className="mt-2 text-xs text-[#a4aebd]">Saved, but the list could not refresh: {formResult.reloadError}</p>}
              <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-[#a4aebd]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#22d8e5]" /> Only your channel name, category, and link are saved for showcase review.</p>
            </form>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(600px 280px at 50% 0%, rgba(255,45,85,.32), transparent 70%), radial-gradient(500px 280px at 90% 100%, rgba(34,216,229,.18), transparent 65%)' }} />
          <div className="relative mx-auto max-w-[1100px] px-4 py-16 text-center sm:px-6 lg:py-24">
            <span className="mono rounded-full border border-[#ff2d55]/50 bg-[#ff2d55]/10 px-3 py-1.5 text-[11px] font-bold tracking-widest">NEXT UP · YOUR CHANNEL</span>
            <h2 className="hero-title mt-6 font-bold">YOUR CHANNEL<br />COULD BE <span className="text-[#ff2d55]">NEXT.</span></h2>
            <p className="mx-auto mt-5 max-w-[620px] text-base leading-relaxed text-[#cbd2df] sm:text-lg">Pick a format. Keep the schedule. Let TIKCAST turn a live into a station people return to.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={() => scrollTo('join')} className="rounded-full bg-[#ff2d55] px-7 py-4 text-sm font-bold shadow-[0_12px_36px_rgba(255,45,85,.35)] transition hover:bg-[#ff456b]">Start Free <ArrowRight className="ml-1 inline h-4 w-4" /></button><button onClick={() => scrollTo('showcase')} className="rounded-full border border-[#2b3448] bg-[#0d1017] px-7 py-4 text-sm font-bold transition hover:border-[#22d8e5]">Browse the lineup</button></div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#a4aebd]"><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#22d8e5]" /> Safe-by-design formats</span><span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-[#22d8e5]" /> 7-day showcase path</span><span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-[#22d8e5]" /> Built for returning viewers</span></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#232a3a] bg-[#05060a]">
        <div className="mx-auto grid max-w-[1360px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_.8fr_.8fr_.8fr] lg:px-8">
          <div><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-md bg-[#ff2d55]"><Radio className="h-4 w-4 text-white" /></span><span className="font-bold">TIKCAST <span className="text-[#ff2d55]">LIVE</span></span></div><p className="mt-3 max-w-[280px] text-sm leading-relaxed text-[#a4aebd]">Channels running on TIKCAST. Real creators. Real TV stations.</p></div>
          <div><p className="mono text-[11px] tracking-widest text-[#a4aebd]">CREATE</p><ul className="mt-3 space-y-2 text-sm text-[#cbd2df]"><li>Studio</li><li>DJ Radio</li><li>Movie Mode</li></ul></div>
          <div><p className="mono text-[11px] tracking-widest text-[#a4aebd]">TRUST</p><ul className="mt-3 space-y-2 text-sm text-[#cbd2df]"><li>Safety</li><li>Community rules</li><li>Channel health</li></ul></div>
          <div><p className="mono text-[11px] tracking-widest text-[#a4aebd]">SHOWCASE</p><ul className="mt-3 space-y-2 text-sm text-[#cbd2df]"><li>Morning Shows</li><li>Movie Nights</li><li>Apply to be featured</li></ul></div>
        </div>
        <div className="border-t border-[#232a3a]"><div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-[#687189] sm:px-6 lg:px-8"><span>© {new Date().getFullYear()} TIKCAST LIVE · Creator Showcase</span><span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Fictional showcase examples for demonstration</span></div></div>
      </footer>
    </div>
  );
}
