import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(url && anon && !url.includes("YOUR_"));

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anon)
  : null;

export const CHANNEL_ID =
  process.env.NEXT_PUBLIC_CHANNEL_ID ||
  "00000000-0000-4000-8000-000000000001";

export const OBS_API =
  process.env.NEXT_PUBLIC_OBS_CONTROLLER_URL || "http://localhost:3011";

export const GATEWAY_API =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3010";

export const DASHBOARD_HINT =
  "Dashboard runs on :3005 · Gateway :3010 · OBS :3011 · Safety :3012";
