# TIKCAST LIVE — Deploy / Verification Status

Generated during local scaffold (2026-11-16).

## URLs (local)

| Surface | URL |
|---------|-----|
| Web landing | http://localhost:3005 |
| Command Center | http://localhost:3005/command-center |
| Login | http://localhost:3005/login |
| Mobile | `cd apps/mobile && npx expo start` |
| API Gateway | http://localhost:3010/api/health |
| OBS Controller | http://localhost:3011/health |
| Safety Service | http://localhost:3012/health |

## Cloud (blocked until billing cleared)

- **Supabase Project URL:** not created — org `VisaGuide` has overdue invoices; `supabase projects create tikcast-live` failed.
- **Vercel Deployment URL:** not deployed — `vercel` CLI not installed; run `npm i -g vercel` then `cd apps/dashboard && vercel --prod` after Supabase keys are set.

## Tables (SQL ready in migrations)

`profiles`, `channels`, `playlists`, `playlist_items`, `scenes`, `wallpapers`, `schedules`, `moderation_logs`, `rights_checks`, `clips`, `gifts`, `comments`, `guests`, `engine_logs`

Storage buckets (SQL): `wallpapers`, `videos`, `clips`

Edge functions (code ready): `health-score`, `auto-clip`, `moderation`, `rights-check`

## Service logs (verified)

```
[ENGINE] OBS Controller listening on :3011
[ENGINE] OBS offline — retrying   # expected until OBS WebSocket is open
[ENGINE] API Gateway Ready
[ENGINE] Scheduler Running
[ENGINE] Scheduler Running (no Supabase — idle)
[ENGINE] Safety Service Active
```

Dashboard: `ON AIR` + Health Score `92` + Kill Switch rendered at `/command-center`.

## Errors + fixes applied

1. `obs-websocket-js@5.1.6` missing → pinned to `5.0.8`
2. Port clash with TapReward on `:3001` → TIKCAST uses `3010/3011/3012`, dashboard `3005`
3. Gateway auth blocked by placeholder service role → local mode when `TIKCAST_LOCAL=1`
4. TypeScript `supabase` null → optional chain on cleanup
5. Supabase project create blocked by overdue org invoices — settle billing, then create `tikcast-live`
6. Whisper not loaded by default (optional heavy dep) — keyword moderation works without it
