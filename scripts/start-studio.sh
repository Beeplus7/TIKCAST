#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[TIKCAST] Starting backend services..."
npm run dev:obs &
OBS_PID=$!
npm run dev:gateway &
GW_PID=$!
npm run dev:automation &
AUTO_PID=$!
npm run dev:shop &
SHOP_PID=$!
npm run dev:music &
MUSIC_PID=$!

SAFETY_UVICORN="$ROOT/apps/safety-service/.venv/bin/uvicorn"
if [[ -x "$SAFETY_UVICORN" ]]; then
  (cd apps/safety-service && "$SAFETY_UVICORN" main:app --host 0.0.0.0 --port "${SAFETY_SERVICE_PORT:-3012}") &
  SAFETY_PID=$!
elif command -v uvicorn >/dev/null 2>&1; then
  (cd apps/safety-service && uvicorn main:app --host 0.0.0.0 --port "${SAFETY_SERVICE_PORT:-3012}") &
  SAFETY_PID=$!
else
  echo "[TIKCAST] uvicorn not found — start safety service manually"
  SAFETY_PID=""
fi

cleanup() {
  kill "$OBS_PID" "$GW_PID" "$AUTO_PID" "$SHOP_PID" "$MUSIC_PID" 2>/dev/null || true
  [[ -n "${SAFETY_PID}" ]] && kill "$SAFETY_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "[TIKCAST] Studio stack running — OBS :3011 · Shop :3002 · Music :3003 · Gateway :3010"
echo "[TIKCAST] Ctrl+C to stop"
wait