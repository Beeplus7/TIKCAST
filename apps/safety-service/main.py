import asyncio
import json
import os
import time
from collections import defaultdict, deque
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

HARD_BAN = ["threat", "kill", "bomb", "self-harm", "blood", "graphic"]
WARN = ["spam", "link", "promo"]

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OBS_CONTROLLER_URL = os.getenv("OBS_CONTROLLER_URL", "http://localhost:3011")
CHANNEL_ID = os.getenv("CHANNEL_ID", "00000000-0000-4000-8000-000000000001")
PORT = int(os.getenv("SAFETY_SERVICE_PORT", "3012"))

app = FastAPI(title="TIKCAST Safety Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_whisper_model = None
_alert_clients: list[WebSocket] = []
_hard_ban_history: dict[str, deque[float]] = defaultdict(deque)


class CheckRequest(BaseModel):
    message: str
    user_handle: str = "anonymous"
    channel_id: str = Field(default=CHANNEL_ID)


class TranscribeRequest(BaseModel):
    audio_url: str | None = None
    text_hint: str | None = None


def get_supabase():
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    from supabase import create_client

    return create_client(SUPABASE_URL, SUPABASE_KEY)


def classify(message: str) -> dict[str, Any]:
    lower = message.lower()
    for word in HARD_BAN:
        if word in lower:
            return {"action": "ban", "severity": "HARD_BAN", "keyword": word}
    for word in WARN:
        if word in lower:
            return {"action": "flag", "severity": "WARN", "keyword": word}
    return {"action": "allow", "severity": None, "keyword": None}


async def broadcast_alert(payload: dict[str, Any]) -> None:
    dead: list[WebSocket] = []
    for ws in _alert_clients:
        try:
            await ws.send_json(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        _alert_clients.remove(ws)


async def write_moderation_log(req: CheckRequest, result: dict[str, Any]) -> None:
    sb = get_supabase()
    if not sb:
        return
    sb.table("moderation_logs").insert(
        {
            "channel_id": req.channel_id,
            "user_handle": req.user_handle,
            "keyword": result.get("keyword"),
            "message": req.message,
            "action": result.get("action", "flag"),
            "severity": result.get("severity") or "WARN",
            "source": "chat",
        }
    ).execute()


async def trigger_kill_switch() -> None:
    async with httpx.AsyncClient(timeout=10.0) as client:
        await client.post(
            f"{OBS_CONTROLLER_URL}/scene",
            json={"sceneName": "BRB"},
        )
    sb = get_supabase()
    if sb:
        sb.table("channels").update(
            {"kill_switch": True, "active_scene": "BRB", "health_score": 0}
        ).eq("id", CHANNEL_ID).execute()
        sb.table("moderation_logs").insert(
            {
                "channel_id": CHANNEL_ID,
                "user_handle": "system",
                "action": "kill_switch",
                "severity": "HARD_BAN",
                "message": "Auto kill switch after repeated HARD_BAN",
                "source": "manual",
            }
        ).execute()


def record_hard_ban(user_handle: str) -> int:
    now = time.time()
    dq = _hard_ban_history[user_handle]
    dq.append(now)
    while dq and now - dq[0] > 600:
        dq.popleft()
    return len(dq)


@app.on_event("startup")
async def startup() -> None:
    print("[ENGINE] Safety Service Active")


@app.get("/health")
async def health() -> dict[str, Any]:
    return {"service": "safety-service", "ok": True, "whisper_loaded": _whisper_model is not None}


@app.post("/check")
async def check_message(req: CheckRequest) -> dict[str, Any]:
    result = classify(req.message)
    await write_moderation_log(req, result)

    response: dict[str, Any] = {
        "ok": True,
        "action": result["action"],
        "severity": result.get("severity"),
        "keyword": result.get("keyword"),
    }

    if result["severity"] == "HARD_BAN":
        await broadcast_alert(
            {
                "type": "hard_ban",
                "user_handle": req.user_handle,
                "keyword": result["keyword"],
                "message": req.message,
            }
        )
        count = record_hard_ban(req.user_handle)
        if count >= 2:
            response["action"] = "timeout"
            response["kill_switch"] = True
            await trigger_kill_switch()
            await broadcast_alert(
                {"type": "kill_switch", "user_handle": req.user_handle, "reason": "2x HARD_BAN in 10m"}
            )
        else:
            response["timeout_seconds"] = 600

    elif result["severity"] == "WARN":
        await broadcast_alert(
            {
                "type": "warn",
                "user_handle": req.user_handle,
                "keyword": result["keyword"],
            }
        )

    return response


@app.post("/transcribe")
async def transcribe(body: TranscribeRequest) -> dict[str, Any]:
    global _whisper_model
    if body.text_hint:
        return {"text": body.text_hint, "source": "hint"}
    try:
        if _whisper_model is None:
            from faster_whisper import WhisperModel

            _whisper_model = WhisperModel("tiny", device="cpu", compute_type="int8")
    except Exception as exc:
        return {
            "text": "",
            "error": "whisper_unavailable",
            "detail": str(exc),
            "stub": True,
        }
    return {
        "text": "",
        "note": "Provide audio_url ingestion in production; model loaded successfully",
        "stub": True,
    }


@app.websocket("/alerts")
async def alerts_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    _alert_clients.append(websocket)
    try:
        await websocket.send_json({"type": "connected", "service": "safety"})
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in _alert_clients:
            _alert_clients.remove(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=PORT)