import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

const DEFAULT_CHANNEL = "00000000-0000-4000-8000-000000000001";

function heuristicStatus(video_url: string, owner_handle: string): { status: string; action: string } {
  const url = video_url.toLowerCase();
  if (url.includes("blocked") || url.includes("copyright")) {
    return { status: "RED", action: "block" };
  }
  if (!owner_handle || owner_handle === "unknown") {
    return { status: "YELLOW", action: "review" };
  }
  if (url.includes("tiktok") || url.includes("youtube")) {
    return { status: "GREEN", action: "allow" };
  }
  return { status: "YELLOW", action: "review" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return jsonResponse({ error: "POST required" }, 405);

  try {
    const { video_url, owner_handle, channel_id, video_name } = await req.json();
    if (!video_url) return jsonResponse({ error: "video_url required" }, 400);

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, key);

    const { data: existing } = await supabase
      .from("rights_checks")
      .select("status, action")
      .eq("video_url", video_url)
      .maybeSingle();

    let status: string;
    let action: string;

    if (existing) {
      status = existing.status;
      action = existing.action || "allow";
    } else {
      const h = heuristicStatus(video_url, owner_handle || "");
      status = h.status;
      action = h.action;
      await supabase.from("rights_checks").insert({
        channel_id: channel_id || DEFAULT_CHANNEL,
        video_name: video_name || "Untitled",
        video_url,
        owner_handle: owner_handle || "unknown",
        status,
        action,
      });
    }

    const color =
      status === "GREEN" || status === "CLEAR"
        ? "green"
        : status === "YELLOW" || status === "REVIEW"
          ? "yellow"
          : "red";

    return jsonResponse({ status, color, action, video_url });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});