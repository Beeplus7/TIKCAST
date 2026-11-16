# OBS Setup

1. Install OBS Studio 30+ with **obs-websocket** enabled (default port `4455`).
2. Set password in OBS → Tools → WebSocket Server Settings; match `OBS_WEBSOCKET_PASSWORD` in `.env`.
3. Import scene layouts from `obs/scenes/*.json` as reference — create matching scene names:
   Full Cam, Split Screen, Reaction, News Desk, Shopping, Gaming, DJ Radio, Movie Mode, BRB.
4. Add browser sources pointing to `obs/overlays/*.html` (1920×1080, transparent background).
5. Name media source `Wallpaper` for API wallpaper swaps.
6. Configure stream output with `config/stream-keys.json` + TikTok RTMP env vars.
7. Start `npm run dev:obs` before going live; confirm `GET http://localhost:3011/health`.