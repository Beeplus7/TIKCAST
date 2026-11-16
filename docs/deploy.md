# Deploy

## Local

```bash
cp .env.example .env
npm run install:all
./scripts/start-studio.sh
```

## Supabase

```bash
supabase db push
supabase functions deploy health-score
supabase functions deploy auto-clip
supabase functions deploy moderation
supabase functions deploy rights-check
```

## Docker (backend only)

```bash
docker compose up --build
```

OBS remains on the host; set `OBS_WEBSOCKET_URL=ws://host.docker.internal:4455`.

## Production checklist

- Rotate service role key; enable JWT on gateway.
- Storage buckets from `20241116000001_storage.sql`.
- TikTok RTMP + stream key in secrets manager.
- Monitor `engine_logs` and safety WS `/alerts`.


## Production VPS (tikcast.aikova.co.uk)

Host: `87.106.103.43` · path `/var/www/tikcast` · PM2 + nginx + Let's Encrypt.

```bash
# from laptop (requires SSHPASS or key)
export SSHPASS='…'   # prefer SSH key; rotate root password after first login
./scripts/deploy-vps.sh
```

Public URLs:
- https://tikcast.aikova.co.uk/
- https://tikcast.aikova.co.uk/readiness
- https://tikcast.aikova.co.uk/command-center
- Engines under `/engines/{shop,music,obs,gateway}/`
