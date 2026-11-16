# TIKCAST LIVE Blueprint

## Architecture

- **Dashboard** (`apps/dashboard`) — producer UI (scenes, playout, safety).
- **API Gateway** (`:3000`) — auth + route aggregation.
- **OBS Controller** (`:3011`) — OBS WebSocket control (scenes, wallpaper, stream).
- **Safety Service** (`:3012`) — keyword moderation, alerts WS, optional Whisper.
- **API Gateway** (`:3010`) — dashboard → services contract.
- **Dashboard** (`:3005`) — Next.js Command Center.
- **Automation Engine** — schedule polling + kill switch on low health score.
- **Supabase** — Postgres, Realtime, Storage, Edge Functions.

## Data flow

1. Producer triggers scene change → Gateway → OBS Controller.
2. Chat message → Gateway `/api/moderation/check` → Safety → `moderation_logs`.
3. Scheduler reads `schedules` → starts playlist + stream at `starts_at`.
4. Health score edge function updates `channels.health_score`; automation reacts below 30.

## Default channel

`00000000-0000-4000-8000-000000000001` — TikCast Studio • Daily Live