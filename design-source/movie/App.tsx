import React, { useState } from 'react';
import { Clapperboard, Ticket, Crown, ShieldCheck, Radio, Sparkles, Play, CalendarDays, Users, MessageCircle, Pause, Timer, Scissors, Check, AlertTriangle, Zap, ArrowRight, Star, ChevronRight, Tv, Sofa, Car, Popcorn, Film, Heart, Gift, Shirt, Megaphone, X } from 'lucide-react';

const sets = [
  { id:'Classic Theater', icon:Popcorn, seats:'Red velvet seats + gold trim', desc:'The house lights dim. The curtain breathes. Your audience feels the premiere.', grad:'linear-gradient(160deg,#6d0712,#2b0308 62%,#c99a2e)', tag:'Most loved' },
  { id:'Drive-In', icon:Car, seats:'Night sky + glowing cars', desc:'Under the stars, headlights low and chat loud. Perfect for late-night double features.', grad:'linear-gradient(160deg,#152a5b,#060a1e 58%,#e86a2d)', tag:'Late night' },
  { id:'Red Carpet Premiere', icon:Crown, seats:'Gold + flashbulbs', desc:'Make an ordinary Thursday feel like opening night. Cameras, glamour, arrival energy.', grad:'linear-gradient(160deg,#9a6a0c,#2a1500 55%,#ffdf7d)', tag:'Premieres' },
  { id:'Cozy Living Room', icon:Sofa, seats:'Warm lamps + blankets', desc:'The intimate one. Soft light, close conversation, and a night that feels like friends on a sofa.', grad:'linear-gradient(160deg,#743a12,#26100b 60%,#ffb65c)', tag:'Community' },
  { id:'Retro VHS Room', icon:Film, seats:'Tracking lines + nostalgia', desc:'Rewind energy for throwbacks, cult picks and VHS-era double bills.', grad:'linear-gradient(160deg,#2d3a78,#0a0d26 62%,#e14e7d)', tag:'Throwback' },
  { id:'Outdoor Rooftop Cinema', icon:Tv, seats:'City glow + open air', desc:'Golden hour turns into movie hour. Skyline behind you, popcorn in front of you.', grad:'linear-gradient(160deg,#173a52,#080c1a 58%,#ff8f5a)', tag:'Summer' },
];

const layouts = [
  { id:'Full Cinema', ratio:'Film 100% · Host voice only', best:'Trailer mode, countdowns and quiet opening moments.', why:'Use it for short, rights-cleared segments — not as a way to play someone else’s film in full.', visual:'linear-gradient(180deg,#2e2a8a,#0d0730 55%,#f2c14e)' },
  { id:'Split-Screen Host', ratio:'Film 70% · Host 30% reacting', best:'The signature Movie Mode. You react, pause, explain and laugh with chat.', why:'Your face, voice and commentary stay in frame — that is what makes the stream transformative.', visual:'linear-gradient(135deg,#731019 0 68%,#f2c14e 68% 70%,#15233e 70%)' },
  { id:'Reaction Cinema', ratio:'Film small · Host large', best:'Commentary nights, reviews and watch-along breakdowns.', why:'Your reaction leads the show. The film supports the conversation, not the other way around.', visual:'linear-gradient(135deg,#15233e 0 62%,#e11d2e 62% 64%,#f2c14e 64%)' },
];

const schedule = [
  { day:'FRI', date:'Premiere Night', time:'8:00 PM', show:'First-look premieres + live red-carpet opening', vibe:'Glamour · New releases · Big chat', color:'#f2c14e' },
  { day:'SAT', date:'Horror Night', time:'9:00 PM', show:'Lights out. Blankets up. Screams in the chat.', vibe:'Thrills · Jump scares · Poll picks', color:'#e11d2e' },
  { day:'SUN', date:'Family Night', time:'7:00 PM', show:'Cozy picks everyone can enjoy together.', vibe:'Warm · Relaxed · All ages', color:'#76c98a' },
];

const features = [
  { icon:Users, title:'Watch Party Queue', text:'Line up the night in order — trailer, main feature, intermission, after-show. Drag the mood, not the stress.' },
  { icon:MessageCircle, title:'Live Polls', text:'Let chat choose what plays next. One vote, one verdict, zero arguments about the remote.' },
  { icon:Heart, title:'Chat Reactions Overlay', text:'Hearts, gasps and popcorn bursts float across the cinema wall — the audience becomes part of the set.' },
  { icon:Pause, title:'Intermission / BRB Screens', text:'Beautiful pause screens for snacks, stretch breaks and sponsor moments. The show never feels broken.' },
  { icon:Timer, title:'Countdown + Trailer Mode', text:'Build anticipation with a glowing countdown, then roll straight into trailers without dead air.' },
  { icon:Scissors, title:'Auto-Clips of Best Reactions', text:'Your biggest laugh, gasp and plot-twist face — clipped automatically for tomorrow’s highlights.' },
];

function SectionHead({ eyebrow, title, copy }: { eyebrow:string; title:string; copy:string }) {
  return <div className="max-w-3xl"><p className="text-[11px] font-extrabold tracking-[0.32em] text-[#f2c14e]">{eyebrow}</p><h2 className="font-display mt-3 text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.88]">{title}</h2><p className="mt-4 text-[15px] leading-7 text-[#c9b8a8]">{copy}</p></div>
}

export default function App() {
  const [selectedSet, setSelectedSet] = useState('Classic Theater');
  const [layout, setLayout] = useState('Split-Screen Host');
  const [activeDay, setActiveDay] = useState(0);
  const [billing, setBilling] = useState<'Monthly'|'Yearly'>('Monthly');
  const [votes, setVotes] = useState([128, 96, 74]);
  const [voted, setVoted] = useState<number | null>(null);
  const [notice, setNotice] = useState('Classic Theater is loaded in your preview. Change the set below to restage the night.');
  const [ticket, setTicket] = useState(false);
  const activeLayout = layouts.find(l=>l.id===layout)!;
  const totalVotes = votes.reduce((a,b)=>a+b,0);
  const chooseSet = (name:string) => { setSelectedSet(name); setNotice(`${name} is loaded in your preview. Your screen, curtain and glow now match this set.`); };
  const vote = (i:number) => { if (voted !== null) return; const next=[...votes]; next[i]+=1; setVotes(next); setVoted(i); };

  return (
    <div data-safe-area-inset-root className="min-h-screen w-full overflow-x-clip bg-[var(--bg)] text-[var(--ink)]" style={{ boxSizing:'border-box', paddingTop:'var(--safe-area-inset-top)' }}>
      {/* TOP TICKER */}
      <div className="bg-[#e11d2e] text-white overflow-hidden border-b border-[#ffd977]/30">
        <div className="marquee flex w-max whitespace-nowrap py-2 text-[11px] font-extrabold tracking-[0.22em]"><span className="px-4">NOW SHOWING · YOUR CINEMA · LIVE ON TIKTOK · &nbsp;</span><span className="px-4">NOW SHOWING · YOUR CINEMA · LIVE ON TIKTOK · &nbsp;</span><span className="px-4">NOW SHOWING · YOUR CINEMA · LIVE ON TIKTOK · &nbsp;</span><span className="px-4">NOW SHOWING · YOUR CINEMA · LIVE ON TIKTOK · &nbsp;</span></div>
      </div>

      {/* NAV */}
      <header data-safe-area-sticky-top className="sticky z-40 border-b border-white/10 bg-[#070304]/95 backdrop-blur" style={{ top:'var(--safe-area-inset-top)' }}>
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e11d2e] shadow-[0_0_28px_#e11d2e66]"><Clapperboard size={22}/></span><span className="leading-none"><span className="font-display block text-[24px] tracking-wide">TIKCAST <span className="text-[#f2c14e]">LIVE</span></span><span className="text-[9px] font-extrabold tracking-[0.3em] text-[#c9b8a8]">MOVIE MODE</span></span><span className="ml-1 flex items-center gap-1 rounded-full bg-[#e11d2e]/15 px-2 py-1 text-[10px] font-extrabold text-[#ff7783]"><span className="pulse-dot h-2 w-2 rounded-full bg-[#ff2538]"/>LIVE</span></a>
          <div className="hidden items-center gap-6 text-[13px] font-bold text-[#c9b8a8] lg:flex"><a className="hover:text-white" href="#studio">Studio</a><a className="hover:text-white" href="#radio">DJ Radio</a><a className="text-white" href="#movie">Movie Mode</a><a className="hover:text-white" href="#safety">Safety</a><a className="hover:text-white" href="#pricing">Pricing</a></div>
          <div className="flex items-center gap-2"><a href="#pricing" className="hidden rounded-full border border-white/20 px-4 py-2 text-[12px] font-bold sm:block">See Schedule</a><a href="#final" className="rounded-full bg-[#e11d2e] px-4 py-2.5 text-[12px] font-extrabold shadow-[0_8px_24px_#e11d2e55] hover:bg-[#ff2438]">Start Your Cinema Free</a></div>
        </nav>
      </header>

      <main id="top" className="relative">
        {/* HERO */}
        <section className="projector grain relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
            <div>
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-[#f2c14e]/40 bg-[#f2c14e]/10 px-3 py-1 text-[11px] font-extrabold tracking-widest text-[#ffe08a]">★ TIKCAST LIVE · MOVIE MODE</span><span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold">Watch parties, reimagined</span></div>
              <h1 className="font-display mt-6 text-[clamp(3.4rem,10vw,7.6rem)] leading-[0.78]">YOUR CINEMA.<br/><span className="gold-text">LIVE ON</span><br/>TIKTOK.</h1>
              <p className="mt-6 max-w-xl text-[16px] leading-8 text-[#d7c9ba]">Host watch parties, premieres, and movie nights with your community. You on screen, film on screen, chat reacting together — like a real TV movie night.</p>
              <div className="mt-7 flex flex-wrap gap-3"><a href="#sets" className="flex items-center gap-2 rounded-full bg-[#f2c14e] px-6 py-3.5 text-sm font-extrabold text-[#1d0f02] shadow-[0_12px_30px_#f2c14e33]"><Play size={17} fill="currentColor"/> Host Movie Night</a><a href="#schedule" className="flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-extrabold"><CalendarDays size={17}/> See Schedule</a></div>
              <div className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">{['Watch Parties','Split-Screen Host','Cinema Wallpapers','Rights-Safe'].map((s,i)=><div key={s} className="bg-[#120808] px-3 py-4"><p className="font-display text-2xl text-[#f2c14e]">{['24K+','70 / 30','6 Sets','3-Step'][i]}</p><p className="mt-1 text-[11px] font-bold leading-tight text-[#c9b8a8]">{s}</p></div>)}</div>
              <p className="mt-4 flex items-center gap-2 text-xs text-[#8f7d6f]"><ShieldCheck size={15} className="text-[#76c98a]"/> Built for creators who want the magic — without risking the channel.</p>
            </div>

            {/* CINEMA MOCKUP */}
            <div className="relative" aria-label="Cinema screen preview showing a movie night with host and chat">
              <div className="curtain relative rounded-[28px] p-3 shadow-[0_35px_80px_rgba(0,0,0,.8)] sm:p-4">
                <div className="relative overflow-hidden rounded-[20px] border-4 border-[#f2c14e]/70 bg-black">
                  <div className="flex items-center justify-between bg-[#0a0a0a] px-3 py-2"><span className="flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-[#ff7783]"><span className="pulse-dot h-2 w-2 rounded-full bg-red-500"/> ON AIR</span><span className="rounded-full bg-[#f2c14e] px-2 py-0.5 text-[9px] font-extrabold text-black">NOW SHOWING</span></div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-[radial-gradient(circle_at_22%_20%,#ffd977_0,transparent_26%),linear-gradient(120deg,#431a77,#c22559_48%,#f0a13d)]">
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent"/>
                    <div className="absolute left-4 top-4"><p className="font-display text-2xl leading-none sm:text-4xl">MIDNIGHT<br/>AT THE PALACE</p><p className="mt-1 text-[10px] font-bold tracking-widest">A COMMUNITY PREMIERE</p></div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2"><span className="rounded-full bg-black/60 px-2 py-1 text-[10px]">🍿 2,418 watching</span><span className="rounded-full bg-[#e11d2e] px-2 py-1 text-[10px] font-bold">LIVE</span></div>
                    <div className="absolute bottom-3 right-3 h-24 w-20 overflow-hidden rounded-xl border-2 border-[#f2c14e] bg-[linear-gradient(180deg,#9a5b33,#27131f)] shadow-xl sm:h-28 sm:w-24"><div className="mt-4 flex justify-center"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#ffd977] text-lg">🙂</span></div><p className="mt-2 text-center text-[9px] font-extrabold">YOU · HOST</p><p className="text-center text-[8px] text-white/70">Reacting live</p></div>
                  </div>
                  <div className="flex items-center justify-between bg-[#151010] px-3 py-2 text-[10px] text-[#c9b8a8]"><span>● 00:42:18</span><span>CHAT · POLLS · CLIPS</span><span>HD · STEREO</span></div>
                </div>
                <div className="mt-3 flex justify-center gap-2">{Array.from({length:12}).map((_,i)=><span key={i} className="h-2 w-2 rounded-full bg-[#f2c14e]/70"/>)}</div>
              </div>
              <div className="chat-pop absolute -left-1 top-16 rounded-2xl bg-white px-3 py-2 text-[11px] font-bold text-black shadow-xl sm:left-2"><span className="text-[#e11d2e]">Maya:</span> THIS SCENE 😭🔥</div>
              <div className="chat-pop absolute -right-1 top-36 rounded-2xl bg-[#f2c14e] px-3 py-2 text-[11px] font-extrabold text-black shadow-xl sm:right-2" style={{animationDelay:'1s'}}><span>Leo:</span> POPCORN READY 🍿</div>
              <div className="float-slow absolute -bottom-4 left-6 rounded-full bg-[#120808] px-4 py-2 text-xs font-bold shadow-xl ring-1 ring-[#f2c14e]/40">🍿 Chat is the audience</div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="studio" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHead eyebrow="HOW MOVIE MODE WORKS" title="FROM IDEA TO OPENING NIGHT IN FOUR MOVES." copy="A clear path keeps the show joyful and the channel protected. Every live night follows the same trusted routine."/>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {n:'01', title:'Pick Your Film', text:'Your own content, licensed work, work you have permission for, or Creative Commons picks.', icon:Film, color:'#f2c14e'},
              {n:'02', title:'Rights Check', text:'Green means go. Yellow needs the reaction layout. Red is blocked before you ever go live.', icon:ShieldCheck, color:'#76c98a'},
              {n:'03', title:'Pick Cinema Set', text:'Classic Theater, Drive-In, Red Carpet or Living Room. The room sets the mood instantly.', icon:Ticket, color:'#e11d2e'},
              {n:'04', title:'Go Live', text:'Split-screen host + live chat. You react, chat reacts, and the night becomes a shared memory.', icon:Radio, color:'#f2c14e'},
            ].map(s=><article key={s.n} className="group rounded-3xl border border-white/10 bg-[#150b0c] p-5 hover:border-[#f2c14e]/50"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><s.icon size={22} style={{color:s.color}}/></span><span className="font-display text-4xl text-white/15">{s.n}</span></div><h3 className="mt-5 text-lg font-extrabold">{s.title}</h3><p className="mt-2 text-sm leading-6 text-[#c9b8a8]">{s.text}</p><span className="mt-4 flex items-center gap-1 text-xs font-extrabold text-[#f2c14e]">Step {s.n} <ChevronRight size={14}/></span></article>)}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#1a6b35] px-4 py-3"><b>GREEN · GO</b><p className="text-xs opacity-90">Cleared for your chosen layout.</p></div>
            <div className="rounded-2xl bg-[#9a6a0c] px-4 py-3"><b>YELLOW · REACTION ONLY</b><p className="text-xs opacity-90">Reaction layout required.</p></div>
            <div className="rounded-2xl bg-[#8f1622] px-4 py-3"><b>RED · BLOCKED</b><p className="text-xs opacity-90">Choose another title.</p></div>
          </div>
        </section>

        {/* SET GALLERY */}
        <section id="sets" className="border-y border-white/10 bg-[#0e0607] py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4"><SectionHead eyebrow="CINEMA SET GALLERY" title="PICK THE ROOM. SET THE MOOD." copy="Six ready-made worlds. One click changes your curtain, colour and glow."/><div className="rounded-2xl border border-[#f2c14e]/30 bg-[#1c0d0d] px-4 py-3 text-sm"><span className="text-[#8f7d6f]">Now previewing</span><p className="font-extrabold text-[#ffe08a]">{selectedSet}</p></div></div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sets.map(s=><article key={s.id} className={`overflow-hidden rounded-3xl border bg-[#150b0c] transition ${selectedSet===s.id?'border-[#f2c14e] shadow-[0_0_0_2px_#f2c14e33,0_20px_50px_rgba(0,0,0,.5)]':'border-white/10'}`}>
                <div className="relative h-48 p-5" style={{background:s.grad}}><span className="rounded-full bg-black/45 px-3 py-1 text-[10px] font-extrabold tracking-widest">{s.tag}</span><span className="absolute bottom-4 right-4 grid h-16 w-16 place-items-center rounded-2xl bg-black/35 backdrop-blur"><s.icon size={34}/></span><div className="absolute bottom-4 left-5 flex gap-1">{Array.from({length:5}).map((_,i)=><span key={i} className="h-1.5 w-5 rounded-full bg-white/50"/>)}</div></div>
                <div className="p-5"><h3 className="text-xl font-extrabold">{s.id}</h3><p className="mt-1 text-xs font-bold text-[#f2c14e]">{s.seats}</p><p className="mt-2 text-sm leading-6 text-[#c9b8a8]">{s.desc}</p><button onClick={()=>chooseSet(s.id)} className={`mt-4 w-full rounded-full py-3 text-sm font-extrabold ${selectedSet===s.id?'bg-[#f2c14e] text-black':'bg-white/10 hover:bg-white/20'}`}>{selectedSet===s.id?'✓ Selected Set':'Use This Set'}</button></div>
              </article>)}
            </div>
            <div role="status" className="mt-4 flex items-start gap-2 rounded-2xl border border-[#f2c14e]/25 bg-[#f2c14e]/10 px-4 py-3 text-sm"><Sparkles className="mt-0.5 shrink-0 text-[#f2c14e]" size={18}/><span>{notice}</span></div>
          </div>
        </section>

        {/* LAYOUTS */}
        <section id="movie" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHead eyebrow="LAYOUTS" title="THE FRAME CHANGES EVERYTHING." copy="Choose how much of the screen belongs to the film — and how much belongs to you."/>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">{layouts.map(l=><button key={l.id} onClick={()=>setLayout(l.id)} className={`rounded-3xl border p-5 text-left ${layout===l.id?'border-[#f2c14e] bg-[#221110]':'border-white/10 bg-[#150b0c] hover:border-white/30'}`}><div className="h-36 overflow-hidden rounded-2xl" style={{background:l.visual}}><div className="flex h-full items-end justify-between p-3"><span className="rounded bg-black/50 px-2 py-1 text-[10px] font-bold">FILM</span><span className="rounded bg-white px-2 py-1 text-[10px] font-extrabold text-black">HOST</span></div></div><div className="mt-4 flex items-center justify-between"><h3 className="text-lg font-extrabold">{l.id}</h3>{layout===l.id && <span className="rounded-full bg-[#f2c14e] px-2 py-1 text-[10px] font-extrabold text-black">SELECTED</span>}</div><p className="mt-1 text-xs font-bold text-[#f2c14e]">{l.ratio}</p><p className="mt-2 text-sm leading-6 text-[#c9b8a8]">{l.best}</p></button>)}</div>
          <div className="mt-5 rounded-3xl border border-[#76c98a]/30 bg-[#0f1b12] p-5 sm:p-7"><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-[#76c98a] px-3 py-1 text-xs font-extrabold text-black">WHY {activeLayout.id.toUpperCase()}?</span><h3 className="text-xl font-extrabold">Split-screen + commentary is the safe, transformative way.</h3></div><p className="mt-3 max-w-4xl text-[15px] leading-7 text-[#c9b8a8]">{activeLayout.why} You are not just replaying a film. You are hosting it — adding reactions, context, jokes, pauses and conversation that only your live show can create.</p></div>
        </section>

        {/* FEATURES */}
        <section id="radio" className="bg-[#0e0607] py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6"><SectionHead eyebrow="BUILT FOR LIVE" title="EVERYTHING A GREAT MOVIE NIGHT NEEDS." copy="The tools stay invisible until the moment you need them — then they feel effortless."/>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(f=><article key={f.title} className="rounded-3xl border border-white/10 bg-[#150b0c] p-5"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e11d2e]/15 text-[#ff7783]"><f.icon size={22}/></span><h3 className="mt-4 text-lg font-extrabold">{f.title}</h3><p className="mt-2 text-sm leading-6 text-[#c9b8a8]">{f.text}</p></article>)}</div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-[#1b0d0d] p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-extrabold tracking-widest text-[#f2c14e]">TRY IT LIVE · WHAT TO WATCH NEXT?</p><h3 className="mt-1 text-xl font-extrabold">Tonight’s audience poll</h3></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs">{totalVotes} votes</span></div><div className="mt-5 grid gap-3 md:grid-cols-3">{['Midnight at the Palace','The Last Lighthouse','Popcorn Heist'].map((title,i)=><button key={title} onClick={()=>vote(i)} disabled={voted!==null} className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left disabled:cursor-default"><span className="flex justify-between text-sm font-extrabold"><span>{title}</span><span>{Math.round(votes[i]/totalVotes*100)}%</span></span><span className="mt-3 block h-2 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-[#f2c14e]" style={{width:`${votes[i]/totalVotes*100}%`}}/></span><span className="mt-2 block text-xs text-[#c9b8a8]">{votes[i]} votes {voted===i?'· Your pick ✓':''}</span></button>)}</div><p className="mt-3 text-xs text-[#8f7d6f]">{voted===null?'Tap one option to vote in this demo poll.':'Thanks — your vote is counted in the live tally above.'}</p></div>
          </div>
        </section>

        {/* SCHEDULE */}
        <section id="schedule" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]"><div><SectionHead eyebrow="WEEKLY MOVIE SCHEDULE" title="MAKE IT A RITUAL." copy="A regular slot turns casual viewers into regulars. Your audience knows when to bring the popcorn."/><div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#150b0c] p-4"><CalendarDays className="text-[#f2c14e]"/><div><p className="text-sm font-extrabold">Add all three nights to your channel routine</p><p className="text-xs text-[#c9b8a8]">Consistency builds community — and community builds the cinema.</p></div></div><button onClick={()=>setTicket(!ticket)} className="mt-4 w-full rounded-full bg-[#e11d2e] py-3.5 text-sm font-extrabold">{ticket?'★ Ticket reserved for this week':'Reserve My Weekly Ticket'}</button>{ticket && <p role="status" className="mt-3 rounded-xl bg-[#76c98a]/15 px-3 py-2 text-sm font-bold text-[#b6e8c3]">Your seat is saved — see you at the next opening night.</p>}</div>
          <div className="grid gap-3 sm:grid-cols-3">{schedule.map((d,i)=><button key={d.day} onClick={()=>setActiveDay(i)} className={`rounded-3xl border p-5 text-left ${activeDay===i?'border-[#f2c14e] bg-[#221110]':'border-white/10 bg-[#150b0c]'}`}><p className="font-display text-5xl" style={{color:d.color}}>{d.day}</p><p className="mt-3 text-lg font-extrabold">{d.date}</p><p className="text-sm font-bold text-[#f2c14e]">{d.time}</p><p className="mt-3 text-sm leading-6 text-[#c9b8a8]">{d.show}</p><span className="mt-4 block rounded-full bg-white/5 px-3 py-2 text-[11px] font-bold">{d.vibe}</span></button>)}</div></div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#150b0c] px-5 py-4 text-sm"><b className="text-[#f2c14e]">This week’s pick:</b> <span className="text-[#c9b8a8]">{schedule[activeDay].date} · {schedule[activeDay].time} · {schedule[activeDay].show}</span></div>
        </section>

        {/* SAFETY */}
        <section id="safety" className="border-y border-[#e11d2e]/25 bg-[#1b0709] py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-start gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e11d2e]"><AlertTriangle size={26}/></span><div><p className="text-xs font-extrabold tracking-[0.28em] text-[#ff7783]">SAFETY FOR MOVIE MODE</p><h2 className="font-display mt-2 text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.9]">CREDIT IS NOT PERMISSION.</h2></div></div>
            <p className="mt-5 max-w-3xl text-[16px] leading-8 text-[#eadfd2]">A credit line does not make a film yours to stream. You need permission, ownership, a licence, or a Creative Commons source that allows this kind of live use. Movie Mode is built to help you stay on the right side of that line.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-3xl bg-black/25 p-5"><X className="text-[#ff7783]"/><h3 className="mt-3 font-extrabold">No full pirated movies</h3><p className="mt-2 text-sm leading-6 text-[#c9b8a8]">If you do not have the right to show it, Movie Mode will not help you show it.</p></div><div className="rounded-3xl bg-black/25 p-5"><ShieldCheck className="text-[#f2c14e]"/><h3 className="mt-3 font-extrabold">Rights Check blocks Red</h3><p className="mt-2 text-sm leading-6 text-[#c9b8a8]">A Red result stops the show before it starts. No guessing. No risk.</p></div><div className="rounded-3xl bg-black/25 p-5"><Tv className="text-[#76c98a]"/><h3 className="mt-3 font-extrabold">Reaction layout for Yellow</h3><p className="mt-2 text-sm leading-6 text-[#c9b8a8]">Yellow titles can only go live with you visibly hosting and commenting.</p></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">{[['Health Score','See your channel health at a glance.'],['Kill Switch','End the film feed instantly if something looks wrong.'],['Playlist Blocker','Blocked titles cannot slip into the queue.']].map(([t,d])=><div key={t} className="rounded-2xl border border-white/15 bg-[#120808] p-4"><p className="font-extrabold">{t}</p><p className="mt-1 text-sm text-[#c9b8a8]">{d}</p></div>)}</div>
          </div>
        </section>

        {/* MONETIZATION + PRICING */}
        <section id="pricing" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHead eyebrow="MONETIZATION" title="TURN MOVIE NIGHT INTO A LIVING." copy="Your cinema can pay for itself — and then some. Keep the show generous, and let the community support what they love."/>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[Ticket,'Tickets via gifts','Let viewers send gifts to unlock a front-row seat, shout-out or VIP moment.'],[Crown,'VIP watch party subs','Members get early access, private polls and after-show hangouts.'],[Shirt,'Merch','Drop the night’s design while the moment is still warm.'],[Megaphone,'Sponsored premieres','Partner with brands for opening nights that fit your audience.']].map(([Icon,title,desc]:any)=><article key={title} className="rounded-3xl border border-white/10 bg-[#150b0c] p-5"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f2c14e]/15 text-[#f2c14e]"><Icon size={22}/></span><h3 className="mt-4 font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#c9b8a8]">{desc}</p></article>)}</div>

          <div className="mt-16 flex flex-wrap items-end justify-between gap-4"><h2 className="font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-none">PRICING TEASER</h2><div className="flex rounded-full border border-white/15 bg-black/30 p-1">{(['Monthly','Yearly'] as const).map(v=><button key={v} onClick={()=>setBilling(v)} className={`rounded-full px-4 py-2 text-xs font-extrabold ${billing===v?'bg-[#f2c14e] text-black':'text-white'}`}>{v}{v==='Yearly'?' · Save 20%':''}</button>)}</div></div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[['Creator','£19','Start your first cinema','3 cinema sets','Split-screen host','Weekly schedule tools','Rights Check'],['Studio Pro','£49','Full Cinema + All Sets','All 6 cinema sets','Full Cinema layout','Auto-clips + polls','Priority support'],['Network','£99','Run a whole channel network','Multi-host shows','Sponsored premieres','Team seats','Advanced safety controls']].map((p,i)=><article key={p[0]} className={`relative rounded-3xl border p-6 ${i===1?'border-[#f2c14e] bg-[#241312] shadow-[0_24px_60px_rgba(242,193,78,.12)]':'border-white/10 bg-[#150b0c]'}`}>{i===1 && <span className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-[#f2c14e] px-3 py-1 text-[11px] font-extrabold text-black"><Star size={12} fill="currentColor"/> MOST POPULAR</span>}<p className="font-extrabold">{p[0]}</p><p className="mt-4 font-display text-6xl leading-none">£{billing==='Yearly'? Math.round(Number(p[1])*0.8) : p[1].replace('£','')}<span className="text-base text-[#c9b8a8]"> / mo</span></p><p className="mt-2 text-sm font-bold text-[#f2c14e]">{p[2]}</p><ul className="mt-5 space-y-2">{p.slice(3).map(f=><li key={f} className="flex gap-2 text-sm text-[#c9b8a8]"><Check size={16} className="mt-0.5 shrink-0 text-[#76c98a]"/>{f}</li>)}</ul><a href="#final" className={`mt-6 block rounded-full py-3 text-center text-sm font-extrabold ${i===1?'bg-[#f2c14e] text-black':'bg-white/10'}`}>Choose {p[0]}</a></article>)}
          </div>
          <p className="mt-3 text-center text-xs text-[#8f7d6f]">Prices shown in GBP. {billing==='Yearly'?'Yearly billing shows the discounted monthly equivalent.':'Switch to Yearly to see the 20% saving.'}</p>
        </section>

        {/* FINAL CTA */}
        <section id="final" className="projector grain relative overflow-hidden border-t border-[#f2c14e]/25 bg-[#190a0a] px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="curtain absolute inset-x-0 top-0 h-16 opacity-70"/>
          <div className="relative mx-auto max-w-4xl"><span className="inline-flex items-center gap-2 rounded-full border border-[#f2c14e]/40 bg-black/30 px-4 py-1.5 text-xs font-extrabold tracking-widest text-[#ffe08a]"><span className="pulse-dot h-2 w-2 rounded-full bg-red-500"/> YOUR AUDIENCE IS WAITING</span><h2 className="font-display mt-6 text-[clamp(3.2rem,10vw,7.5rem)] leading-[0.8]">LIGHTS. CAMERA.<br/><span className="gold-text">LIVE.</span></h2><p className="mx-auto mt-5 max-w-xl text-[16px] leading-7 text-[#d7c9ba]">Open the curtain on your first movie night. Pick a set, pick a film you have the right to show, and invite everyone in.</p><a href="#sets" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#e11d2e] px-7 py-4 text-sm font-extrabold shadow-[0_16px_40px_#e11d2e55]">Start Free <ArrowRight size={17}/></a><p className="mt-4 text-xs text-[#8f7d6f]">No film rights required to explore the studio · Safety checks included</p></div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black px-4 py-10 sm:px-6"><div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-8"><div className="max-w-sm"><p className="font-display text-3xl">TIKCAST <span className="text-[#f2c14e]">LIVE</span></p><p className="mt-2 text-sm leading-6 text-[#c9b8a8]">Turn TikTok LIVE into your own cinema. Host watch parties like a TV channel.</p></div><div className="grid grid-cols-2 gap-10 text-sm"><div><p className="mb-3 font-extrabold text-[#f2c14e]">Explore</p><div className="space-y-2 text-[#c9b8a8]"><a className="block" href="#studio">Studio</a><a className="block" href="#sets">Cinema Sets</a><a className="block" href="#schedule">Schedule</a></div></div><div><p className="mb-3 font-extrabold text-[#f2c14e]">Trust</p><div className="space-y-2 text-[#c9b8a8]"><a className="block" href="#safety">Safety</a><a className="block" href="#pricing">Pricing</a><a className="block" href="#final">Start Free</a></div></div></div></div><p className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs leading-5 text-[#8f7d6f]">© {new Date().getFullYear()} TIKCAST LIVE — Movie Mode. Host responsibly: only show content you own, have permission for, are licensed to show, or may use under Creative Commons. Credit is not permission.</p></footer>
    </div>
  );
}
