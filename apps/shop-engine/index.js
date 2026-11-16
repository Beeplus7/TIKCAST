require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Node < 22: supabase-js realtime needs a WebSocket impl
if (typeof globalThis.WebSocket === 'undefined') {
  try {
    globalThis.WebSocket = require('ws');
  } catch {
    /* optional */
  }
}

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const PORT = Number(process.env.SHOP_ENGINE_PORT || 3002);
const CHANNEL_ID =
  process.env.CHANNEL_ID || '00000000-0000-4000-8000-000000000001';
const OBS_URL = process.env.OBS_CONTROLLER_URL || 'http://localhost:3011';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const supabase =
  SUPABASE_URL && SERVICE_KEY
    ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
    : null;

let autoRotateTimer = null;
let autoRotateOn = false;
let lastShownProductId = null;

async function obsSource(sourceName, visible, settings) {
  try {
    const res = await fetch(`${OBS_URL}/source/visibility`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sourceName, visible, settings }),
    });
    return await res.json().catch(() => ({ ok: false, mock: true }));
  } catch {
    console.log(`[ENGINE] Shop OBS ${sourceName} visible=${visible} (mock — OBS offline)`);
    return { ok: true, mock: true, sourceName, visible };
  }
}

async function showProduct(productId, channelId = CHANNEL_ID) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: product, error } = await supabase
    .from('shop_products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  if (!product) throw new Error('Product not found or inactive');

  await supabase
    .from('live_shop_queue')
    .update({ is_showing: false })
    .eq('channel_id', channelId);

  const { data: queueRow } = await supabase
    .from('live_shop_queue')
    .select('id')
    .eq('channel_id', channelId)
    .eq('product_id', productId)
    .maybeSingle();

  if (queueRow) {
    await supabase
      .from('live_shop_queue')
      .update({ is_showing: true, shown_at: new Date().toISOString() })
      .eq('id', queueRow.id);
  } else {
    await supabase.from('live_shop_queue').insert({
      channel_id: channelId,
      product_id: productId,
      is_showing: true,
      shown_at: new Date().toISOString(),
      order_index: 999,
    });
  }

  const price = `${product.currency || 'GBP'} ${(product.price_cents / 100).toFixed(2)}`;
  const overlayText = `${product.title} · ${price} · Tap To Buy`;
  await obsSource('Shop_Card', true, {
    product,
    overlayText,
    qrUrl: product.product_url,
  });

  lastShownProductId = productId;
  console.log(`[ENGINE] Shop show → ${product.title}`);
  return { ok: true, product, overlay: overlayText };
}

async function hideProduct(channelId = CHANNEL_ID) {
  if (supabase) {
    await supabase
      .from('live_shop_queue')
      .update({ is_showing: false })
      .eq('channel_id', channelId);
  }
  await obsSource('Shop_Card', false);
  console.log('[ENGINE] Shop hide');
  return { ok: true };
}

async function rotateNext(channelId = CHANNEL_ID) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: queue, error } = await supabase
    .from('live_shop_queue')
    .select('id, product_id, order_index, shop_products(*)')
    .eq('channel_id', channelId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  if (!queue?.length) return { ok: false, error: 'Queue empty' };

  const idx = Math.max(
    0,
    queue.findIndex((q) => q.product_id === lastShownProductId)
  );
  const next = queue[(idx + 1) % queue.length];
  return showProduct(next.product_id, channelId);
}

app.get('/health', (_req, res) => {
  res.json({
    service: 'shop-engine',
    supabase: Boolean(supabase),
    autoRotate: autoRotateOn,
    ok: true,
  });
});

app.get('/products', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const channelId = req.query.channel_id || CHANNEL_ID;
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .eq('channel_id', channelId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ products: data || [], source: 'supabase' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/shop/queue', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const channelId = req.query.channel_id || CHANNEL_ID;
    const { data, error } = await supabase
      .from('live_shop_queue')
      .select('id, product_id, order_index, is_showing, shown_at, display_duration_sec, shop_products(*)')
      .eq('channel_id', channelId)
      .order('order_index', { ascending: true });
    if (error) throw error;
    const showing = (data || []).find((q) => q.is_showing) || null;
    res.json({
      queue: data || [],
      showing,
      source: 'supabase',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/products', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const body = req.body || {};
    const channelId = body.channel_id || CHANNEL_ID;
    const row = {
      channel_id: channelId,
      title: String(body.title || '').trim(),
      description: body.description || null,
      price_cents: Number(body.price_cents),
      currency: body.currency || 'GBP',
      image_url: body.image_url || null,
      product_url: body.product_url || null,
      source: body.source || 'manual',
      external_id: body.external_id || null,
      is_active: true,
    };
    if (!row.title || !Number.isFinite(row.price_cents)) {
      return res.status(400).json({ error: 'title and price_cents required' });
    }
    const { data, error } = await supabase.from('shop_products').insert(row).select().single();
    if (error) throw error;
    const { count } = await supabase
      .from('live_shop_queue')
      .select('*', { count: 'exact', head: true })
      .eq('channel_id', channelId);
    await supabase.from('live_shop_queue').insert({
      channel_id: channelId,
      product_id: data.id,
      order_index: count || 0,
      display_duration_sec: 60,
    });
    res.json({ product: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/shop/show', async (req, res) => {
  try {
    const productId = req.body?.product_id;
    if (!productId) return res.status(400).json({ error: 'product_id required' });
    const result = await showProduct(productId, req.body?.channel_id || CHANNEL_ID);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/shop/hide', async (req, res) => {
  try {
    res.json(await hideProduct(req.body?.channel_id || CHANNEL_ID));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/shop/auto-rotate', async (req, res) => {
  try {
    const enabled = Boolean(req.body?.enabled);
    const channelId = req.body?.channel_id || CHANNEL_ID;
    const intervalSec = Number(req.body?.interval_sec || 60);

    if (autoRotateTimer) {
      clearInterval(autoRotateTimer);
      autoRotateTimer = null;
    }
    autoRotateOn = enabled;

    if (enabled) {
      await rotateNext(channelId);
      autoRotateTimer = setInterval(() => {
        rotateNext(channelId).catch((err) =>
          console.warn('[ENGINE] Shop rotate failed:', err.message)
        );
      }, Math.max(15, intervalSec) * 1000);
      console.log(`[ENGINE] Shop auto-rotate ON every ${intervalSec}s`);
    } else {
      console.log('[ENGINE] Shop auto-rotate OFF');
    }

    res.json({ ok: true, autoRotate: autoRotateOn, intervalSec });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/shop/gift-trigger', async (req, res) => {
  try {
    const channelId = req.body?.channel_id || CHANNEL_ID;
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const { data: queue } = await supabase
      .from('live_shop_queue')
      .select('product_id')
      .eq('channel_id', channelId)
      .order('order_index', { ascending: true })
      .limit(1);
    if (!queue?.length) return res.status(404).json({ error: 'No products in queue' });
    const result = await showProduct(queue[0].product_id, channelId);
    console.log(`[ENGINE] Shop gift-to-buy from ${req.body?.from || 'viewer'}`);
    res.json({ ...result, gift: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/orders', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const channelId = req.query.channel_id || CHANNEL_ID;
    const { data, error } = await supabase
      .from('shop_orders')
      .select('*, shop_products(title)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ orders: data || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/webhooks/shopify', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const order = req.body || {};
    const channelId = req.query.channel_id || CHANNEL_ID;
    const line = order.line_items?.[0] || {};
    const row = {
      channel_id: channelId,
      product_id: line.tikcast_product_id || null,
      buyer_username: order.customer?.email || order.email || order.billing_address?.name || 'shopify',
      amount_cents: Math.round(Number(order.total_price || line.price || 0) * 100),
      status: 'paid',
      external_order_id: String(order.id || order.order_number || ''),
    };
    const { data, error } = await supabase.from('shop_orders').insert(row).select().single();
    if (error) throw error;
    console.log(`[ENGINE] Shop Shopify order saved ${data.id}`);
    res.json({ ok: true, order: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/webhooks/tiktok-shop', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });
    const order = req.body || {};
    const channelId = req.query.channel_id || CHANNEL_ID;
    const row = {
      channel_id: channelId,
      product_id: order.product_id || null,
      buyer_username: order.buyer_username || order.username || 'tiktok_shop',
      amount_cents: Number(order.amount_cents || 0),
      status: order.status || 'paid',
      external_order_id: String(order.order_id || order.id || ''),
    };
    const { data, error } = await supabase.from('shop_orders').insert(row).select().single();
    if (error) throw error;
    console.log(`[ENGINE] Shop TikTok order saved ${data.id}`);
    res.json({ ok: true, order: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ENGINE] Shop Connected — listening on :${PORT}`);
});
