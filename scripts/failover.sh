#!/usr/bin/env bash
set -euo pipefail
OBS_URL="${OBS_CONTROLLER_URL:-http://localhost:3011}"
GW_URL="${API_GATEWAY_URL:-http://localhost:3010}"

echo "[TIKCAST] Failover — BRB + stream stop"
curl -sf -X POST "$OBS_URL/scene" -H "Content-Type: application/json" -d '{"sceneName":"BRB"}' || true
curl -sf -X POST "$OBS_URL/stream/stop" || true
curl -sf -X POST "$GW_URL/api/kill-switch" || true
echo "[TIKCAST] Failover complete"