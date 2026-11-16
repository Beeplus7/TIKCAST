import React, { useMemo, useState } from 'react';
import { Search, Folder, FolderOpen, FileCode2, FileJson2, FileText, Database, Terminal, ChevronRight, ChevronDown, Radio, ShieldCheck, MonitorPlay, Zap, Music2, Clapperboard, File, X, Expand, Shrink, ArrowRight, Activity, Server, Workflow } from 'lucide-react';

type Badge = 'Frontend' | 'Backend' | 'OBS' | 'Safety' | 'Media' | 'Config';
type Node = {
  id: string; name: string; kind: 'folder' | 'file';
  desc: string; badge: Badge; tech: string; functions: string[];
  children?: Node[];
};

const tree: Node[] = [
  { id:'root', name:'TIKCAST-LIVE/', kind:'folder', desc:'The complete TikTok Creator Studio — code, broadcast control, automation, safety and media in one deployable system.', badge:'Config', tech:'Monorepo · Docker Compose', functions:['One command starts the whole studio','Shared config across every service','Clear boundary between UI, control and safety'], children:[
    { id:'apps', name:'apps/', kind:'folder', desc:'Every runnable service. The dashboard talks to services through the API gateway — never directly to OBS or TikTok.', badge:'Backend', tech:'React · Node.js · Python', functions:['Isolated services can restart independently','Dashboard stays live if one service restarts','Gateway enforces one contract for all services'], children:[
      { id:'dashboard', name:'dashboard/', kind:'folder', desc:'React control room UI. The operator’s single screen for preview, air status, next up, comments, scene buttons and safety score.', badge:'Frontend', tech:'React · TypeScript · WebSocket', functions:['Preview monitor + On Air indicator','Next Up queue and scene buttons','Live comments and gift feed','Safety Score visible at all times'], children:[
        { id:'dash-app', name:'App.tsx', kind:'file', desc:'Control-room shell. Lays out Preview, On Air, Next Up, Comments, Scene Buttons and Safety Score so nothing is buried.', badge:'Frontend', tech:'React · TypeScript', functions:['Compose control-room layout','Hold live studio state','Route operator actions to the gateway']},
        { id:'dash-preview', name:'Preview.tsx', kind:'file', desc:'Live preview pane. Shows exactly what the audience will see before a scene goes on air.', badge:'Frontend', tech:'React · Canvas', functions:['Render program preview','Show source and scene labels','Flag frozen or missing sources']},
        { id:'dash-scenes', name:'SceneButtons.tsx', kind:'file', desc:'One-tap scene switching. Every button is labelled with its scene and confirms the active scene.', badge:'Frontend', tech:'React · WebSocket', functions:['Send scene-switch request','Highlight active scene','Disable unsafe switches while a clip is recording']},
        { id:'dash-comments', name:'CommentsFeed.tsx', kind:'file', desc:'Live comment wall with moderation state. Flagged comments are visually separated from clean chat.', badge:'Frontend', tech:'React · WebSocket', functions:['Stream live comments','Show flag / suspend state','Pin host messages and questions']},
      ]},
      { id:'obs-controller', name:'obs-controller/', kind:'folder', desc:'Node.js service talking to OBS WebSocket. Owns scene switching, source swapping and wallpaper MP4 switching.', badge:'OBS', tech:'Node.js · obs-websocket-js', functions:['Connect and reconnect to OBS','Switch scenes without dropping audio','Swap sources and wallpaper MP4s'], children:[
        { id:'obs-index', name:'index.ts', kind:'file', desc:'Service entry point. Connects to OBS, registers handlers and exposes the control surface used by the gateway.', badge:'OBS', tech:'Node.js · TypeScript', functions:['Boot OBS WebSocket client','Handle reconnect + heartbeat','Expose scene and source controls']},
        { id:'obs-scenes', name:'sceneManager.ts', kind:'file', desc:'Scene logic. Validates every switch, keeps the active scene in sync, and prevents a switch to a scene with missing sources.', badge:'OBS', tech:'Node.js · OBS WebSocket', functions:['Validate target scene','Track active scene','Apply Full Cam / Split / Reaction and more']},
        { id:'obs-wall', name:'wallpaperManager.ts', kind:'file', desc:'Wallpaper MP4 switching. Swaps loops and PNG backgrounds for DJ, Movie, News and Chill sets without stopping the stream.', badge:'OBS', tech:'Node.js · OBS Media Source', functions:['Swap wallpaper MP4 by set','Preload next background','Fall back to a safe PNG if a file is missing']},
      ]},
      { id:'automation', name:'automation-engine/', kind:'folder', desc:'Python scheduler. Runs the playlist, auto-start/stop and auto-clipping so the studio can run unattended.', badge:'Backend', tech:'Python · APScheduler', functions:['Run schedule.json as a broadcast clock','Auto-start and auto-stop streams','Trigger auto-clipping on highlights'], children:[
        { id:'auto-sched', name:'scheduler.py', kind:'file', desc:'Broadcast clock. Reads schedule.json and fires start, scene and stop events at the right second.', badge:'Backend', tech:'Python · APScheduler', functions:['Load schedule.json','Fire timed scene changes','Handle start / stop / failover windows']},
        { id:'auto-play', name:'playlist.py', kind:'file', desc:'Playlist engine. Walks Morning Show, Night Loop and other playlists and hands the next item to OBS.', badge:'Backend', tech:'Python', functions:['Resolve playlist order','Hand off video, bumper and bed','Loop or hold on the last item safely']},
        { id:'auto-clip', name:'clipper.py', kind:'file', desc:'Auto-clipping. Cuts highlight moments from the live feed and writes them to /media/clips with metadata.', badge:'Backend', tech:'Python · FFmpeg', functions:['Detect highlight triggers','Cut and name clips','Write clips to /media/clips']},
      ]},
      { id:'safety', name:'safety-service/', kind:'folder', desc:'Safety layer. Whisper transcription, keyword filter, flag/suspend and health score protect the channel in real time.', badge:'Safety', tech:'Python · Whisper · SQLite', functions:['Transcribe live audio','Filter risky keywords','Flag, suspend and log every action'], children:[
        { id:'safety-trans', name:'transcribe.py', kind:'file', desc:'Whisper transcription. Turns live audio into text that the keyword filter can check within seconds.', badge:'Safety', tech:'Python · Whisper', functions:['Stream audio to Whisper','Return timestamped transcript','Keep latency low enough to act']},
        { id:'safety-filter', name:'keywordFilter.py', kind:'file', desc:'Keyword filter. Matches transcript and comments against the safety policy and assigns a severity.', badge:'Safety', tech:'Python · Regex / Policy Rules', functions:['Match policy keywords','Assign severity','Trigger flag or suspend']},
        { id:'safety-score', name:'healthScore.py', kind:'file', desc:'Health score. Combines flags, suspensions, audio issues and stream stability into one Safety Score.', badge:'Safety', tech:'Python', functions:['Score recent flags and stability','Expose score to dashboard','Recommend slow mode or pause']},
      ]},
      { id:'gateway', name:'api-gateway/', kind:'folder', desc:'REST API connecting dashboard to services. The only path the dashboard uses to reach OBS, automation or safety.', badge:'Backend', tech:'Node.js · Express · REST', functions:['Authenticate dashboard requests','Route scene, clip and safety calls','Return one consistent response shape'], children:[
        { id:'gateway-index', name:'server.ts', kind:'file', desc:'Gateway server. Defines routes, validates requests and forwards them to the owning service.', badge:'Backend', tech:'Node.js · Express', functions:['Serve REST endpoints','Validate payloads','Forward to OBS / automation / safety']},
        { id:'gateway-routes', name:'routes.ts', kind:'file', desc:'Route map. Keeps every dashboard action on a named endpoint so the UI never guesses a URL.', badge:'Backend', tech:'TypeScript', functions:['Map scene, clip and moderation routes','Version the API surface','Return clear errors to the UI']},
      ]},
    ]},
    { id:'obs', name:'obs/', kind:'folder', desc:'Everything OBS loads: scenes, overlays and wallpapers. Kept separate from code so a producer can edit a scene without touching the app.', badge:'OBS', tech:'OBS Studio · JSON', functions:['Define every broadcast look','Keep overlays reusable','Swap wallpapers by show'], children:[
      { id:'scenes', name:'scenes/', kind:'folder', desc:'Scene JSON for Full Cam, Split Screen, Reaction, News Desk, Shopping, Gaming, DJ Radio and Movie Mode.', badge:'OBS', tech:'OBS Scene Collections · JSON', functions:['Store layout and sources per scene','Keep safe source positions','Allow fast producer edits'], children:[
        { id:'scene-full', name:'full-cam.json', kind:'file', desc:'Full Cam. One large camera, clean lower third, no distractions for interviews and solo segments.', badge:'OBS', tech:'JSON', functions:['Full-screen camera source','Lower-third overlay','Safe audio and mic routing']},
        { id:'scene-split', name:'split-screen.json', kind:'file', desc:'Split Screen. Two feeds side by side for duets, debates and guest interviews.', badge:'OBS', tech:'JSON', functions:['Two balanced video sources','Shared lower third','Balanced audio mix']},
        { id:'scene-reaction', name:'reaction.json', kind:'file', desc:'Reaction. Host camera over the video being reacted to, with comment wall close at hand.', badge:'OBS', tech:'JSON', functions:['Host picture-in-picture','Main reaction video','Comment wall overlay']},
        { id:'scene-news', name:'news-desk.json', kind:'file', desc:'News Desk. Desk framing, ticker space and Now Playing for headline segments.', badge:'OBS', tech:'JSON', functions:['Desk framing','Ticker and headline zone','Now Playing slot']},
        { id:'scene-shop', name:'shopping.json', kind:'file', desc:'Shopping. Product focus, price and gift alerts front and centre for live commerce.', badge:'OBS', tech:'JSON', functions:['Product highlight source','Price / offer overlay','Gift alert placement']},
        { id:'scene-game', name:'gaming.json', kind:'file', desc:'Gaming. Game capture dominant, host camera in the corner, chat visible but not blocking play.', badge:'OBS', tech:'JSON', functions:['Game capture source','Host corner camera','Chat overlay']},
        { id:'scene-dj', name:'dj-radio.json', kind:'file', desc:'DJ Radio. Turntable / DJ set visuals, audio-reactive wallpaper and Now Playing.', badge:'OBS', tech:'JSON', functions:['DJ set framing','Now Playing overlay','Audio-reactive wallpaper']},
        { id:'scene-movie', name:'movie-mode.json', kind:'file', desc:'Movie Mode. Cinematic framing, dimmed UI and a Chill / Movie wallpaper for watch-along segments.', badge:'OBS', tech:'JSON', functions:['Cinematic framing','Dimmed lower thirds','Movie wallpaper slot']},
      ]},
      { id:'overlays', name:'overlays/', kind:'folder', desc:'Reusable overlays: Lower thirds, Gift alerts, Polls, Comment wall and Now Playing.', badge:'OBS', tech:'OBS Browser Sources · HTML/CSS', functions:['Keep brand consistent','Reuse overlays across scenes','Update text without rebuilding a scene'], children:[
        { id:'ov-lower', name:'lower-thirds.html', kind:'file', desc:'Lower thirds. Name, role and segment title in the studio’s red / cyan system.', badge:'OBS', tech:'HTML · CSS', functions:['Show host and guest names','Animate in and out','Match scene typography']},
        { id:'ov-gift', name:'gift-alerts.html', kind:'file', desc:'Gift alerts. Big, readable celebration when a gift lands, with sender and gift name.', badge:'OBS', tech:'HTML · CSS · WebSocket', functions:['Animate gift alerts','Show sender and gift','Queue multiple gifts']},
        { id:'ov-poll', name:'polls.html', kind:'file', desc:'Polls. Live vote bars that update as viewers vote from chat or the dashboard.', badge:'OBS', tech:'HTML · CSS', functions:['Render live poll options','Animate vote bars','Show winner state']},
        { id:'ov-wall', name:'comment-wall.html', kind:'file', desc:'Comment wall. Curated comments on air, with flagged comments never reaching this overlay.', badge:'OBS', tech:'HTML · CSS', functions:['Show curated comments','Hide flagged comments','Auto-rotate recent messages']},
        { id:'ov-now', name:'now-playing.html', kind:'file', desc:'Now Playing. Current track, show and segment — fed by the DJ playlist and automation.', badge:'OBS', tech:'HTML · CSS', functions:['Show current track','Show show and segment','Update on playlist change']},
      ]},
      { id:'wallpapers', name:'wallpapers/', kind:'folder', desc:'MP4 loops + PNG backgrounds: DJ_Sets, Movie_Sets, News_Desk, Chill_Lofi.', badge:'Media', tech:'MP4 · PNG · OBS Media Source', functions:['Set mood by show','Loop without visible cuts','Provide PNG fallback'], children:[
        { id:'wp-dj', name:'DJ_Sets/', kind:'folder', desc:'DJ set loops. High-energy backgrounds for DJ Radio and live music blocks.', badge:'Media', tech:'MP4', functions:['Loop DJ visuals','Match tempo and mood','Use as DJ Radio wallpaper']},
        { id:'wp-movie', name:'Movie_Sets/', kind:'folder', desc:'Movie set loops. Cinematic backgrounds for Movie Mode and watch-along segments.', badge:'Media', tech:'MP4', functions:['Loop cinematic visuals','Keep text readable','Use as Movie Mode wallpaper']},
        { id:'wp-news', name:'News_Desk/', kind:'folder', desc:'News desk backgrounds. Clean, credible sets for News Desk segments.', badge:'Media', tech:'MP4 · PNG', functions:['Loop news-desk visuals','Keep lower thirds legible','Use as News Desk wallpaper']},
        { id:'wp-chill', name:'Chill_Lofi/', kind:'folder', desc:'Chill Lofi loops. Calm backgrounds for late-night, study and wind-down blocks.', badge:'Media', tech:'MP4', functions:['Loop calm visuals','Lower visual intensity','Use as Chill / Night Loop wallpaper']},
      ]},
    ]},
    { id:'media', name:'media/', kind:'folder', desc:'Studio media. Library, auto-clipped highlights and audio live here — never inside code folders.', badge:'Media', tech:'MP4 · MP3 · PNG', functions:['Keep source media organised','Make clips easy to find','Separate audio from video'], children:[
      { id:'library', name:'library/', kind:'folder', desc:'Video files, bumpers, BRB and intros. The reusable building blocks of every show.', badge:'Media', tech:'MP4 · MOV', functions:['Store bumpers and intros','Store BRB and interstitials','Feed playlists and scenes']},
      { id:'clips', name:'clips/', kind:'folder', desc:'Auto-clipped highlights. Written by automation-engine / clipper.py and ready for posting or replay.', badge:'Media', tech:'MP4', functions:['Store auto-cut highlights','Keep clip metadata','Feed replay and social posting']},
      { id:'audio', name:'audio/', kind:'folder', desc:'DJ playlists, SFX and beds. Music and sound design, separated from video.', badge:'Media', tech:'MP3 · WAV', functions:['Store DJ playlists','Store SFX and stingers','Store background beds']},
    ]},
    { id:'data', name:'data/', kind:'folder', desc:'Live studio data. Rights, moderation logs, schedule and playlists. The databases are runtime state, not code.', badge:'Backend', tech:'SQLite · JSON', functions:['Record rights decisions','Log every moderation action','Hold the broadcast schedule'], children:[
      { id:'rights', name:'rights.db', kind:'file', desc:'SQLite — Green / Yellow / Red rights table. Decides whether imported content can air, needs review, or is blocked.', badge:'Safety', tech:'SQLite', functions:['Store Green / Yellow / Red status','Record rights source and reviewer','Block Red content from air']},
      { id:'modlog', name:'moderation-log.db', kind:'file', desc:'Flag / suspend logs. Every safety action is recorded with time, reason and operator.', badge:'Safety', tech:'SQLite', functions:['Log flags and suspensions','Keep an audit trail','Feed the Safety Score']},
      { id:'schedule', name:'schedule.json', kind:'file', desc:'TV schedule. The single source of truth the automation engine reads to start, switch and stop shows.', badge:'Backend', tech:'JSON', functions:['Define show start and end times','Map shows to scenes and playlists','Drive auto-start / stop']},
      { id:'playlists', name:'playlists/', kind:'folder', desc:'Morning Show, Night Loop and other playlists. Ordered media lists the automation engine plays.', badge:'Media', tech:'JSON · MP4 · MP3', functions:['Order Morning Show media','Order Night Loop media','Reuse library and audio items'], children:[
        { id:'pl-morning', name:'morning-show.json', kind:'file', desc:'Morning Show playlist. High-energy open, segments, bumpers and beds in broadcast order.', badge:'Media', tech:'JSON', functions:['Order morning segments','Attach bumpers and beds','Set scene per segment']},
        { id:'pl-night', name:'night-loop.json', kind:'file', desc:'Night Loop playlist. Chill loops, lofi beds and replays for unattended overnight air.', badge:'Media', tech:'JSON', functions:['Order overnight loops','Set Chill wallpaper','Loop until morning start']},
      ]},
    ]},
    { id:'integrations', name:'integrations/', kind:'folder', desc:'Outside world, behind a boundary. TikTok Live and YouTube import both go through checks before anything reaches air.', badge:'Backend', tech:'TikTok Live API · yt-dlp', functions:['Bring comments and gifts in','Bring YouTube imports in safely','Keep timeouts and rights enforced'], children:[
      { id:'tiktok', name:'tiktok-live-api/', kind:'folder', desc:'Comments, gifts, timeouts and RTMP. The live connection between TikTok and the studio.', badge:'Backend', tech:'TikTok Live API · RTMP', functions:['Stream comments and gifts','Apply timeouts','Publish via RTMP'], children:[
        { id:'tt-comments', name:'comments.ts', kind:'file', desc:'Live comments. Normalises TikTok comments for the dashboard and safety filter.', badge:'Backend', tech:'TypeScript', functions:['Normalise comment events','Forward to dashboard','Forward to safety filter']},
        { id:'tt-gifts', name:'gifts.ts', kind:'file', desc:'Gifts. Turns gift events into gift alerts and dashboard totals.', badge:'Backend', tech:'TypeScript', functions:['Normalise gift events','Trigger gift alerts','Update gift totals']},
        { id:'tt-timeout', name:'timeouts.ts', kind:'file', desc:'Timeouts. Applies moderator timeouts so flagged viewers cannot keep posting.', badge:'Safety', tech:'TypeScript', functions:['Apply timeouts','Log timeout actions','Sync with moderation log']},
      ]},
      { id:'youtube', name:'youtube-import/', kind:'folder', desc:'yt-dlp import with rights check. Nothing imported can air until rights.db says Green or Yellow.', badge:'Safety', tech:'Python · yt-dlp · SQLite', functions:['Download via yt-dlp','Check rights before import','Quarantine Red content'], children:[
        { id:'yt-import', name:'import.py', kind:'file', desc:'YouTube import. Downloads a video, stores it in /media/library and records its rights status.', badge:'Safety', tech:'Python · yt-dlp', functions:['Download source video','Store in /media/library','Record rights status']},
      ]},
    ]},
    { id:'docs', name:'docs/', kind:'folder', desc:'How to run and protect the studio. Read these before going live.', badge:'Config', tech:'Markdown', functions:['Explain the whole system','Document OBS and safety setup','Give copy-ready permission templates'], children:[
      { id:'doc-blue', name:'blueprint.md', kind:'file', desc:'System blueprint. Architecture, service boundaries and the live signal path in one document.', badge:'Config', tech:'Markdown', functions:['Map services and data flow','Define service boundaries','Explain failover']},
      { id:'doc-obs', name:'obs-setup.md', kind:'file', desc:'OBS setup. Scene collections, sources, audio routing and wallpaper setup, step by step.', badge:'OBS', tech:'Markdown', functions:['Set up scenes and sources','Set up audio routing','Set up wallpapers']},
      { id:'doc-safety', name:'safety-policy.md', kind:'file', desc:'Safety policy. What gets flagged, suspended or blocked — and who can override it.', badge:'Safety', tech:'Markdown', functions:['Define flag and suspend rules','Define override permissions','Explain audit logging']},
      { id:'doc-perm', name:'permission-templates.md', kind:'file', desc:'Permission templates. Copy-ready wording for guests, music and clip permissions.', badge:'Config', tech:'Markdown', functions:['Template guest permission','Template music permission','Template clip permission']},
    ]},
    { id:'config', name:'config/', kind:'folder', desc:'Environment and stream configuration. Placeholder keys only — never commit real keys.', badge:'Config', tech:'JSON · .env', functions:['Hold non-secret settings','Document required secrets','Keep stream config in one place'], children:[
      { id:'env', name:'.env.example', kind:'file', desc:'Example environment file. Lists every variable the services need, with placeholder values only.', badge:'Config', tech:'.env', functions:['Document required variables','Show safe placeholder values','Guide first-time setup']},
      { id:'obs-config', name:'obs-config.json', kind:'file', desc:'OBS connection config. Host, port and scene defaults the OBS controller uses to connect.', badge:'Config', tech:'JSON', functions:['Store OBS connection settings','Store default scene','Support local and remote OBS']},
      { id:'keys', name:'stream-keys.json', kind:'file', desc:'Placeholder, never commit real keys. Shape only — real stream keys live outside the repo.', badge:'Config', tech:'JSON', functions:['Show expected key shape','Point to secure storage','Prevent accidental key commits']},
    ]},
    { id:'scripts', name:'scripts/', kind:'folder', desc:'Operator scripts. Start the studio, fail over, and back it up with three commands.', badge:'Backend', tech:'Bash', functions:['Start every service in order','Fail over safely','Back up data and media'], children:[
      { id:'start', name:'start-studio.sh', kind:'file', desc:'Start the studio. Boots gateway, OBS controller, automation and safety in the right order.', badge:'Backend', tech:'Bash', functions:['Check OBS and dependencies','Start services in order','Wait for health checks']},
      { id:'failover', name:'failover.sh', kind:'file', desc:'Failover. Switches to the backup path if OBS or a service fails mid-show.', badge:'Backend', tech:'Bash', functions:['Detect failure','Switch to backup scene','Restore primary when healthy']},
      { id:'backup', name:'backup.sh', kind:'file', desc:'Backup. Copies data, playlists, scenes and config so a failed machine can be rebuilt.', badge:'Backend', tech:'Bash', functions:['Back up SQLite databases','Back up playlists and scenes','Back up config']},
    ]},
    { id:'readme', name:'README.md', kind:'file', desc:'Start here. What TIKCAST LIVE is, how to run it, and where every folder fits.', badge:'Config', tech:'Markdown', functions:['Explain the studio in one page','Link docs and setup','Show quick-start commands']},
    { id:'package', name:'package.json', kind:'file', desc:'Workspace manifest. Scripts and dependencies for the Node services and dashboard.', badge:'Config', tech:'JSON · Node.js', functions:['Define workspace scripts','List Node dependencies','Pin dashboard and gateway versions']},
    { id:'compose', name:'docker-compose.yml', kind:'file', desc:'One-command deployment. Runs dashboard, gateway, OBS controller, automation and safety together.', badge:'Backend', tech:'Docker Compose · YAML', functions:['Define all services','Wire service networking','Mount media, data and OBS folders']},
  ]},
];

const badgeStyle: Record<Badge,string> = {
  Frontend:'bg-cyan-400/15 text-cyan-300 border-cyan-400/30',
  Backend:'bg-violet-400/15 text-violet-300 border-violet-400/30',
  OBS:'bg-red-500/15 text-red-300 border-red-500/30',
  Safety:'bg-amber-400/15 text-amber-300 border-amber-400/30',
  Media:'bg-pink-400/15 text-pink-300 border-pink-400/30',
  Config:'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
};

function countNodes(n: Node): {files:number; folders:number} {
  if(!n.children) return {files: n.kind==='file'?1:0, folders:0};
  let f=0, d=1; for(const c of n.children){const x=countNodes(c); f+=x.files; d+=x.folders;}
  return {files:f, folders:d};
}
function flatten(n: Node, out: Node[]=[]){ out.push(n); n.children?.forEach(c=>flatten(c,out)); return out; }
function matches(n: Node, q:string){ const s=(n.name+' '+n.desc+' '+n.tech).toLowerCase(); return s.includes(q); }
function filterTree(n: Node, q:string, badge: Badge|'All'): Node|null {
  const self = (q===''||matches(n,q)) && (badge==='All'||n.badge===badge);
  if(!n.children) return self?n:null;
  const kids = n.children.map(c=>filterTree(c,q,badge)).filter(Boolean) as Node[];
  if(self || kids.length) return {...n, children:kids};
  return null;
}
function findNode(n: Node, id:string): Node|null { if(n.id===id) return n; for(const c of n.children||[]){const r=findNode(c,id); if(r) return r;} return null; }
function pathTo(n: Node, id:string, acc: string[]=[]): string[]|null { if(n.id===id) return [...acc,n.name]; for(const c of n.children||[]){const r=pathTo(c,id,[...acc,n.name]); if(r) return r;} return null; }

const allIds = flatten(tree[0]).map(n=>n.id);
const counts = countNodes(tree[0]);

export default function App(){
  const [query,setQuery] = useState('');
  const [badge,setBadge] = useState<Badge|'All'>('All');
  const [expanded,setExpanded] = useState<Set<string>>(new Set(allIds));
  const [selectedId,setSelectedId] = useState('dashboard');
  const [activeFlow,setActiveFlow] = useState(0);

  const q = query.trim().toLowerCase();
  const visibleTree = useMemo(()=> filterTree(tree[0], q, badge) || tree[0], [q,badge]);
  const selected = findNode(tree[0], selectedId) || tree[0];
  const selectedPath = pathTo(tree[0], selectedId)?.join(' ') || 'TIKCAST-LIVE/';

  const toggle = (id:string)=> setExpanded(prev=>{ const next=new Set(prev); if(next.has(id)) next.delete(id); else next.add(id); return next; });
  const expandAll = ()=> setExpanded(new Set(allIds));
  const collapseAll = ()=> setExpanded(new Set(['root']));

  const flow = [
    {title:'Dashboard', sub:'React control room', icon:MonitorPlay, detail:'Preview · On Air · Next Up · Comments · Scene Buttons · Safety Score'},
    {title:'API Gateway', sub:'REST · One contract', icon:Server, detail:'Validates every operator action and routes it to the owning service.'},
    {title:'OBS Controller', sub:'Node.js · OBS WebSocket', icon:Clapperboard, detail:'Scene switching · Source swapping · Wallpaper MP4 switching'},
    {title:'Automation', sub:'Python scheduler', icon:Workflow, detail:'Playlist · Auto-start / stop · Auto-clipping'},
    {title:'Safety', sub:'Whisper · Keyword filter', icon:ShieldCheck, detail:'Transcription · Flag / suspend · Health score'},
    {title:'TikTok LIVE', sub:'Comments · Gifts · RTMP', icon:Radio, detail:'Audience in · Broadcast out · Timeouts enforced'},
  ];

  const renderNode = (node: Node, depth:number): React.ReactNode => {
    const isOpen = expanded.has(node.id) || q!=='';
    const isSel = selectedId===node.id;
    const icon = node.kind==='folder' ? (isOpen? <FolderOpen size={17}/>: <Folder size={17}/>) : node.name.endsWith('.json')||node.name.endsWith('.yml') ? <FileJson2 size={16}/> : node.name.endsWith('.md') ? <FileText size={16}/> : node.name.endsWith('.db') ? <Database size={16}/> : node.name.endsWith('.sh') ? <Terminal size={16}/> : node.name.endsWith('.html') ? <FileCode2 size={16}/> : <File size={16}/>;
    return (
      <div key={node.id} className={depth>0?'tree-line':''} style={{marginLeft: depth===0?0:8}}>
        <button onClick={()=>{ setSelectedId(node.id); if(node.kind==='folder') toggle(node.id); }}
          className={`w-full flex items-center gap-2 rounded-lg px-2 py-[7px] text-left transition ${isSel?'bg-[var(--red)] text-white shadow-[0_0_0_1px_rgba(255,45,85,.45),0_8px_24px_rgba(255,45,85,.22)]':'hover:bg-[var(--surface-3)] text-[var(--text)]'}`}
          aria-expanded={node.kind==='folder'?isOpen:undefined}>
          <span className={`shrink-0 ${isSel?'text-white':'text-[var(--muted)]'}`}>{node.kind==='folder' ? (isOpen?<ChevronDown size={15}/>:<ChevronRight size={15}/>) : <span className="inline-block w-[15px]"/>}</span>
          <span className={isSel?'text-white': node.kind==='folder'?'text-[var(--cyan)]':'text-[var(--muted)]'}>{icon}</span>
          <span className={`mono min-w-0 flex-1 truncate text-[13px] font-medium ${isSel?'text-white':''}`}>{node.name}</span>
          <span className={`hidden sm:inline-flex shrink-0 rounded-full border px-2 py-[2px] text-[10px] font-bold tracking-wide ${isSel?'border-white/40 bg-white/15 text-white':badgeStyle[node.badge]}`}>{node.badge}</span>
        </button>
        {node.kind==='folder' && isOpen && node.children && <div className="ml-2 pl-2">{node.children.map(c=>renderNode(c, depth+1))}</div>}
      </div>
    );
  };

  return (
    <div data-safe-area-inset-root style={{boxSizing:'border-box', paddingTop:'var(--safe-area-inset-top)', minHeight:'100vh', background:'var(--bg)'}} className="overflow-x-clip">
      <header data-safe-area-sticky-top style={{top:'var(--safe-area-inset-top)'}} className="sticky z-30 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3 sm:px-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--red)] text-white shadow-[0_0_24px_rgba(255,45,85,.4)]"><Radio size={22}/></div>
            <div className="min-w-0"><h1 className="truncate text-[clamp(18px,3vw,26px)] font-bold leading-none tracking-tight">TIKCAST <span className="text-[var(--red)]">LIVE</span> <span className="text-[var(--cyan)]">— Project Tree</span></h1><p className="mt-1 truncate text-xs text-[var(--muted)]">How the whole studio is organized, from code to control room.</p></div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[11px] font-bold tracking-widest text-red-300"><span className="live-dot h-2 w-2 rounded-full bg-[var(--red)]"/>ON AIR · STUDIO MAP</span>
            <span className="hidden md:inline-flex rounded-full bg-[var(--surface-3)] px-3 py-1 text-[11px] text-[var(--muted)] mono">{counts.files} files · {counts.folders} folders</span>
          </div>
        </div>
        <div className="relative h-[3px] overflow-hidden bg-[var(--surface-3)]"><div className="scan-bar absolute h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent"/></div>
      </header>

      <main className="mx-auto max-w-[1500px] px-3 pb-10 sm:px-5">
        {/* FLOW */}
        <section className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-[11px] font-bold tracking-[0.22em] text-[var(--cyan)]">LIVE SIGNAL PATH</p><h2 className="mt-1 text-xl font-bold sm:text-2xl">One request. One path. No shortcuts.</h2></div><p className="max-w-md text-xs leading-relaxed text-[var(--muted)]">The dashboard never talks to OBS directly. Every tap goes through the gateway — so safety, automation and control stay in sync.</p></div>
          <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-6">
            {flow.map((f,i)=>(
              <button key={f.title} onClick={()=>setActiveFlow(i)} className={`relative rounded-xl border p-3 text-left transition ${activeFlow===i?'border-[var(--cyan)] bg-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,.12)]':'border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--line-2)]'}`}>
                <div className="flex items-center justify-between"><f.icon size={20} className={activeFlow===i?'text-[var(--cyan)]':'text-[var(--muted)]'}/><span className="mono text-[10px] text-[var(--muted-2)]">0{i+1}</span></div>
                <p className="mt-3 text-sm font-bold leading-tight">{f.title}</p><p className="mt-1 text-[11px] leading-snug text-[var(--muted)]">{f.sub}</p>
                {i<5 && <ArrowRight size={16} className="flow-arrow absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-[var(--bg)] lg:block"/>}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-3 rounded-xl bg-[var(--surface-2)] px-3 py-3"><Zap size={18} className="mt-0.5 shrink-0 text-[var(--amber)]"/><p className="text-sm leading-relaxed"><strong>{flow[activeFlow].title}:</strong> <span className="text-[var(--muted)]">{flow[activeFlow].detail}</span></p></div>
        </section>

        {/* CONTROLS */}
        <section className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block flex-1"><Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search files, folders, purposes…  try “clipping”, “rights”, “scene”" className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-3 pl-10 pr-10 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)]"/>{query && <button onClick={()=>setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"><X size={17}/></button>}</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={expandAll} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold"><Expand size={14}/> Expand all</button>
            <button onClick={collapseAll} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold"><Shrink size={14}/> Collapse all</button>
          </div>
        </section>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by badge">
          {(['All','Frontend','Backend','OBS','Safety','Media','Config'] as const).map(b=>(
            <button key={b} onClick={()=>setBadge(b)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${badge===b?'bg-[var(--red)] border-[var(--red)] text-white':'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]'}`}>{b}{b!=='All' && <span className="ml-1 opacity-70">· {flatten(tree[0]).filter(n=>n.badge===b).length}</span>}</button>
          ))}
          {(query||badge!=='All') && <span className="self-center text-xs text-[var(--muted)]">{flatten(visibleTree).length} items match</span>}
        </div>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          {/* TREE */}
          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-4 py-3"><div className="flex items-center gap-2"><span className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-red-500"/><i className="h-2.5 w-2.5 rounded-full bg-amber-400"/><i className="h-2.5 w-2.5 rounded-full bg-emerald-400"/></span><span className="mono text-xs text-[var(--muted)]">tikcast-live — studio explorer</span></div><span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]"><Activity size={14} className="text-emerald-400"/> Click a folder to expand · Click a file to inspect</span></div>
            <div className="max-h-none overflow-x-clip p-3 sm:p-4 lg:max-h-[720px] lg:overflow-y-auto">{renderNode(visibleTree,0)}{flatten(visibleTree).length===0 && <p className="p-6 text-center text-sm text-[var(--muted)]">No files match. Try another search or badge.</p>}</div>
          </section>

          {/* DETAIL */}
          <aside className="lg:sticky lg:top-24 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${badgeStyle[selected.badge]}`}>{selected.badge}</span><span className="mono text-[11px] text-[var(--muted)]">{selected.kind==='folder'?'FOLDER':'FILE'} · {selected.children?.length ?? 0} {selected.kind==='folder'?'items inside':''}</span></div>
            <h2 className="mono mt-4 break-words text-[clamp(20px,3vw,30px)] font-bold leading-tight">{selected.name}</h2>
            <p className="mono mt-2 break-all text-xs leading-relaxed text-[var(--cyan)]">{selectedPath}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">{selected.desc}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--surface-2)] p-3"><p className="text-[10px] font-bold tracking-widest text-[var(--muted-2)]">TECH</p><p className="mt-1.5 text-sm font-semibold leading-snug">{selected.tech}</p></div>
              <div className="rounded-xl bg-[var(--surface-2)] p-3"><p className="text-[10px] font-bold tracking-widest text-[var(--muted-2)]">SAFETY NOTE</p><p className="mt-1.5 text-sm leading-snug">{selected.badge==='Safety'?'Checked before anything reaches air.':selected.name.includes('keys')?'Placeholder only — never commit real keys.':'One owner, one contract, no side doors.'}</p></div>
            </div>
            <h3 className="mt-5 text-xs font-bold tracking-[0.18em] text-[var(--muted)]">KEY FUNCTIONS</h3>
            <ul className="mt-3 space-y-2.5">{selected.functions.map(f=><li key={f} className="flex gap-2.5 text-sm leading-relaxed"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--red)]"/><span>{f}</span></li>)}</ul>
            {selected.children && <div className="mt-5 border-t border-[var(--line)] pt-4"><p className="text-xs font-bold tracking-widest text-[var(--muted)]">INSIDE {selected.name.toUpperCase()}</p><div className="mt-2 flex flex-wrap gap-1.5">{selected.children.map(c=><button key={c.id} onClick={()=>setSelectedId(c.id)} className="rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1 mono text-[11px] hover:border-[var(--cyan)] hover:text-[var(--cyan)]">{c.name}</button>)}</div></div>}
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3"><ShieldCheck size={20} className="shrink-0 text-amber-300"/><p className="text-xs leading-relaxed text-amber-100/90"><strong className="text-amber-200">Operator rule:</strong> Red rights content never airs. Yellow needs review. Every flag, suspend and timeout is logged in <span className="mono">moderation-log.db</span>.</p></div>
          </aside>
        </div>

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          {[{t:'Control room first',d:'Dashboard is the only screen the operator needs during a live show.',i:MonitorPlay},{t:'Safety is not optional',d:'Whisper + keyword filter + health score run on every live minute.',i:ShieldCheck},{t:'Media stays separate',d:'Library, clips and audio live outside code — easy to back up and restore.',i:Music2}].map(x=><div key={x.t} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><x.i size={20} className="text-[var(--cyan)]"/><h3 className="mt-3 font-bold">{x.t}</h3><p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{x.d}</p></div>)}
        </section>
        <footer className="mt-6 flex flex-wrap justify-between gap-2 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted-2)]"><span>TIKCAST LIVE · Project Tree · Dashboard → API Gateway → OBS / Automation / Safety → TikTok LIVE</span><span className="mono">README.md · package.json · docker-compose.yml</span></footer>
      </main>
    </div>
  );
}
