#!/usr/bin/env node
/**
 * Apply TIKCAST SQL migrations to Supabase Postgres.
 * Usage: node scripts/apply-migrations.js
 * Prefers DATABASE_URL / SUPABASE_DB_URL; if direct IPv6 fails, uses
 * SUPABASE_POOLER_URL or builds aws-1-eu-west-1 pooler from project ref.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function buildUrls() {
  const urls = [];
  if (process.env.SUPABASE_POOLER_URL) urls.push(process.env.SUPABASE_POOLER_URL);
  if (process.env.SUPABASE_DB_URL) urls.push(process.env.SUPABASE_DB_URL);
  if (process.env.DATABASE_URL) urls.push(process.env.DATABASE_URL);

  const base = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';
  try {
    const u = new URL(base);
    const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
      .replace(/^https?:\/\//, '')
      .split('.')[0];
    if (ref && u.password) {
      const pass = decodeURIComponent(u.password);
      urls.push(
        `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`
      );
      urls.push(
        `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`
      );
    }
  } catch {}
  return [...new Set(urls.filter(Boolean))];
}

const files = [
  'supabase/migrations/20241116000000_init.sql',
  'supabase/migrations/20241116000001_storage.sql',
  'supabase/migrations/20241116120000_shop_music.sql',
];

async function connect() {
  const errors = [];
  for (const connectionString of buildUrls()) {
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12000,
    });
    try {
      await client.connect();
      console.log('[MIGRATE] Connected via', connectionString.replace(/:[^:@/]+@/, ':***@'));
      return client;
    } catch (e) {
      errors.push((connectionString.replace(/:[^:@/]+@/, ':***@')) + ' → ' + e.message.split('\n')[0]);
      try { await client.end(); } catch {}
    }
  }
  throw new Error('All DB URLs failed:\n' + errors.join('\n'));
}

(async () => {
  const client = await connect();
  const sqlPath = path.resolve(__dirname, '../supabase/combined_apply.sql');
  if (fs.existsSync(sqlPath)) {
    console.log('[MIGRATE] Applying combined_apply.sql');
    await client.query(fs.readFileSync(sqlPath, 'utf8'));
    console.log('[MIGRATE] OK combined');
  } else {
    for (const file of files) {
      const full = path.resolve(__dirname, '..', file);
      console.log('[MIGRATE] Applying', file);
      await client.query(fs.readFileSync(full, 'utf8'));
      console.log('[MIGRATE] OK', file);
    }
  }
  const { rows } = await client.query(`
    select table_name from information_schema.tables
    where table_schema='public'
      and table_name in (
        'shop_products','live_shop_queue','shop_orders',
        'music_tracks','music_playlists','music_playlist_items',
        'music_providers','music_now_playing','channels','profiles'
      )
    order by 1`);
  console.log('[MIGRATE] Tables:', rows.map((r) => r.table_name).join(', ') || '(none)');
  await client.query(`notify pgrst, 'reload schema'`);
  await client.end();
})().catch((e) => {
  console.error('[MIGRATE] FAILED:', e.message);
  process.exit(1);
});
