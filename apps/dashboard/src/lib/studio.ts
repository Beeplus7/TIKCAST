export type Wallpaper = {
  id: string;
  name: string;
  desc: string;
  bg: string;
};

export type Scene = {
  id: string;
  label: string;
  hint: string;
};

export type PlaylistItem = {
  id: string;
  title: string;
  type: string;
  dur: string;
  seconds: number;
  status: string;
};

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "neon",
    name: "Neon Club",
    desc: "Magenta / cyan club wash",
    bg: "radial-gradient(120% 120% at 15% 10%, #ff2b8a 0%, #2a0a2e 38%, #06080b 72%), linear-gradient(115deg,#00e5ff33,transparent 55%)",
  },
  {
    id: "cinema",
    name: "Cinema",
    desc: "Warm projector + seats",
    bg: "linear-gradient(120deg,#ffb020 0%, #7a1e00 38%, #120a05 70%, #06080b 100%)",
  },
  {
    id: "lofi",
    name: "Lofi Room",
    desc: "Soft dusk + lamp glow",
    bg: "radial-gradient(110% 110% at 78% 18%, #ffb7a0 0%, #7a4a6b 38%, #1a1426 68%, #06080b 100%)",
  },
  {
    id: "cyber",
    name: "Cyber Grid",
    desc: "Cyan grid on black",
    bg: "linear-gradient(180deg,#03161c 0%, #062a31 45%, #06080b 100%)",
  },
  {
    id: "sunset",
    name: "Sunset Studio",
    desc: "Orange horizon studio",
    bg: "linear-gradient(180deg,#ff7a1a 0%, #ff2b3d 38%, #2a0a2e 70%, #06080b 100%)",
  },
  {
    id: "news",
    name: "Midnight News",
    desc: "Deep blue news desk",
    bg: "linear-gradient(135deg,#00e5ff 0%, #0a2a8a 35%, #06080b 72%)",
  },
];

export const SCENES: Scene[] = [
  { id: "Full Cam", label: "Full Cam", hint: "Solo camera" },
  { id: "Split Screen", label: "Split Screen", hint: "Host + guest" },
  { id: "Reaction", label: "Reaction", hint: "Clip + facecam" },
  { id: "News Desk", label: "News Desk", hint: "Desk + ticker" },
  { id: "Shopping", label: "Shopping", hint: "Product + price" },
  { id: "Gaming", label: "Gaming", hint: "Game + cam" },
  { id: "DJ Radio", label: "DJ Radio", hint: "Deck + waveform" },
  { id: "Movie Mode", label: "Movie Mode", hint: "Cinema frame" },
  { id: "BRB", label: "BRB", hint: "Be right back" },
];

export const INITIAL_PLAYLIST: PlaylistItem[] = [
  {
    id: "p1",
    title: "Morning Show — Live Open",
    type: "LIVE SHOW",
    dur: "42:00",
    seconds: 2520,
    status: "NOW PLAYING",
  },
  {
    id: "p2",
    title: "Best Of Clip — Top Reactions",
    type: "CLIP",
    dur: "03:24",
    seconds: 204,
    status: "QUEUED",
  },
  {
    id: "p3",
    title: "Reaction Clip — Viral Moment",
    type: "REACTION",
    dur: "06:12",
    seconds: 372,
    status: "QUEUED",
  },
  {
    id: "p4",
    title: "DJ Set — Late Night Mix",
    type: "MUSIC",
    dur: "58:00",
    seconds: 3480,
    status: "QUEUED",
  },
];

export const SCHEDULE = [
  { time: "07:00", title: "Wake Up Show", color: "#00e5ff" },
  { time: "09:30", title: "Best Of Replay", color: "#b07bff" },
  { time: "11:00", title: "Reaction Hour", color: "#ff2b8a" },
  { time: "13:00", title: "Shopping Live", color: "#ffcb1f" },
  { time: "16:00", title: "Gaming Block", color: "#2bff88" },
  { time: "19:00", title: "DJ Radio", color: "#ff7a1a" },
  { time: "21:00", title: "Movie Night", color: "#3b82f6" },
];

export const RIGHTS = [
  { id: "r1", name: "Morning Show — Live Open", status: "CLEAR", color: "#2bff88", action: "Licensed" },
  { id: "r2", name: "Best Of Clip — Top Reactions", status: "REVIEW", color: "#ffcb1f", action: "Check source" },
  { id: "r3", name: "Reaction Clip — Viral Moment", status: "REVIEW", color: "#ffcb1f", action: "Trim 0:42" },
  { id: "r4", name: "DJ Set — Late Night Mix", status: "BLOCKED", color: "#ff2b3d", action: "Swap track" },
];

export const COMMENT_POOL = [
  { user: "@lena.wav", text: "This transition was SO clean 🔥", tag: "FAN" },
  { user: "@marc_o", text: "Please play the late night mix next!", tag: "REQUEST" },
  { user: "@tika_fan", text: "Joined from the morning show, staying all day", tag: "NEW" },
  { user: "@jules", text: "Split screen is the best layout for this", tag: "FAN" },
  { user: "@nova", text: "The neon wallpaper fits this segment perfectly", tag: "FAN" },
  { user: "@riley", text: "Can we get a poll for the next clip?", tag: "REQUEST" },
];

export function fmtDuration(s: number) {
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export async function callObs(path: string, body?: Record<string, unknown>) {
  const base = process.env.NEXT_PUBLIC_OBS_CONTROLLER_URL || "http://localhost:3011";
  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    return await res.json().catch(() => ({ ok: res.ok }));
  } catch {
    return { ok: false, offline: true };
  }
}
