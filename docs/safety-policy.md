# Safety Policy

## Keyword tiers

- **HARD_BAN**: threat, kill, bomb, self-harm, blood, graphic → ban log + WS alert + optional timeout.
- **WARN**: spam, link, promo → flag + producer alert.

## Escalation

- Two HARD_BAN events from the same user within 10 minutes → 10m timeout + kill switch (BRB scene).
- Channel `health_score` below 30 → automation switches to BRB (kill switch).

## Audio

- Optional `/transcribe` via faster-whisper; falls back if model unavailable.

## Logging

All actions write to `moderation_logs` with `source` = chat | audio | manual.