require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OBS_CONTROLLER_URL = process.env.OBS_CONTROLLER_URL || 'http://localhost:3011';
const CHANNEL_ID = process.env.CHANNEL_ID || '00000000-0000-4000-8000-000000000001';
const POLL_MS = 60 * 1000;
const WINDOW_MS = 60 * 1000;

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

async function obsPost(path, body = {}) {
  const res = await fetch(`${OBS_CONTROLLER_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function checkKillSwitch() {
  if (!supabase) return;
  const { data: channel } = await supabase
    .from('channels')
    .select('health_score, kill_switch')
    .eq('id', CHANNEL_ID)
    .maybeSingle();
  if (!channel) return;
  if (channel.kill_switch || (channel.health_score != null && channel.health_score < 30)) {
    console.log('[ENGINE] Kill Switch — switching to BRB');
    await obsPost('/scene', { sceneName: 'BRB' });
    await supabase
      .from('channels')
      .update({ kill_switch: true, active_scene: 'BRB', updated_at: new Date().toISOString() })
      .eq('id', CHANNEL_ID);
  }
}

async function runSchedule(schedule) {
  const scene = schedule.scene_name || 'Full Cam';
  console.log(`[ENGINE] Playlist Started: ${schedule.title}`);
  await obsPost('/scene', { sceneName: scene });
  if (schedule.wallpaper_name) {
    await obsPost('/wallpaper', { fileUrl: schedule.wallpaper_name });
  }
  if (schedule.auto_start !== false) {
    await obsPost('/stream/start');
  }
  if (supabase) {
    await supabase
      .from('schedules')
      .update({ executed: true })
      .eq('id', schedule.id);
    await supabase.from('engine_logs').insert({
      channel_id: CHANNEL_ID,
      service: 'automation-engine',
      level: 'info',
      message: `Schedule executed: ${schedule.title}`,
    });
  }
}

async function pollSchedules() {
  await checkKillSwitch();
  if (!supabase) {
    console.log('[ENGINE] Scheduler Running (no Supabase — idle)');
    return;
  }
  const now = Date.now();
  const windowStart = new Date(now - WINDOW_MS).toISOString();
  const windowEnd = new Date(now + WINDOW_MS).toISOString();
  const { data: schedules, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('channel_id', CHANNEL_ID)
    .eq('executed', false)
    .gte('starts_at', windowStart)
    .lte('starts_at', windowEnd);
  if (error) {
    console.warn('[ENGINE] Schedule poll error:', error.message);
    return;
  }
  for (const row of schedules || []) {
    const starts = new Date(row.starts_at).getTime();
    if (Math.abs(starts - now) <= WINDOW_MS) {
      await runSchedule(row);
    }
  }
}

console.log('[ENGINE] Scheduler Running');
setInterval(() => {
  pollSchedules().catch((e) => console.warn('[ENGINE] Poll failed:', e.message));
}, POLL_MS);
pollSchedules().catch(() => {});