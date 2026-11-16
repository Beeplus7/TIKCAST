#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$ROOT/backups/tikcast-$STAMP"
mkdir -p "$OUT"

echo "[TIKCAST] Backing up config and data to $OUT"
cp -R "$ROOT/config" "$ROOT/data" "$ROOT/obs/scenes" "$ROOT/obs/overlays" "$OUT/" 2>/dev/null || true
[[ -f "$ROOT/.env" ]] && cp "$ROOT/.env" "$OUT/.env.backup"

tar -czf "$OUT.tar.gz" -C "$ROOT/backups" "tikcast-$STAMP"
echo "[TIKCAST] Archive: $OUT.tar.gz"