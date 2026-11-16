"use client";

import { useCallback, useEffect, useState } from "react";
import { Gift, Plus, ShoppingBag, Eye, EyeOff, RotateCcw } from "lucide-react";
import { CHANNEL_ID } from "@/lib/supabase";

const SHOP_API = process.env.NEXT_PUBLIC_SHOP_ENGINE_URL || "http://localhost:3002";

type Product = {
  id: string;
  title: string;
  description?: string | null;
  price_cents: number;
  currency: string;
  image_url?: string | null;
  product_url?: string | null;
  source: string;
};

type Order = {
  id: string;
  buyer_username?: string | null;
  amount_cents?: number | null;
  status: string;
  created_at: string;
  shop_products?: { title?: string } | null;
};

function money(cents: number, currency = "GBP") {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

type QueueRow = {
  id: string;
  product_id: string;
  order_index: number;
  is_showing: boolean;
  shop_products?: { title?: string; price_cents?: number; currency?: string } | null;
};

export function ShopPanel({ onLog }: { onLog?: (msg: string) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [liveOk, setLiveOk] = useState<"…" | "UP" | "DOWN">("…");
  const [autoRotate, setAutoRotate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showingId, setShowingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    price: "",
    image_url: "",
    product_url: "",
    source: "manual",
  });

  const log = (msg: string) => onLog?.(msg);

  const load = useCallback(async () => {
    try {
      const [pRes, oRes, qRes] = await Promise.all([
        fetch(`${SHOP_API}/products?channel_id=${CHANNEL_ID}`),
        fetch(`${SHOP_API}/orders?channel_id=${CHANNEL_ID}`),
        fetch(`${SHOP_API}/shop/queue?channel_id=${CHANNEL_ID}`),
      ]);
      if (!pRes.ok) throw new Error(String(pRes.status));
      const pJson = await pRes.json();
      const oJson = await oRes.json().catch(() => ({ orders: [] }));
      const qJson = await qRes.json().catch(() => ({ queue: [] }));
      setProducts(pJson.products || []);
      setOrders(oJson.orders || []);
      setQueue(qJson.queue || []);
      const showing = (qJson.queue || []).find((q: QueueRow) => q.is_showing);
      setShowingId(showing?.product_id || qJson.showing?.product_id || null);
      setLiveOk("UP");
    } catch {
      setLiveOk("DOWN");
      log(`[ENGINE] Shop load failed — is :3002 running?`);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${SHOP_API}/products`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          channel_id: CHANNEL_ID,
          title: form.title,
          price_cents: Math.round(parseFloat(form.price || "0") * 100),
          image_url: form.image_url || null,
          product_url: form.product_url || null,
          source: form.source,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setForm({ title: "", price: "", image_url: "", product_url: "", source: "manual" });
      log(`[ENGINE] Shop product added — ${json.product.title}`);
      await load();
    } catch (err) {
      log(`[ENGINE] Shop add failed — ${err instanceof Error ? err.message : "error"}`);
    }
    setBusy(false);
  }

  async function showNow(productId: string) {
    setBusy(true);
    try {
      const res = await fetch(`${SHOP_API}/shop/show`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ product_id: productId, channel_id: CHANNEL_ID }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setShowingId(productId);
      log(`[ENGINE] Shop Show Now → ${json.product?.title || productId}`);
    } catch (err) {
      log(`[ENGINE] Shop show failed — ${err instanceof Error ? err.message : "error"}`);
    }
    setBusy(false);
  }

  async function hide() {
    await fetch(`${SHOP_API}/shop/hide`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channel_id: CHANNEL_ID }),
    });
    setShowingId(null);
    log(`[ENGINE] Shop overlay hidden`);
  }

  async function toggleAutoRotate() {
    const next = !autoRotate;
    const res = await fetch(`${SHOP_API}/shop/auto-rotate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: next, channel_id: CHANNEL_ID, interval_sec: 60 }),
    });
    const json = await res.json();
    if (res.ok) {
      setAutoRotate(next);
      log(`[ENGINE] Shop auto-rotate ${next ? "ON" : "OFF"}`);
      if (next && json) setShowingId(json.product?.id || showingId);
    }
  }

  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold flex items-center gap-2">
          <ShoppingBag size={16} className="text-[var(--cyan)]" /> LIVE SHOP
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              liveOk === "UP"
                ? "bg-[#2eff8f]/15 text-[#2eff8f]"
                : liveOk === "DOWN"
                  ? "bg-[#ff2a4d]/15 text-[#ff2a4d]"
                  : "bg-white/10 text-white/50"
            }`}
          >
            {liveOk === "UP" ? `SUPABASE · ${products.length} SKUs · Q${queue.length}` : liveOk}
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleAutoRotate}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold border ${
              autoRotate
                ? "border-cyan-400 bg-cyan-400/15 text-cyan-200"
                : "border-white/15 bg-white/5 text-white/70"
            }`}
          >
            <RotateCcw size={12} className="inline mr-1" />
            Auto 60s {autoRotate ? "ON" : "OFF"}
          </button>
          {showingId && (
            <button
              type="button"
              onClick={hide}
              className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold"
            >
              <EyeOff size={12} className="inline mr-1" /> Hide
            </button>
          )}
        </div>
      </div>

      <form onSubmit={addProduct} className="mb-3 grid gap-2 sm:grid-cols-2">
        <input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Product title"
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[13px] outline-none focus:border-cyan-400"
        />
        <input
          required
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="Price (e.g. 24.00)"
          inputMode="decimal"
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[13px] outline-none focus:border-cyan-400"
        />
        <input
          value={form.image_url}
          onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
          placeholder="Image URL"
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[13px] outline-none focus:border-cyan-400"
        />
        <input
          value={form.product_url}
          onChange={(e) => setForm((f) => ({ ...f, product_url: e.target.value }))}
          placeholder="Buy URL / QR target"
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[13px] outline-none focus:border-cyan-400"
        />
        <select
          value={form.source}
          onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[13px]"
        >
          <option value="manual">Manual</option>
          <option value="shopify">Shopify</option>
          <option value="woocommerce">WooCommerce</option>
          <option value="tiktok_shop">TikTok Shop</option>
        </select>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--cyan)] px-3 py-2 text-[13px] font-bold text-black disabled:opacity-60"
        >
          <Plus size={14} className="inline mr-1" /> Add Product
        </button>
      </form>

      <div className="space-y-2 max-h-[220px] overflow-y-auto mb-3">
        {products.length === 0 && (
          <p className="text-[12px] text-white/45">No products yet — add one above.</p>
        )}
        {products.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
              showingId === p.id
                ? "border-cyan-400/50 bg-cyan-400/10"
                : "border-white/10 bg-black/25"
            }`}
          >
            <div
              className="h-11 w-11 shrink-0 rounded-lg bg-cover bg-center border border-white/10"
              style={{
                backgroundImage: `url(${p.image_url || "https://placehold.co/88x88/1a1a28/fff?text=P"})`,
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[13px] truncate">{p.title}</p>
              <p className="text-[11px] text-white/55">
                {money(p.price_cents, p.currency)} · {p.source}
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => showNow(p.id)}
              className="shrink-0 rounded-full bg-[var(--red)] px-3 py-1.5 text-[11px] font-bold"
            >
              <Eye size={12} className="inline mr-1" /> Show Now
            </button>
          </div>
        ))}
      </div>

      <div>
        <h4 className="mb-2 flex items-center gap-2 text-[12px] font-bold tracking-wider text-white/60">
          <Gift size={13} /> LIVE ORDERS
        </h4>
        <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
          {orders.length === 0 && (
            <p className="text-[12px] text-white/40">No orders yet — Shopify/TikTok webhooks land here.</p>
          )}
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between rounded-lg bg-black/30 border border-white/10 px-2.5 py-1.5 text-[12px]"
            >
              <span className="truncate">
                <strong>{o.buyer_username || "buyer"}</strong> ·{" "}
                {o.shop_products?.title || "Product"}
              </span>
              <span className="text-cyan-300 font-bold">
                {money(o.amount_cents || 0)} · {o.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
