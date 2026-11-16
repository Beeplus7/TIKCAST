"""
Stub YouTube import via yt-dlp.

Before importing, run rights-check edge function or query rights_checks table.
"""

import json
import subprocess
import sys


def run_rights_note(video_url: str) -> dict:
    return {
        "video_url": video_url,
        "note": "Call supabase/functions/rights-check before publishing imported media",
        "status": "pending_review",
    }


def import_metadata(video_url: str) -> dict:
    try:
        out = subprocess.run(
            ["yt-dlp", "-J", "--no-download", video_url],
            capture_output=True,
            text=True,
            check=False,
        )
        if out.returncode != 0:
            return {"error": out.stderr or "yt-dlp failed", "rights": run_rights_note(video_url)}
        meta = json.loads(out.stdout)
        return {
            "title": meta.get("title"),
            "duration": meta.get("duration"),
            "uploader": meta.get("uploader"),
            "rights": run_rights_note(video_url),
        }
    except FileNotFoundError:
        return {
            "stub": True,
            "error": "yt-dlp not installed",
            "rights": run_rights_note(video_url),
        }


if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    print(json.dumps(import_metadata(url), indent=2))