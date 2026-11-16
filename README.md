# TIKCAST LIVE

TikTok Creator Studio that runs like a TV channel.  
**TikTok** = transmission tower (RTMP) · **TIKCAST** = control room (OBS + Dashboard + Automation + Safety).

**Production:** https://tikcast.aikova.co.uk · https://tikcast.aikova.co.uk/readiness

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
- Live Shop + Licensed Music Bank (Supabase-backed)

## Supabase

1. Project `soiybpixcgeyfucgnkmh` (or create your own)
2. Apply `supabase/combined_apply.sql` (or `supabase db push`)
3. Optional functions: `health-score`, `auto-clip`, `moderation`, `rights-check`

## Services

| Service | Port | Command |
|---------|------|---------|
| API Gateway | 3010 | `npm run dev:gateway` |
| OBS Controller | 3011 | `npm run dev:obs` |
| Safety Service | 3012 | `npm run dev:safety` |
| Shop Engine | 3002 | `npm run dev:shop` |
| Music Engine | 3003 | `npm run dev:music` |
| Automation Engine | — | `npm run dev:automation` |
| Dashboard | 3005 | `npm run dev:dashboard` |
| Mobile | Expo | `npm run dev:mobile` |

## Production VPS

See `docs/deploy.md` · `scripts/deploy-vps.sh` · host `tikcast.aikova.co.uk`.

## Docs

`docs/blueprint.md` · `docs/obs-setup.md` · `docs/safety-policy.md` · `docs/deploy.md` · `docs/permission-templates.md`
