import React, { useEffect, useRef, useState } from 'react';
import { Activity, AlertTriangle, AudioLines, CalendarClock, Camera, Check, ChevronUp, ChevronDown, Clapperboard, Database, Eye, Flag, Gift, Hammer, Layers, Mic2, Pause, Play, Power, Radio, RefreshCw, Scissors, ShieldCheck, Signal, SlidersHorizontal, Sparkles, Square, TerminalSquare, Timer, TrendingUp, Users, Video, Volume2, X, Zap } from 'lucide-react';

type PlaylistItem = { id:string; title:string; type:string; dur:string; seconds:number; status:string };
type Guest = { id:string; name:string; handle:string; topic:string; viewers:string };
type Keyword = { id:string; word:string; count:number; risk:string; where:string };

const WALLPAPERS = [
  { id:'neon', name:'Neon Club', desc:'Magenta / cyan club wash', bg:'radial-gradient(120% 120% at 15% 10%, #ff2b8a 0%, #2a0a2e 38%, #06080b 72%), linear-gradient(115deg,#00e5ff33,transparent 55%)' },
  { id:'cinema', name:'Cinema', desc:'Warm projector + seats', bg:'linear-gradient(120deg,#ffb020 0%, #7a1e00 38%, #120a05 70%, #06080b 100%)' },
  { id:'lofi', name:'Lofi Room', desc:'Soft dusk + lamp glow', bg:'radial-gradient(110% 110% at 78% 18%, #ffb7a0 0%, #7a4a6b 38%, #1a1426 68%, #06080b 100%)' },
  { id:'cyber', name:'Cyber Grid', desc:'Cyan grid on black', bg:'linear-gradient(180deg,#03161c 0%, #062a31 45%, #06080b 100%)' },
  { id:'sunset', name:'Sunset Studio', desc:'Orange horizon studio', bg:'linear-gradient(180deg,#ff7a1a 0%, #ff2b3d 38%, #2a0a2e 70%, #06080b 100%)' },
  { id:'news', name:'Midnight News', desc:'Deep blue news desk', bg:'linear-gradient(135deg,#00e5ff 0%, #0a2a8a 35%, #06080b 72%)' },
];

const SCENES = [
  { id:'Full Cam', label:'Full Cam', hint:'Solo camera', icon:Camera },
  { id:'Split Screen', label:'Split Screen', hint:'Host + guest', icon:Users },
  { id:'Reaction', label:'Reaction', hint:'Clip + facecam', icon:Eye },
  { id:'News Desk', label:'News Desk', hint:'Desk + ticker', icon:Radio },
  { id:'Shopping', label:'Shopping', hint:'Product + price', icon:Gift },
  { id:'Gaming', label:'Gaming', hint:'Game + cam', icon:Play },
  { id:'DJ Radio', label:'DJ Radio', hint:'Deck + waveform', icon:AudioLines },
  { id:'Movie Mode', label:'Movie Mode', hint:'Cinema frame', icon:Clapperboard },
  { id:'BRB', label:'BRB', hint:'Be right back', icon:Timer },
];

const INITIAL_PLAYLIST: PlaylistItem[] = [
  { id:'p1', title:'Morning Show — Live Open', type:'LIVE SHOW', dur:'42:00', seconds:2520, status:'NOW PLAYING' },
  { id:'p2', title:'Best Of Clip — Top Reactions', type:'CLIP', dur:'03:24', seconds:204, status:'QUEUED' },
  { id:'p3', title:'Reaction Clip — Viral Moment', type:'REACTION', dur:'06:12', seconds:372, status:'QUEUED' },
  { id:'p4', title:'DJ Set — Late Night Mix', type:'MUSIC', dur:'58:00', seconds:3480, status:'QUEUED' },
];

const INITIAL_GUESTS: Guest[] = [
  { id:'g1', name:'Maya R.', handle:'@maya_live', topic:'Street food tour', viewers:'2.4k' },
  { id:'g2', name:'Dev K.', handle:'@devplays', topic:'New game drop', viewers:'1.8k' },
  { id:'g3', name:'Sana L.', handle:'@sana_sings', topic:'Acoustic cover', viewers:'3.1k' },
];

const KEYWORDS: Keyword[] = [
  { id:'k1', word:'giveaway link', count:14, risk:'MEDIUM', where:'Comments • 12:04' },
  { id:'k2', word:'copyrighted track', count:3, risk:'HIGH', where:'Audio • 12:11' },
  { id:'k3', word:'spam raid', count:9, risk:'MEDIUM', where:'Chat • 12:18' },
];

const RIGHTS = [
  { id:'r1', name:'Morning Show — Live Open', status:'CLEAR', color:'#2bff88', action:'Licensed' },
  { id:'r2', name:'Best Of Clip — Top Reactions', status:'REVIEW', color:'#ffcb1f', action:'Check source' },
  { id:'r3', name:'Reaction Clip — Viral Moment', status:'REVIEW', color:'#ffcb1f', action:'Trim 0:42' },
  { id:'r4', name:'DJ Set — Late Night Mix', status:'BLOCKED', color:'#ff2b3d', action:'Swap track' },
];

const TABLES = [
  { name:'profiles', cols:'id, handle, avatar_url, role, created_at', sql:'create table profiles (\n  id uuid primary key references auth.users,\n  handle text unique not null,\n  avatar_url text,\n  role text default \'creator\',\n  created_at timestamptz default now()\n);' },
  { name:'channels', cols:'id, owner_id, name, health_score, is_live', sql:'create table channels (\n  id uuid primary key default gen_random_uuid(),\n  owner_id uuid references profiles(id),\n  name text not null,\n  health_score int default 92,\n  is_live boolean default false\n);' },
  { name:'playlists', cols:'id, channel_id, title, is_active', sql:'create table playlists (\n  id uuid primary key default gen_random_uuid(),\n  channel_id uuid references channels(id),\n  title text not null,\n  is_active boolean default true\n);' },
  { name:'playlist_items', cols:'id, playlist_id, title, type, duration', sql:'create table playlist_items (\n  id uuid primary key default gen_random_uuid(),\n  playlist_id uuid references playlists(id),\n  title text not null,\n  type text,\n  duration_seconds int,\n  position int\n);' },
  { name:'scenes', cols:'id, channel_id, name, layout, wallpaper', sql:'create table scenes (\n  id uuid primary key default gen_random_uuid(),\n  channel_id uuid references channels(id),\n  name text not null,\n  layout jsonb,\n  wallpaper text\n);' },
  { name:'wallpapers', cols:'id, name, gradient, is_active', sql:'create table wallpapers (\n  id uuid primary key default gen_random_uuid(),\n  name text not null,\n  gradient text,\n  is_active boolean default false\n);' },
  { name:'moderation_logs', cols:'id, channel_id, keyword, action, created_at', sql:'create table moderation_logs (\n  id uuid primary key default gen_random_uuid(),\n  channel_id uuid references channels(id),\n  keyword text,\n  action text,\n  created_at timestamptz default now()\n);' },
  { name:'rights_checks', cols:'id, video_name, status, action', sql:'create table rights_checks (\n  id uuid primary key default gen_random_uuid(),\n  video_name text not null,\n  status text check (status in (\'CLEAR\',\'REVIEW\',\'BLOCKED\')),\n  action text\n);' },
  { name:'schedules', cols:'id, channel_id, starts_at, title', sql:'create table schedules (\n  id uuid primary key default gen_random_uuid(),\n  channel_id uuid references channels(id),\n  starts_at timestamptz,\n  title text not null\n);' },
  { name:'clips', cols:'id, channel_id, title, start_at, end_at', sql:'create table clips (\n  id uuid primary key default gen_random_uuid(),\n  channel_id uuid references channels(id),\n  title text,\n  start_at interval,\n  end_at interval\n);' },
  { name:'gifts', cols:'id, sender, amount, message', sql:'create table gifts (\n  id uuid primary key default gen_random_uuid(),\n  sender text not null,\n  amount numeric,\n  message text\n);' },
  { name:'guests', cols:'id, name, handle, topic, status', sql:'create table guests (\n  id uuid primary key default gen_random_uuid(),\n  name text not null,\n  handle text,\n  topic text,\n  status text default \'waiting\'\n);' },
];

const SCHEDULE = [
  { time:'07:00', title:'Wake Up Show', color:'#00e5ff' },
  { time:'09:30', title:'Best Of Replay', color:'#b07bff' },
  { time:'11:00', title:'Reaction Hour', color:'#ff2b8a' },
  { time:'13:00', title:'Shopping Live', color:'#ffcb1f' },
  { time:'16:00', title:'Gaming Block', color:'#2bff88' },
  { time:'19:00', title:'DJ Radio', color:'#ff7a1a' },
  { time:'21:00', title:'Movie Night', color:'#3b82f6' },
];

const COMMENT_POOL = [
  { user:'@lena.wav', text:'This transition was SO clean 🔥', tag:'FAN' },
  { user:'@marc_o', text:'Please play the late night mix next!', tag:'REQUEST' },
  { user:'@tika_fan', text:'Joined from the morning show, staying all day', tag:'NEW' },
  { user:'@jules', text:'Split screen is the best layout for this', tag:'FAN' },
  { user:'@nova', text:'The neon wallpaper fits this segment perfectly', tag:'FAN' },
  { user:'@riley', text:'Can we get a poll for the next clip?', tag:'REQUEST' },
];

async function api(action:string, args:any){
  const res = await fetch("actions", { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({action, args}) });
  const j = await res.json().catch(()=>({}));
  if(!res.ok || j?.error) throw new Error(j?.error || `Request failed (${res.status})`);
  return j.data;
}

export default function App(){
  const [tab, setTab] = useState('Dashboard');
  const [onAir, setOnAir] = useState(true);
  const [killed, setKilled] = useState(false);
  const [scene, setScene] = useState('Split Screen');
  const [wallpaper, setWallpaper] = useState(WALLPAPERS[0]);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(INITIAL_PLAYLIST);
  const [progress, setProgress] = useState(38);
  const [isPlaying, setIsPlaying] = useState(true);
  const [comments, setComments] = useState(COMMENT_POOL.slice(0,4));
  const [commentText, setCommentText] = useState('');
  const [gifts, setGifts] = useState([
    { id:'gift1', from:'@nova', amount:'250 coins', msg:'For the best intro!', done:false },
    { id:'gift2', from:'@jules', amount:'Rose ×12', msg:'Love this segment', done:false },
    { id:'gift3', from:'@marc_o', amount:'100 coins', msg:'DJ set next please', done:false },
  ]);
  const [guestDecisions, setGuestDecisions] = useState<Record<string,string>>({});
  const [pollChoice, setPollChoice] = useState<string|null>(null);
  const [pollVotes, setPollVotes] = useState({ 'Full Cam': 42, 'Split Screen': 128, 'DJ Radio': 76, 'Movie Mode': 31 });
  const [keywordActions, setKeywordActions] = useState<Record<string,string>>({});
  const [rightsDone, setRightsDone] = useState<Record<string,boolean>>({});
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('CLIP');
  const [saveMsg, setSaveMsg] = useState('');
  const [backendStatus, setBackendStatus] = useState('Connecting…');
  const [selectedTable, setSelectedTable] = useState(TABLES[0]);
  const [logs, setLogs] = useState<string[]>([
    '[ENGINE] OBS Connected — ws://localhost:4455',
    '[ENGINE] RTMP Live — rtmp://live.tikcast.tv/app',
    '[ENGINE] Scheduler Running — next: Reaction Hour 11:00',
    '[ENGINE] Safety Service Active — scanning chat + audio',
    '[ENGINE] Supabase Connected — realtime subscribed',
  ]);
  const [viewers, setViewers] = useState(12847);
  const [autoClip, setAutoClip] = useState(true);
  const [safetyMode, setSafetyMode] = useState(true);
  const [chatFilter, setChatFilter] = useState('Standard');
  const [volume, setVolume] = useState(72);
  const [brightness, setBrightness] = useState(64);
  const [toast, setToast] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const [liveSeconds, setLiveSeconds] = useState(42*60+18);

  // Load durable records
  useEffect(()=>{
    (async()=>{
      try{
        const [pl, guests, mod] = await Promise.all([
          api("records.list", {collection:'tikcast_playlist_items'}).catch(()=>({records:[]})),
          api("records.list", {collection:'tikcast_guest_decisions'}).catch(()=>({records:[]})),
          api("records.list", {collection:'tikcast_moderation_actions'}).catch(()=>({records:[]})),
        ]);
        if(pl?.records?.length){
          const extra: PlaylistItem[] = pl.records.map((r:any, i:number)=>({ id:r.id, title:r.value?.title||'Saved item', type:r.value?.type||'CLIP', dur:r.value?.dur||'04:00', seconds:240, status:'QUEUED' }));
          setPlaylist(prev=>[...prev, ...extra.filter(e=>!prev.some(p=>p.title===e.title))]);
        }
        const gd: Record<string,string> = {};
        guests?.records?.forEach((r:any)=>{ if(r.value?.guestId) gd[r.value.guestId]=r.value.decision; });
        setGuestDecisions(gd);
        const ka: Record<string,string> = {};
        mod?.records?.forEach((r:any)=>{ if(r.value?.keywordId) ka[r.value.keywordId]=r.value.action; });
        setKeywordActions(ka);
        setBackendStatus('Supabase Connected • Realtime on');
      }catch{ setBackendStatus('Backend unavailable — showing local control room state'); }
    })();
  },[]);

  useEffect(()=>{
    if(!onAir || !isPlaying) return;
    const t = setInterval(()=>{ setProgress(p=> p>=100? 0 : p+0.4); setLiveSeconds(s=>s+1); setViewers(v=> Math.max(9000, v + Math.floor(Math.random()*41)-18)); }, 1000);
    return ()=>clearInterval(t);
  },[onAir, isPlaying]);

  useEffect(()=>{
    if(!onAir) return;
    const t = setInterval(()=>{
      const next = COMMENT_POOL[Math.floor(Math.random()*COMMENT_POOL.length)];
      setComments(prev=>[{...next, user: next.user}, ...prev].slice(0,6));
    }, 5000);
    return ()=>clearInterval(t);
  },[onAir]);

  useEffect(()=>{
    if(!onAir) return;
    const pool = ['[ENGINE] Chat scan clean — 0 flags in last 60s','[ENGINE] RTMP bitrate stable — 6,200 kbps','[ENGINE] Auto-clip candidate found at 12:24','[ENGINE] Gift event received — queue updated','[ENGINE] Scheduler tick — next block in 18 min','[ENGINE] Health check passed — 92 / 100'];
    const t = setInterval(()=>{ setLogs(prev=>[...prev.slice(-14), pool[Math.floor(Math.random()*pool.length)]]); }, 6000);
    return ()=>clearInterval(t);
  },[onAir]);

  useEffect(()=>{ logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior:'smooth' }); },[logs]);

  const showToast = (m:string)=>{ setToast(m); setTimeout(()=>setToast(''), 2600); };

  const fmt = (s:number)=> `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const handleKill = ()=>{ setKilled(true); setOnAir(false); setIsPlaying(false); setLogs(p=>[...p,'[ENGINE] ⚠ KILL SWITCH — broadcast stopped']); showToast('Kill Switch engaged — broadcast stopped'); };
  const handleStartStop = ()=>{
    if(killed){ setKilled(false); setOnAir(true); setIsPlaying(true); setLogs(p=>[...p,'[ENGINE] Broadcast restarted']); showToast('Broadcast restarted'); return; }
    if(onAir){ setOnAir(false); setIsPlaying(false); showToast('Broadcast paused'); } else { setOnAir(true); setIsPlaying(true); setLogs(p=>[...p,'[ENGINE] Broadcast resumed']); showToast('Back ON AIR'); }
  };

  const moveItem = (idx:number, dir:number)=>{
    setPlaylist(prev=>{ const next=[...prev]; const to=idx+dir; if(to<0||to>=next.length) return prev; [next[idx], next[to]]=[next[to], next[idx]]; return next; });
    showToast('Queue order updated');
  };
  const playItem = (idx:number)=>{
    setPlaylist(prev=>prev.map((p,i)=>({...p, status: i===idx ? 'NOW PLAYING':'QUEUED'})));
    setProgress(2); setIsPlaying(true); showToast(`Now playing: ${playlist[idx]?.title}`);
  };

  const addVideo = async ()=>{
    const title = newTitle.trim() || `New Clip — ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
    const row = { title, type:newType, dur:'04:00' };
    setSaveMsg('Saving to Supabase…');
    try{
      const created = await api("records.create", { collection:'tikcast_playlist_items', value: row, idempotency_key:`playlist-${Date.now()}-${title.slice(0,20)}` });
      setPlaylist(prev=>[...prev, { id:created?.id||`local-${Date.now()}`, title, type:newType, dur:'04:00', seconds:240, status:'QUEUED' }]);
      setSaveMsg('Saved to playlist ✓'); setNewTitle(''); showToast('Video added to queue');
    }catch(e:any){ setSaveMsg(`Could not save — kept locally: ${e.message}`); setPlaylist(prev=>[...prev, { id:`local-${Date.now()}`, title, type:newType, dur:'04:00', seconds:240, status:'QUEUED' }]); }
  };

  const decideGuest = async (g:Guest, decision:string)=>{
    setGuestDecisions(prev=>({...prev, [g.id]:decision}));
    try{ await api("records.create", { collection:'tikcast_guest_decisions', value:{ guestId:g.id, guestName:g.name, decision, at:new Date().toISOString() }, idempotency_key:`guest-${g.id}-${decision}` }); showToast(`${g.name} ${decision.toLowerCase()} — saved`); }
    catch(e:any){ showToast(`Guest ${decision.toLowerCase()} locally — backend unavailable`); }
  };

  const moderateKeyword = async (k:Keyword, action:string)=>{
    setKeywordActions(prev=>({...prev, [k.id]:action}));
    try{ await api("records.create", { collection:'tikcast_moderation_actions', value:{ keywordId:k.id, word:k.word, action, at:new Date().toISOString() }, idempotency_key:`mod-${k.id}-${action}` }); showToast(`${k.word} → ${action}`); }
    catch{ showToast(`${k.word} → ${action} (local)`); }
  };

  const votePoll = async (choice:string)=>{
    if(pollChoice) return;
    setPollChoice(choice); setPollVotes(prev=>({...prev, [choice]:(prev as any)[choice]+1}));
    try{ await api("records.create", { collection:'tikcast_poll_votes', value:{ choice, at:new Date().toISOString() }, idempotency_key:`poll-${Date.now()}` }); }catch{}
    showToast(`Vote counted: ${choice}`);
  };

  const current = playlist.find(p=>p.status==='NOW PLAYING') || playlist[0];
  const nextUp = playlist.find(p=>p.status==='QUEUED');
  const totalVotes = Object.values(pollVotes).reduce((a,b)=>a+b,0);
  const wp = wallpaper;

  const onAirVisual = (
    <div className="relative h-[210px] sm:h-[240px] rounded-[18px] overflow-hidden border border-white/20" style={{ background: wp.bg }}>
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)', backgroundSize:'28px 28px' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      <div className="absolute left-0 right-0 h-[2px] bg-cyan-300/70 scanline" />
      {scene==='Split Screen' ? (
        <div className="absolute inset-3 flex gap-2">
          <div className="flex-1 rounded-xl border border-white/30 bg-black/30 flex flex-col justify-end p-3"><span className="mono text-[10px] text-cyan-300">HOST CAM</span><span className="font-bold text-lg leading-tight">You • Live</span><div className="mt-2 h-1.5 rounded bg-white/20 overflow-hidden"><div className="h-full w-[68%] bg-[var(--cyan)]" /></div></div>
          <div className="flex-1 rounded-xl border border-white/30 bg-black/40 flex flex-col justify-end p-3"><span className="mono text-[10px] text-yellow-300">GUEST</span><span className="font-bold text-lg leading-tight">Maya R.</span><p className="text-xs text-white/80">Street food tour</p></div>
        </div>
      ) : scene==='BRB' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"><div className="text-4xl font-bold tracking-tight">BE RIGHT BACK</div><p className="text-sm text-white/80 mt-2">Grabbing water — back in 2 minutes</p><div className="mt-4 flex gap-2"><span className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold">STAY HERE</span><span className="px-3 py-1 rounded-full border border-white/40 text-xs">CHAT OPEN</span></div></div>
      ) : scene==='DJ Radio' ? (
        <div className="absolute inset-3 flex flex-col justify-end"><div className="flex items-end gap-1 h-20">{[38,62,45,78,52,90,66,42,84,58,72,40,95,60,48,76].map((h,i)=>(<div key={i} className="flex-1 rounded-t bg-cyan-300" style={{height:`${h}%`, opacity:.45+i*0.03}} />))}</div><p className="font-bold text-lg mt-2">Late Night Mix • DJ Set</p><p className="text-xs text-white/80">128 BPM • Now spinning</p></div>
      ) : scene==='Shopping' ? (
        <div className="absolute inset-3 flex gap-3"><div className="flex-1 rounded-xl bg-black/35 border border-white/25 p-3 flex flex-col justify-end"><span className="text-xs bg-yellow-400 text-black font-bold px-2 py-0.5 rounded-full w-fit">LIVE DEAL</span><p className="font-bold text-xl mt-2">Studio Mic Bundle</p><p className="text-sm"><s className="opacity-60">$129</s> <b className="text-yellow-300">$79</b> • 42 left</p></div><div className="w-[92px] rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-3xl">🎙️</div></div>
      ) : (
        <div className="absolute inset-3 flex flex-col justify-end"><span className="mono text-[10px] tracking-[0.2em] text-cyan-200">{scene.toUpperCase()} • {wp.name.toUpperCase()}</span><p className="font-bold text-2xl leading-tight mt-1">{scene==='News Desk' ? 'Tonight: Creator economy hits a new high' : scene==='Movie Mode' ? 'Movie Night — Now Screening' : scene==='Gaming' ? 'Gaming Block — Ranked Run' : scene==='Reaction' ? 'Reacting to the viral moment' : 'Full Cam — Live with you'}</p><p className="text-xs text-white/80 mt-1">TIKCAST LIVE • {wallpaper.name} • {fmt(liveSeconds)}</p></div>
      )}
      <div className="absolute top-3 left-3 flex gap-2"><span className="bg-[var(--red)] text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-white rounded-full pulse-dot" />ON AIR</span><span className="bg-black/55 backdrop-blur px-2.5 py-1 rounded-md text-[11px] mono">{scene}</span></div>
      <div className="absolute top-3 right-3 bg-black/55 backdrop-blur px-2 py-1 rounded-md text-[11px] mono flex items-center gap-1"><Eye size={13}/> {viewers.toLocaleString()}</div>
      <div className="absolute bottom-3 right-3 flex gap-1.5"><span className="w-7 h-7 rounded-full bg-black/50 border border-white/25 flex items-center justify-center"><Mic2 size={13}/></span><span className="w-7 h-7 rounded-full bg-black/50 border border-white/25 flex items-center justify-center"><Volume2 size={13}/></span><span className="w-7 h-7 rounded-full bg-black/50 border border-white/25 flex items-center justify-center"><Video size={13}/></span></div>
    </div>
  );

  const previewVisual = (
    <div className="relative h-[150px] rounded-[16px] overflow-hidden border border-dashed border-cyan-400/50 bg-[#0a1218]">
      <div className="absolute inset-0 opacity-20" style={{ background: wp.bg }} />
      <div className="absolute inset-0 flex flex-col justify-between p-3"><div className="flex justify-between"><span className="bg-cyan-400 text-black text-[10px] font-bold px-2 py-0.5 rounded">PREVIEW</span><span className="mono text-[10px] text-white/70">NEXT: {scene}</span></div><div><p className="font-bold leading-tight">Next scene ready</p><p className="text-xs text-white/70">{scene} • {wp.name} wallpaper • Audio armed</p><div className="mt-2 flex gap-1.5"><span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/20">TAKE →</span><span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/20">CUT</span><span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/20">FADE</span></div></div></div>
    </div>
  );

  const tabs = ['Dashboard','Playout','Safety','Library','Settings'];

  return (
    <div data-safe-area-inset-root style={{ boxSizing:'border-box', paddingTop:'var(--safe-area-inset-top)', minHeight:'100vh', background:'var(--bg)' }} className="overflow-x-clip">
      {/* TOP BAR */}
      <header className="px-3 sm:px-5 pt-3 sm:pt-4 pb-3 border-b border-[var(--line)] bg-[var(--bg)]">
        <div className="max-w-[1480px] mx-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--red)] flex items-center justify-center shrink-0 shadow-[0_0_24px_#ff2b3d66]"><Radio size={22} className="text-white" /></div>
            <div className="leading-none"><p className="font-bold text-[19px] sm:text-[22px] tracking-tight whitespace-nowrap">TIKCAST <span className="text-[var(--red)]">LIVE</span></p><p className="text-[10px] sm:text-[11px] text-[var(--muted)] tracking-[0.18em] mt-1">COMMAND CENTER</p></div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${onAir && !killed ? 'bg-[#2a0a0e] border-red-500/50' : 'bg-white/5 border-white/10'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${onAir && !killed ? 'bg-[var(--red)] pulse-dot' : 'bg-zinc-500'}`} />
            <span className="font-bold text-[12px] sm:text-[13px] tracking-widest">{killed ? 'KILLED' : onAir ? 'ON AIR' : 'OFF AIR'}</span>
            <span className="mono text-[11px] text-white/60 hidden sm:inline">{fmt(liveSeconds)}</span>
          </div>
          <div className="hidden md:block border-l border-[var(--line)] pl-3"><p className="text-[11px] text-[var(--muted)]">CHANNEL</p><p className="font-bold text-sm">TikCast Studio • Daily Live</p></div>
          <div className="hidden lg:flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--line)] rounded-full pl-1 pr-3 py-1"><span className="w-7 h-7 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center text-[11px] font-bold">YOU</span><span className="text-xs"><b>Host</b> <span className="text-white/50">• Producer mode</span></span></div>
            <span className="text-xs px-2.5 py-1.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/30 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />{backendStatus}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto lg:ml-0">
            <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--line)] rounded-2xl px-3 py-2 flex-1 sm:flex-none justify-center">
              <div className="relative w-[46px] h-[46px] shrink-0"><svg viewBox="0 0 48 48" className="w-full h-full -rotate-90"><circle cx="24" cy="24" r="20" fill="none" stroke="#1e2a36" strokeWidth="5"/><circle cx="24" cy="24" r="20" fill="none" stroke="#2bff88" strokeWidth="5" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6*0.08}/></svg><span className="absolute inset-0 flex items-center justify-center font-bold text-[13px]">92</span></div>
              <div className="leading-tight"><p className="text-[10px] text-[var(--muted)] tracking-widest">HEALTH SCORE</p><p className="font-bold text-[13px] text-emerald-300 flex items-center gap-1"><ShieldCheck size={13}/> SAFE</p></div>
            </div>
            <button onClick={handleKill} className="flex-1 sm:flex-none bg-[var(--red)] hover:bg-[#d61a2c] text-white font-bold text-[13px] px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition"><Power size={16}/>KILL SWITCH</button>
            <button onClick={handleStartStop} className={`flex-1 sm:flex-none font-bold text-[13px] px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition border ${onAir ? 'bg-white text-black' : 'bg-[var(--cyan)] text-black'}`}>{onAir ? <><Square size={14}/> STOP</> : <><Play size={14}/> GO LIVE</>}</button>
          </div>
        </div>
        <div className="max-w-[1480px] mx-auto mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <span className="whitespace-nowrap text-[11px] mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5"><Signal size={12} className="text-emerald-400"/> RTMP 6,200 kbps</span>
          <span className="whitespace-nowrap text-[11px] mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10">OBS • ws://localhost:4455</span>
          <span className="whitespace-nowrap text-[11px] mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5"><Eye size={12} className="text-cyan-300"/> {viewers.toLocaleString()} watching</span>
          <span className="whitespace-nowrap text-[11px] mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10">Scene: {scene}</span>
          <span className="whitespace-nowrap text-[11px] mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10">Wallpaper: {wp.name}</span>
        </div>
      </header>

      {/* ON AIR BAR - ALWAYS VISIBLE */}
      <div data-safe-area-sticky-top style={{ top:'var(--safe-area-inset-top)' }} className="sticky z-30 bg-[#0a0f14]/95 backdrop-blur border-b border-[var(--line)]">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-5 py-2.5 flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-0"><span className={`text-[11px] font-bold px-2 py-1 rounded ${onAir ? 'bg-[var(--red)] text-white' : 'bg-zinc-700 text-white'}`}>{onAir ? '● ON AIR' : '○ PAUSED'}</span><span className="truncate text-sm font-semibold hidden sm:block">{current?.title}</span></div>
          <div className="flex-1 min-w-[80px] h-2 rounded-full bg-white/10 overflow-hidden relative"><div className="h-full bg-gradient-to-r from-[var(--red)] to-[var(--cyan)] transition-all" style={{width:`${progress}%`}} /><div className="absolute inset-y-0 w-10 bg-white/30" style={{left:`${progress}%`, animation:'live-bar 1.8s linear infinite'}} /></div>
          <span className="mono text-[11px] text-white/70 whitespace-nowrap">{Math.round(progress)}% • {current?.dur}</span>
          <nav className="flex gap-1 overflow-x-auto no-scrollbar" aria-label="Tabs">
            {tabs.map(t=>(
              <button key={t} onClick={()=>setTab(t)} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] font-bold transition ${tab===t ? 'bg-[var(--cyan)] text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>{t}</button>
            ))}
          </nav>
        </div>
        {killed && <div className="bg-[var(--red)] text-white text-center text-[12px] font-bold py-1.5 px-3">KILL SWITCH ENGAGED — Broadcast stopped. Press GO LIVE to restart safely.</div>}
        {toast && <div className="bg-emerald-500 text-black text-center text-[12px] font-bold py-1.5 px-3">{toast}</div>}
      </div>

      <main className="max-w-[1480px] mx-auto px-3 sm:px-5 py-4 sm:py-5 pb-10">
        {/* TICKER */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden mb-4 flex items-center">
          <span className="bg-[var(--red)] text-white text-[11px] font-bold px-3 py-2.5 shrink-0 z-10">LIVE TICKER</span>
          <div className="overflow-hidden flex-1"><div className="ticker-track flex whitespace-nowrap w-max text-[12px] py-2.5"><span className="px-4">🔥 12,847 watching • Next: Reaction Hour at 11:00 • Poll live: Pick the next scene • New gift from @nova • Health 92 SAFE • Auto-clip is ON •&nbsp;</span><span className="px-4">🔥 12,847 watching • Next: Reaction Hour at 11:00 • Poll live: Pick the next scene • New gift from @nova • Health 92 SAFE • Auto-clip is ON •&nbsp;</span></div></div>
        </div>

        {tab==='Dashboard' && (
          <>
            <div className="grid lg:grid-cols-12 gap-4 items-start">
              {/* LEFT */}
              <section className="lg:col-span-4 space-y-4 min-w-0">
                <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3"><h2 className="font-bold flex items-center gap-2"><Video size={17} className="text-[var(--cyan)]"/> PREVIEW + ON AIR</h2><span className="mono text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10">SWITCHER • TAKE READY</span></div>
                  {previewVisual}
                  <div className="mt-3">{onAirVisual}</div>
                  <div className="mt-3 flex gap-2"><button onClick={()=>showToast(`CUT to ${scene} — live`)} className="flex-1 bg-[var(--red)] text-white font-bold text-[13px] py-2.5 rounded-xl">CUT TO LIVE</button><button onClick={()=>showToast('Fade transition queued')} className="flex-1 bg-white/10 hover:bg-white/15 font-bold text-[13px] py-2.5 rounded-xl">FADE • 0.8s</button><button onClick={()=>showToast('Auto-transition on')} className="px-3 bg-white/10 rounded-xl text-[12px] font-bold">AUTO</button></div>
                </div>

                <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3"><h3 className="font-bold flex items-center gap-2"><Layers size={16} className="text-[var(--red)]"/> SCENE SWITCHER</h3><span className="text-[11px] text-[var(--muted)]">Click to switch live</span></div>
                  <div className="grid grid-cols-3 gap-2">
                    {SCENES.map(s=>{ const Icon=s.icon; const active=scene===s.id; return <button key={s.id} onClick={()=>{setScene(s.id); showToast(`Scene → ${s.id}`);}} className={`rounded-xl border p-2.5 text-left transition ${active ? 'bg-[var(--cyan)] text-black border-transparent shadow-[0_0_18px_#00e5ff55]' : 'bg-white/[0.03] border-white/10 hover:bg-white/10'}`}><Icon size={18}/><p className="font-bold text-[12px] leading-tight mt-1.5">{s.label}</p><p className={`text-[10px] ${active?'text-black/70':'text-white/50'}`}>{s.hint}</p></button>; })}
                  </div>
                  <p className="mono text-[11px] text-white/50 mt-3">Active: <b className="text-white">{scene}</b> • Wallpaper: {wp.name}</p>
                </div>

                <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
                  <h3 className="font-bold flex items-center gap-2 mb-3"><Sparkles size={16} className="text-yellow-300"/> WALLPAPER SWITCHER</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {WALLPAPERS.map(w=>(
                      <button key={w.id} onClick={()=>{setWallpaper(w); showToast(`Wallpaper → ${w.name}`);}} className={`rounded-xl overflow-hidden border-2 text-left ${wallpaper.id===w.id ? 'border-[var(--cyan)]' : 'border-transparent'}`} aria-label={`Use ${w.name} wallpaper`}>
                        <span className="block h-[54px] relative" style={{background:w.bg}}><span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 px-1.5 py-0.5 rounded">{wallpaper.id===w.id ? '● LIVE' : 'SET'}</span></span>
                        <span className="block bg-black/40 px-2 py-1.5"><span className="block text-[11px] font-bold leading-none">{w.name}</span><span className="block text-[9px] text-white/50 mt-0.5 truncate">{w.desc}</span></span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* CENTER */}
              <section className="lg:col-span-4 space-y-4 min-w-0">
                <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-1"><h2 className="font-bold flex items-center gap-2"><Clapperboard size={17} className="text-[var(--red)]"/> PLAYOUT ENGINE</h2><span className="flex items-center gap-1.5 text-[11px] text-emerald-300"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-dot"/> AUTO</span></div>
                  <p className="text-[12px] text-[var(--muted)] mb-3">Queue controls what plays next. Reorder, play, or add a new item.</p>
                  <div className="rounded-2xl bg-black/30 border border-white/10 p-3">
                    <p className="mono text-[10px] tracking-widest text-[var(--cyan)]">NOW PLAYING</p>
                    <p className="font-bold text-[16px] leading-tight mt-1">{current?.title}</p>
                    <div className="flex items-center gap-2 mt-2"><button onClick={()=>setIsPlaying(v=>!v)} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shrink-0">{isPlaying ? <Pause size={16}/> : <Play size={16}/>}</button><div className="flex-1 h-2 rounded-full bg-white/15 overflow-hidden"><div className="h-full bg-[var(--cyan)]" style={{width:`${progress}%`}} /></div><span className="mono text-[11px]">{Math.round(progress)}%</span></div>
                    <div className="flex justify-between text-[11px] text-white/60 mt-1.5"><span>{current?.type} • {current?.dur}</span><span>Next: {nextUp?.title || '—'}</span></div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {playlist.map((item, idx)=>(
                      <div key={item.id} className={`flex items-center gap-2 rounded-xl border p-2.5 ${item.status==='NOW PLAYING' ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-white/[0.02]'}`}>
                        <span className="mono text-[11px] text-white/50 w-5 shrink-0">{String(idx+1).padStart(2,'0')}</span>
                        <button onClick={()=>playItem(idx)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-black flex items-center justify-center shrink-0" aria-label={`Play ${item.title}`}><Play size={13} className="text-white"/></button>
                        <div className="flex-1 min-w-0"><p className="font-semibold text-[13px] leading-tight truncate">{item.title}</p><p className="text-[11px] text-white/50">{item.type} • {item.dur} • <span className={item.status==='NOW PLAYING'?'text-cyan-300':'text-white/50'}>{item.status}</span></p></div>
                        <div className="flex flex-col shrink-0"><button onClick={()=>moveItem(idx,-1)} className="p-0.5 hover:text-cyan-300" aria-label="Move up"><ChevronUp size={15}/></button><button onClick={()=>moveItem(idx,1)} className="p-0.5 hover:text-cyan-300" aria-label="Move down"><ChevronDown size={15}/></button></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl bg-white/[0.03] border border-white/10 p-3">
                    <p className="font-bold text-[13px] mb-2">+ Add Video to Queue</p>
                    <div className="flex gap-2"><input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Video title — e.g. Fan Q&A Clip" className="flex-1 min-w-0 bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-cyan-400" /><select value={newType} onChange={e=>setNewType(e.target.value)} className="bg-black/40 border border-white/15 rounded-lg px-2 py-2 text-[13px]"><option>CLIP</option><option>REACTION</option><option>MUSIC</option><option>LIVE SHOW</option></select></div>
                    <button onClick={addVideo} className="mt-2 w-full bg-[var(--cyan)] text-black font-bold text-[13px] py-2.5 rounded-lg">Add Video • Save to Supabase</button>
                    {saveMsg && <p className="text-[11px] text-cyan-200 mt-2 mono">{saveMsg}</p>}
                    <p className="text-[11px] text-white/45 mt-2">Saved items reload from the records API on next visit.</p>
                  </div>
                </div>

                <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
                  <h3 className="font-bold flex items-center gap-2 mb-3"><CalendarClock size={16} className="text-[var(--cyan)]"/> SCHEDULER — TODAY • 7AM–11PM</h3>
                  <div className="space-y-1.5">
                    {SCHEDULE.map(s=>(
                      <button key={s.time} onClick={()=>showToast(`Scheduled: ${s.title} at ${s.time}`)} className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 text-left">
                        <span className="mono text-[11px] text-white/60 w-11 shrink-0">{s.time}</span><span className="w-2 h-8 rounded-full shrink-0" style={{background:s.color}} /><span className="flex-1 font-semibold text-[13px] truncate">{s.title}</span><span className="text-[11px] text-white/50">Set</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden flex">{SCHEDULE.map((s,i)=>(<div key={i} className="h-full" style={{width:`${100/SCHEDULE.length}%`, background:s.color, opacity:.75}} />))}</div>
                  <p className="text-[11px] text-white/50 mt-2">Timeline: 7:00 → 23:00 • 7 blocks • Auto-advance is ON</p>
                </div>
              </section>

              {/* RIGHT */}
              <section className="lg:col-span-4 space-y-4 min-w-0">
                <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
                  <h2 className="font-bold flex items-center gap-2 mb-3"><Activity size={17} className="text-[var(--cyan)]"/> LIVE INTERACTION <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-400 rounded-full pulse-dot"/> LIVE</span></h2>
                  <p className="mono text-[10px] tracking-widest text-white/50 mb-2">LIVE COMMENTS • AUTO-UPDATING</p>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {comments.map((c,i)=>(
                      <div key={`${c.user}-${i}`} className="flex gap-2.5 bg-white/[0.03] border border-white/5 rounded-xl p-2.5"><span className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center text-[11px] font-bold shrink-0">{c.user[1]?.toUpperCase() || 'T'}</span><div className="min-w-0"><p className="text-[11px]"><b>{c.user}</b> <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300">{c.tag}</span></p><p className="text-[12px] text-white/85 leading-snug break-words">{c.text}</p></div></div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3"><input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter' && commentText.trim()){ setComments(p=>[{user:'@you', text:commentText, tag:'HOST'}, ...p].slice(0,6)); setCommentText(''); showToast('Comment posted as host'); } }} placeholder="Reply as host…" className="flex-1 min-w-0 bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-cyan-400" /><button onClick={()=>{ if(!commentText.trim()) return; setComments(p=>[{user:'@you', text:commentText, tag:'HOST'}, ...p].slice(0,6)); setCommentText(''); showToast('Comment posted'); }} className="bg-white text-black font-bold text-[12px] px-3 rounded-lg">Send</button></div>
                </div>

                <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
                  <h3 className="font-bold flex items-center gap-2 mb-3"><Gift size={16} className="text-yellow-300"/> GIFT ALERTS QUEUE</h3>
                  <div className="space-y-2">
                    {gifts.map(g=>(
                      <div key={g.id} className="flex items-center gap-2.5 rounded-xl bg-yellow-400/5 border border-yellow-400/20 p-2.5"><span className="text-xl shrink-0">🎁</span><div className="flex-1 min-w-0"><p className="text-[13px] font-bold truncate">{g.from} • {g.amount}</p><p className="text-[11px] text-white/60 truncate">{g.msg}</p></div><button onClick={()=>{ setGifts(prev=>prev.map(x=>x.id===g.id?{...x, done:true}:x)); showToast(`Gift thanked: ${g.from}`); }} className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 ${g.done?'bg-emerald-400/20 text-emerald-300':'bg-yellow-400 text-black'}`}>{g.done ? '✓ Thanked' : 'Thank'}</button></div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
                  <h3 className="font-bold flex items-center gap-2 mb-3"><Users size={16} className="text-[var(--cyan)]"/> GUEST QUEUE</h3>
                  <div className="space-y-2">
                    {INITIAL_GUESTS.map(g=>{
                      const d = guestDecisions[g.id];
                      return <div key={g.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3"><div className="flex items-center gap-2.5"><span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[12px] shrink-0">{g.name[0]}</span><div className="flex-1 min-w-0"><p className="font-bold text-[13px] leading-tight truncate">{g.name} <span className="text-white/50 font-normal">{g.handle}</span></p><p className="text-[11px] text-white/60 truncate">{g.topic} • {g.viewers} followers</p></div>{d && <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${d==='Approved'?'bg-emerald-400/15 text-emerald-300':'bg-red-400/15 text-red-300'}`}>{d.toUpperCase()}</span>}</div><div className="flex gap-2 mt-2.5"><button onClick={()=>decideGuest(g,'Approved')} className="flex-1 bg-emerald-400 text-black font-bold text-[12px] py-2 rounded-lg flex items-center justify-center gap-1"><Check size={13}/> Approve</button><button onClick={()=>decideGuest(g,'Denied')} className="flex-1 bg-white/10 hover:bg-white/15 font-bold text-[12px] py-2 rounded-lg flex items-center justify-center gap-1"><X size={13}/> Deny</button></div></div>;
                    })}
                  </div>
                </div>

                <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
                  <h3 className="font-bold mb-1">POLL — What scene next?</h3>
                  <p className="text-[12px] text-white/55 mb-3">{pollChoice ? 'Vote saved. Live results below.' : 'Tap an option to vote live.'} • {totalVotes} votes</p>
                  <div className="space-y-2">
                    {Object.entries(pollVotes).map(([opt, votes])=>{
                      const pct = Math.round((votes/totalVotes)*100);
                      return <button key={opt} onClick={()=>votePoll(opt)} className={`w-full text-left rounded-xl border p-2.5 ${pollChoice===opt?'border-cyan-400 bg-cyan-400/10':'border-white/10 hover:bg-white/5'}`}><div className="flex justify-between text-[13px] font-semibold"><span>{opt} {pollChoice===opt && '✓'}</span><span className="mono text-[11px]">{pct}% • {votes}</span></div><div className="h-1.5 rounded-full bg-white/10 mt-1.5 overflow-hidden"><div className="h-full bg-[var(--cyan)]" style={{width:`${pct}%`}} /></div></button>;
                    })}
                  </div>
                </div>
              </section>
            </div>

            {/* SAFETY */}
            <section className="mt-4 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-5">
              <div className="flex flex-wrap items-center gap-3 mb-4"><h2 className="font-bold flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-400"/> SAFETY NET DASHBOARD</h2><span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">All systems SAFE • 92 / 100</span><span className="ml-auto text-[12px] text-white/50">Last scan: just now</span></div>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label:'Policy Risk', val:'8%', bar:8, color:'#ffcb1f', note:'Low — 2 soft flags' },
                  { label:'Strike Risk', val:'5%', bar:5, color:'#2bff88', note:'Very low — no strikes' },
                  { label:'Engagement', val:'95%', bar:95, color:'#00e5ff', note:'Excellent — chat is hot' },
                ].map(m=>(
                  <div key={m.label} className="rounded-2xl bg-black/25 border border-white/10 p-3.5"><div className="flex justify-between items-start"><p className="text-[12px] text-white/60">{m.label}</p><span className="font-bold text-xl" style={{color:m.color}}>{m.val}</span></div><div className="h-2 rounded-full bg-white/10 overflow-hidden mt-2"><div className="h-full rounded-full" style={{width:`${m.bar}%`, background:m.color}} /></div><p className="text-[11px] text-white/50 mt-2">{m.note}</p></div>
                ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-4 mt-4">
                <div><h3 className="font-bold text-[14px] flex items-center gap-2 mb-2.5"><AlertTriangle size={15} className="text-yellow-300"/> KEYWORD ALERTS</h3><div className="space-y-2">{KEYWORDS.map(k=>{ const a=keywordActions[k.id]; return <div key={k.id} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3"><div className="flex-1 min-w-0"><p className="font-semibold text-[13px] truncate">“{k.word}” <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${k.risk==='HIGH'?'bg-red-500/20 text-red-300':'bg-yellow-500/20 text-yellow-300'}`}>{k.risk}</span></p><p className="text-[11px] text-white/50">{k.count} hits • {k.where} {a && `• → ${a}`}</p></div><button onClick={()=>moderateKeyword(k,'Flagged')} className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 flex items-center gap-1"><Flag size={12}/> Flag</button><button onClick={()=>moderateKeyword(k,'Suspended')} className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30">Suspend</button></div>; })}</div></div>
                <div><h3 className="font-bold text-[14px] flex items-center gap-2 mb-2.5"><Hammer size={15} className="text-cyan-300"/> RIGHTS CHECK</h3><div className="rounded-xl border border-white/10 overflow-hidden"><div className="grid grid-cols-[1fr_74px_92px] sm:grid-cols-[1fr_80px_110px] bg-white/5 text-[10px] mono tracking-wider text-white/50 px-3 py-2"><span>VIDEO NAME</span><span>STATUS</span><span className="text-right">ACTION</span></div>{RIGHTS.map(r=>{ const done=rightsDone[r.id]; return <div key={r.id} className="grid grid-cols-[1fr_74px_92px] sm:grid-cols-[1fr_80px_110px] items-center px-3 py-2.5 border-t border-white/5"><span className="text-[12px] font-semibold truncate pr-2">{r.name}</span><span className="flex items-center gap-1.5 text-[11px] font-bold" style={{color:r.color}}><span className="w-2 h-2 rounded-full shrink-0" style={{background:r.color}} />{r.status}</span><button onClick={()=>{ setRightsDone(p=>({...p, [r.id]:true})); showToast(`${r.name} — ${r.action}`); }} className="justify-self-end text-[11px] font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 whitespace-nowrap">{done ? '✓ Done' : r.action}</button></div>; })}</div></div>
              </div>
            </section>

            {/* TERMINAL + SUPABASE */}
            <div className="grid lg:grid-cols-12 gap-4 mt-4 items-start">
              <section className="lg:col-span-5 rounded-[20px] border border-[var(--line)] bg-[#05080a] p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3"><TerminalSquare size={17} className="text-emerald-400"/><h3 className="font-bold">TERMINAL ENGINE STATUS</h3><span className="ml-auto flex gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"/><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"/></span></div>
                <div ref={logRef} className="mono text-[11px] leading-relaxed h-[210px] overflow-y-auto pr-1 space-y-1.5">
                  {logs.map((l,i)=>(<p key={i} className={l.includes('KILL')?'text-red-400 font-bold':'text-emerald-300/90'}>{l}</p>))}
                  <p className="text-white/70">tikcast@engine:~$ <span className="blink">▌</span></p>
                </div>
                <div className="flex gap-2 mt-3"><button onClick={()=>{ setLogs(p=>[...p,'[ENGINE] Manual health check — OK']); showToast('Health check run'); }} className="flex-1 bg-white/10 hover:bg-white/15 text-[12px] font-bold py-2 rounded-lg flex items-center justify-center gap-1"><RefreshCw size={13}/> Run Check</button><button onClick={()=>setLogs(['[ENGINE] Logs cleared','[ENGINE] OBS Connected','[ENGINE] RTMP Live'])} className="px-3 bg-white/10 text-[12px] font-bold py-2 rounded-lg">Clear</button></div>
              </section>

              <section className="lg:col-span-7 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 mb-3"><Database size={18} className="text-emerald-400"/><h3 className="font-bold">SUPABASE BACKEND PANEL</h3><span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">Architecture • Live wiring</span></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="mono text-[10px] tracking-widest text-white/50 mb-2">TABLES • TAP TO VIEW SQL</p><div className="flex flex-wrap gap-1.5">{TABLES.map(t=>(<button key={t.name} onClick={()=>setSelectedTable(t)} className={`mono text-[11px] px-2 py-1 rounded-md border ${selectedTable.name===t.name?'bg-emerald-400 text-black border-transparent font-bold':'bg-white/5 border-white/10 hover:bg-white/10'}`}>{t.name}</button>))}</div><pre className="mono text-[10px] leading-relaxed bg-black/50 border border-white/10 rounded-lg p-2.5 mt-3 overflow-x-auto whitespace-pre-wrap break-words">{selectedTable.sql}</pre><p className="mono text-[10px] text-white/45 mt-1.5">{selectedTable.cols}</p></div>
                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="font-bold text-[13px] flex items-center gap-1.5"><Zap size={13} className="text-yellow-300"/> Services</p><ul className="text-[12px] text-white/70 space-y-1 mt-2"><li>• <b className="text-white">Auth</b> — Supabase Auth • Creator + Moderator roles</li><li>• <b className="text-white">Storage</b> — wallpapers, videos, thumbnails</li><li>• <b className="text-white">Realtime</b> — comments, gifts, guest queue</li><li>• <b className="text-white">Edge Functions</b> — auto-clip, moderation, health score</li></ul></div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3"><p className="mono text-[10px] tracking-widest text-white/50 mb-2">.ENV EXAMPLE</p><pre className="mono text-[11px] leading-relaxed text-cyan-200 break-words whitespace-pre-wrap">{`SUPABASE_URL=https://your-project.supabase.co\nSUPABASE_ANON_KEY=your-anon-key-here\nOBS_WEBSOCKET_URL=ws://localhost:4455`}</pre><p className="text-[11px] text-white/45 mt-2">Never commit real keys. Use project settings → API.</p></div>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}

        {tab==='Playout' && (
          <div className="grid lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-7 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4">
              <h2 className="font-bold text-xl mb-1">Playout — Full Queue</h2><p className="text-[13px] text-white/60 mb-4">Reorder the show, play any item, and add new videos. Saves to Supabase.</p>
              <div className="space-y-2">{playlist.map((item,idx)=>(<div key={item.id} className="flex items-center gap-2 rounded-xl border border-white/10 p-3"><span className="mono text-white/50 w-6">{String(idx+1).padStart(2,'0')}</span><div className="flex-1 min-w-0"><p className="font-bold truncate">{item.title}</p><p className="text-[12px] text-white/50">{item.type} • {item.dur} • {item.status}</p></div><button onClick={()=>playItem(idx)} className="bg-white text-black text-[12px] font-bold px-3 py-2 rounded-lg">Play</button><button onClick={()=>moveItem(idx,-1)} className="p-1 bg-white/10 rounded-lg"><ChevronUp size={15}/></button><button onClick={()=>moveItem(idx,1)} className="p-1 bg-white/10 rounded-lg"><ChevronDown size={15}/></button></div>))}</div>
              <div className="mt-4 flex gap-2"><input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="New video title" className="flex-1 min-w-0 bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 text-[13px] outline-none" /><button onClick={addVideo} className="bg-[var(--cyan)] text-black font-bold px-4 py-2.5 rounded-lg text-[13px]">Add Video</button></div>{saveMsg && <p className="mono text-[11px] text-cyan-200 mt-2">{saveMsg}</p>}
              <div className="mt-5"><h3 className="font-bold mb-2">Now Playing</h3>{onAirVisual}</div>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4"><h3 className="font-bold mb-3">Scheduler — Today 7am–11pm</h3><div className="space-y-1.5">{SCHEDULE.map(s=>(<div key={s.time} className="flex items-center gap-3 rounded-lg px-2 py-2 bg-white/[0.02]"><span className="mono text-[11px] w-11">{s.time}</span><span className="w-2 h-8 rounded-full" style={{background:s.color}} /><span className="flex-1 font-semibold text-[13px]">{s.title}</span><button onClick={()=>showToast(`Pinned ${s.title}`)} className="text-[11px] font-bold bg-white/10 px-2 py-1 rounded-lg">Pin</button></div>))}</div></div>
              <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4"><h3 className="font-bold mb-2">Wallpapers</h3><div className="grid grid-cols-3 gap-2">{WALLPAPERS.map(w=>(<button key={w.id} onClick={()=>setWallpaper(w)} className={`rounded-lg h-[52px] border-2 ${wallpaper.id===w.id?'border-cyan-400':'border-transparent'}`} style={{background:w.bg}}><span className="text-[10px] font-bold bg-black/60 px-1.5 py-0.5 rounded">{w.name}</span></button>))}</div></div>
            </div>
          </div>
        )}

        {tab==='Safety' && (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5"><h2 className="font-bold text-xl flex items-center gap-2"><ShieldCheck className="text-emerald-400"/> Safety Net — Full View</h2><p className="text-[13px] text-white/60 mt-1">Health 92 SAFE. Policy Risk 8% • Strike Risk 5% • Engagement 95%.</p><div className="grid sm:grid-cols-3 gap-3 mt-4">{[{l:'Policy Risk',v:'8%'},{l:'Strike Risk',v:'5%'},{l:'Engagement',v:'95%'}].map(m=>(<div key={m.l} className="rounded-xl bg-black/25 border border-white/10 p-4"><p className="text-[12px] text-white/60">{m.l}</p><p className="font-bold text-2xl mt-1">{m.v}</p></div>))}</div></div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4"><h3 className="font-bold mb-3">Keyword Alerts</h3><div className="space-y-2">{KEYWORDS.map(k=>(<div key={k.id} className="flex items-center gap-2 rounded-xl border border-white/10 p-3"><div className="flex-1 min-w-0"><p className="font-bold text-[13px]">“{k.word}”</p><p className="text-[11px] text-white/50">{k.count} hits • {k.where} {keywordActions[k.id] && `• ${keywordActions[k.id]}`}</p></div><button onClick={()=>moderateKeyword(k,'Flagged')} className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-yellow-400/15 text-yellow-300">Flag</button><button onClick={()=>moderateKeyword(k,'Suspended')} className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-300">Suspend</button></div>))}</div></div>
              <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4"><h3 className="font-bold mb-3">Rights Check</h3>{RIGHTS.map(r=>(<div key={r.id} className="flex items-center gap-2 py-2.5 border-b border-white/5 last:border-0"><span className="flex-1 text-[13px] font-semibold truncate">{r.name}</span><span className="text-[11px] font-bold" style={{color:r.color}}>{r.status}</span><button onClick={()=>{setRightsDone(p=>({...p,[r.id]:true})); showToast('Rights action saved');}} className="text-[11px] font-bold bg-white/10 px-2 py-1 rounded-lg">{rightsDone[r.id]?'✓ Done':r.action}</button></div>))}</div>
            </div>
          </div>
        )}

        {tab==='Library' && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl">Library — Clips & Wallpapers</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { t:'Morning Show — Best Open', d:'42:00 • LIVE SHOW', c:'#00e5ff' },
                { t:'Top Reactions Compilation', d:'03:24 • CLIP', c:'#ff2b8a' },
                { t:'Viral Moment Reaction', d:'06:12 • REACTION', c:'#ffcb1f' },
                { t:'Late Night DJ Mix', d:'58:00 • MUSIC', c:'#2bff88' },
                { t:'Shopping — Mic Bundle', d:'18:20 • SHOPPING', c:'#ff7a1a' },
                { t:'Gaming — Ranked Run', d:'24:10 • GAMING', c:'#b07bff' },
                { t:'News Desk — Tonight', d:'12:05 • NEWS', c:'#3b82f6' },
                { t:'BRB Loop — Lofi', d:'02:00 • LOOP', c:'#ffb7a0' },
              ].map(clip=>(
                <div key={clip.t} className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] overflow-hidden"><div className="h-[110px] relative flex items-end p-3" style={{background:`linear-gradient(135deg, ${clip.c}55, #06080b 70%)`}}><span className="absolute top-2 left-2 text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded-full">CLIP</span><span className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center"><Play size={15}/></span></div><div className="p-3"><p className="font-bold text-[13px] leading-tight">{clip.t}</p><p className="text-[11px] text-white/50 mt-1">{clip.d}</p><button onClick={()=>{ setNewTitle(clip.t); showToast(`Queued: ${clip.t}`); }} className="mt-2 w-full bg-white/10 hover:bg-white/15 text-[12px] font-bold py-2 rounded-lg">+ Add to Queue</button></div></div>
              ))}
            </div>
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4"><h3 className="font-bold mb-3">All Wallpapers</h3><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">{WALLPAPERS.map(w=>(<button key={w.id} onClick={()=>{setWallpaper(w); showToast(`Wallpaper → ${w.name}`);}} className="rounded-xl overflow-hidden border-2 text-left" style={{borderColor: wallpaper.id===w.id?'var(--cyan)':'transparent'}}><span className="block h-[68px]" style={{background:w.bg}} /><span className="block bg-black/40 px-2 py-2 text-[12px] font-bold">{w.name}</span></button>))}</div></div>
          </div>
        )}

        {tab==='Settings' && (
          <div className="grid lg:grid-cols-2 gap-4 items-start">
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 space-y-5">
              <h2 className="font-bold text-xl flex items-center gap-2"><SlidersHorizontal size={18}/> Settings — Broadcast</h2>
              <label className="flex items-center justify-between gap-3"><span><b className="text-[14px] block">Auto-clip highlights</b><span className="text-[12px] text-white/50">Edge Function creates clips from peaks</span></span><button onClick={()=>setAutoClip(v=>!v)} className={`w-12 h-7 rounded-full p-1 transition shrink-0 ${autoClip?'bg-cyan-400':'bg-white/20'}`} aria-label="Toggle auto-clip"><span className={`block w-5 h-5 rounded-full bg-white transition ${autoClip?'ml-auto':''}`} /></button></label>
              <label className="flex items-center justify-between gap-3"><span><b className="text-[14px] block">Safety Service</b><span className="text-[12px] text-white/50">Keyword + audio scanning while live</span></span><button onClick={()=>setSafetyMode(v=>!v)} className={`w-12 h-7 rounded-full p-1 transition shrink-0 ${safetyMode?'bg-emerald-400':'bg-white/20'}`} aria-label="Toggle safety"><span className={`block w-5 h-5 rounded-full bg-white transition ${safetyMode?'ml-auto':''}`} /></button></label>
              <div><div className="flex justify-between text-[13px] font-bold mb-2"><span>Chat Filter</span><span className="text-cyan-300">{chatFilter}</span></div><div className="flex gap-2">{['Relaxed','Standard','Strict'].map(f=>(<button key={f} onClick={()=>{setChatFilter(f); showToast(`Chat filter → ${f}`);}} className={`flex-1 py-2 rounded-lg text-[12px] font-bold ${chatFilter===f?'bg-cyan-400 text-black':'bg-white/10'}`}>{f}</button>))}</div></div>
              <div><div className="flex justify-between text-[13px] font-bold mb-2"><span>Mic Volume</span><span className="mono">{volume}%</span></div><input type="range" min={0} max={100} value={volume} onChange={e=>setVolume(Number(e.target.value))} className="w-full accent-cyan-400" /></div>
              <div><div className="flex justify-between text-[13px] font-bold mb-2"><span>Scene Brightness</span><span className="mono">{brightness}%</span></div><input type="range" min={0} max={100} value={brightness} onChange={e=>setBrightness(Number(e.target.value))} className="w-full accent-red-500" /></div>
              <p className="text-[12px] text-white/50">Settings apply instantly to the preview. Scene: <b className="text-white">{scene}</b> • Wallpaper: <b className="text-white">{wp.name}</b></p>
            </div>
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-cyan-300"/> Today at a glance</h3>
              <div className="grid grid-cols-2 gap-3">{[{l:'Watch time',v:'4h 12m'},{l:'New followers',v:'+312'},{l:'Gifts',v:'1,284'},{l:'Clips made',v:'9'}].map(s=>(<div key={s.l} className="rounded-xl bg-black/25 border border-white/10 p-3"><p className="text-[11px] text-white/50">{s.l}</p><p className="font-bold text-xl mt-0.5">{s.v}</p></div>))}</div>
              <div className="mt-4 rounded-xl bg-cyan-400/10 border border-cyan-400/25 p-3"><p className="font-bold text-[13px]">Producer tip</p><p className="text-[12px] text-white/70 mt-1">Cut to Split Screen when a guest joins — it lifts retention and makes reactions easier to clip for the Best Of reel.</p></div>
              <div className="mt-3 flex gap-2"><button onClick={handleStartStop} className="flex-1 bg-white text-black font-bold py-2.5 rounded-xl text-[13px]">{onAir?'Pause Broadcast':'Go Live'}</button><button onClick={handleKill} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl text-[13px]">Kill Switch</button></div>
            </div>
          </div>
        )}

        <footer className="mt-8 pt-4 border-t border-[var(--line)] flex flex-wrap gap-2 justify-between text-[11px] text-white/40">
          <span>TIKCAST LIVE • Command Center • Your TV Station Control Room</span>
          <span className="mono">Supabase • OBS • RTMP • Realtime • Edge Functions</span>
        </footer>
      </main>
    </div>
  );
}
