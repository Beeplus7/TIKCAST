import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

const HARD_BAN = ["threat", "kill", "bomb", "self-harm", "blood", "graphic"];
const WARN = ["spam", "link", "promo"];
const DEFAULT_CHANNEL = "00000000-0000-4000-8000-000000000001";

function checkMessage(message: string) {
  const lower = message.toLowerCase();
  for (const w of HARD_BAN) {
    if (lower.includes(w)) return { action: "ban", severity: "HARD_BAN", keyword: w, timeout_seconds: 600 };
  }
  for (const w of WARN) {
    if (lower.includes(w)) return { action: "flag", severity: "WARN", keyword: w };
  }
  return { action: "allow", severity: null, keyword: null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return jsonResponse({ error: "POST required" }, 405);

  try {
    const body = await req.json();
    const message = body.message || "";
    const user_handle = body.user_handle || "anonymous";
    const channel_id = body.channel_id || DEFAULT_CHANNEL;

    const result = checkMessage(message);

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, key);

    if (result.action !== "allow") {
      await supabase.from("moderation_logs").insert({
        channel_id,
        user_handle,
        keyword: result.keyword,
        message,
        action: result.action,
        severity: result.severity,
        source: "chat",
      });
    }

    return jsonResponse({ ok: true, ...result, user_handle, channel_id });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});