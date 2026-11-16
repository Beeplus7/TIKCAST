# TIKCAST LIVE

TikTok Creator Studio that runs like a TV channel.  
**TikTok** = transmission tower (RTMP) · **TIKCAST** = control room (OBS + Dashboard + Automation + Safety).

Web: Next.js 14 Command Center · Mobile: Expo companion · Backend: Supabase + Node + Python.

## Quick start

```bash
cp .env.example .env
# fill NEXT_PUBLIC_SUPABASE_* and OBS_* values

npm run install:all
npm run studio                    # gateway :3010, OBS :3011, safety :3012, automation
npm run dev:dashboard             # http://localhost:3005
npm run dev:mobile                # Expo companion
```

Local ports (avoids TapReward on 3001): **Dashboard 3005**, **Gateway 3010**, **OBS 3011**, **Safety 3012**.

## Stack

| Piece | Tech |
|-------|------|
| Dashboard | Next.js 14 + Tailwind + TypeScript |
| Mobile | Expo (React Native) |
| Backend | Supabase (Postgres, Auth, Storage, Realtime, Edge Functions) |
| OBS Controller | Node.js + obs-websocket-js |
| Automation | Node.js scheduler |
| Safety | Python FastAPI + faster-whisper (optional) |

## Core features

- Playout Engine (playlist + scheduler)
- 8 OBS scenes + wallpaper switcher
- DJ Radio / Movie Mode
- Rights Engine (Green / Yellow / Red)
- Safety Net (keyword filter, Health Score, Kill Switch → BRB)
- Content Factory (auto-clip edge function)

## Supabase

1. Create project `tikcast-live`
2. `supabase link --project-ref YOUR_REF`
3. `supabase db push` (migrations in `supabase/migrations/`)
4. Deploy functions: `health-score`, `auto-clip`, `moderation`, `rights-check`
5. Storage buckets: `wallpapers` (public 100MB), `videos` (private 500MB), `clips` (public)

## Services

| Service | Port | Command |
|---------|------|---------|
| API Gateway | 3010 | `npm run dev:gateway` |
| OBS Controller | 3011 | `npm run dev:obs` |
| Safety Service | 3012 | `npm run dev:safety` |
| Automation Engine | — | `npm run dev:automation` |
| Dashboard | 3005 | `npm run dev:dashboard` |
| Mobile | Expo | `npm run dev:mobile` |

## Verification

- Dashboard shows ON AIR + Health Score at `/command-center`
- Scene buttons call OBS controller `POST /scene`
- Wallpaper calls `POST /wallpaper`
- Test banned word in Moderation Feed
- Kill Switch cuts to BRB

## Docs

`docs/blueprint.md` · `docs/obs-setup.md` · `docs/safety-policy.md` · `docs/deploy.md` · `docs/permission-templates.md`

Design sources from Downloads live in `design-source/`.