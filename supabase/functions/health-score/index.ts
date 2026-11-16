import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";

const DEFAULT_CHANNEL = "00000000-0000-4000-8000-000000000001";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, key);

    const body = req.method === "POST" ? await req.json() : {};
    const channelId = body.channel_id || DEFAULT_CHANNEL;

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [mods, rights, comments, gifts] = await Promise.all([
      supabase
        .from("moderation_logs")
        .select("severity, action")
        .eq("channel_id", channelId)
        .gte("created_at", since),
      supabase.from("rights_checks").select("status").eq("channel_id", channelId),
      supabase.from("comments").select("id", { count: "exact", head: true }).eq("channel_id", channelId).gte("created_at", since),
      supabase.from("gifts").select("id", { count: "exact", head: true }).eq("channel_id", channelId).gte("created_at", since),
    ]);

    let score = 92;
    const modRows = mods.data || [];
    const hard = modRows.filter((m) => m.severity === "HARD_BAN").length;
    const warns = modRows.filter((m) => m.severity === "WARN").length;
    score -= hard * 12;
    score -= warns * 3;

    const rightsRows = rights.data || [];
    const blocked = rightsRows.filter((r) => ["BLOCKED", "RED"].includes(r.status)).length;
    const review = rightsRows.filter((r) => ["REVIEW", "YELLOW"].includes(r.status)).length;
    score -= blocked * 15;
    score -= review * 5;

    const engagement = (comments.count || 0) + (gifts.count || 0) * 2;
    score += Math.min(10, Math.floor(engagement / 50));

    score = Math.max(0, Math.min(100, score));

    let risk_level: string;
    if (score >= 80) risk_level = "low";
    else if (score >= 50) risk_level = "medium";
    else if (score >= 30) risk_level = "high";
    else risk_level = "critical";

    await supabase.from("channels").update({ health_score: score }).eq("id", channelId);

    return jsonResponse({ score, risk_level, channel_id: channelId });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});