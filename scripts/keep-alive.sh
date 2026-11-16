#!/usr/bin/env bash
# Keep TIKCAST local stack running in this terminal (Ctrl+C to stop).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="${HOME}/.local/node-v24.22.2/bin:${PATH}"
cd "$ROOT"

cleanup() {
  echo "[TIKCAST] Stopping…"
  kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT INT TERM

node apps/obs-controller/index.js &
node apps/api-gateway/server.js &
node apps/automation-engine/scheduler.js &
(cd apps/safety-service && .venv/bin/uvicorn main:app --host 127.0.0.1 --port 3012) &

echo "[TIKCAST] Backends up — starting dashboard on http://127.0.0.1:3005"
echo "[TIKCAST] Command Center: http://127.0.0.1:3005/command-center"
cd apps/dashboard
./node_modules/.bin/next dev -p 3005 -H 127.0.0.1
