#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${TIKCAST_VPS_HOST:-87.106.103.43}"
USER="${TIKCAST_VPS_USER:-root}"
REMOTE="/var/www/tikcast"

if [[ -z "${SSHPASS:-}" && -z "${TIKCAST_SSH_KEY:-}" ]]; then
  echo "Set SSHPASS or use ssh-agent / TIKCAST_SSH_KEY"
  exit 1
fi

RSYNC_SSH=(ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no -o StrictHostKeyChecking=accept-new)
if [[ -n "${TIKCAST_SSH_KEY:-}" ]]; then
  RSYNC_SSH=(ssh -i "$TIKCAST_SSH_KEY" -o StrictHostKeyChecking=accept-new)
fi

rsync -az --delete \
  --exclude node_modules --exclude .next --exclude 'apps/*/node_modules' \
  --exclude 'apps/dashboard/.next' --exclude 'apps/safety-service/.venv' \
  --exclude .git --exclude '*.log' --exclude .DS_Store --exclude .env \
  -e "${RSYNC_SSH[*]}" \
  "$ROOT/" "$USER@$HOST:$REMOTE/"

if [[ -f /tmp/tikcast.dashboard.env.local ]]; then
  scp -o PreferredAuthentications=password -o PubkeyAuthentication=no \
    /tmp/tikcast.dashboard.env.local "$USER@$HOST:$REMOTE/apps/dashboard/.env.local" || true
fi

ssh "${RSYNC_SSH[@]}" "$USER@$HOST" "cd $REMOTE/apps/dashboard && npm install && npm run build && cd $REMOTE && pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs && pm2 save"
echo "Deployed → https://tikcast.aikova.co.uk"
