import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

const DEFAULT_CHANNEL = "00000000-0000-4000-8000-000000000001";
const CLIP_DURATION = 30;

function stubPeakDetection(recordingUrl: string): { start: number; end: number; peak: number } {
  const hash = [...recordingUrl].reduce((a, c) => a + c.charCodeAt(0), 0);
  const start = (hash % 120) + 10;
  return { start, end: start + CLIP_DURATION, peak: 0.65 + (hash % 30) / 100 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return jsonResponse({ error: "POST required" }, 405);

  try {
    const { recording_url, channel_id, title } = await req.json();
    if (!recording_url) return jsonResponse({ error: "recording_url required" }, 400);

    const peaks = stubPeakDetection(recording_url);
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, key);

    const clipPath = `clips/${crypto.randomUUID()}.mp4`;
    const publicUrl = `${url}/storage/v1/object/public/clips/${clipPath}`;

    const { data, error } = await supabase
      .from("clips")
      .insert({
        channel_id: channel_id || DEFAULT_CHANNEL,
        title: title || "Auto clip",
        storage_path: clipPath,
        public_url: publicUrl,
        start_seconds: peaks.start,
        end_seconds: peaks.end,
        peak_score: peaks.peak,
        source_recording_url: recording_url,
      })
      .select()
      .single();

    if (error) throw error;

    return jsonResponse({ clip: data, peaks });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});