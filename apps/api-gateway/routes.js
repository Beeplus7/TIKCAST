const express = require('express');
const fetch = require('node-fetch');

const OBS_URL = process.env.OBS_CONTROLLER_URL || 'http://localhost:3011';
const SAFETY_URL = process.env.SAFETY_SERVICE_URL || 'http://localhost:3012';

function buildRoutes() {
  const router = express.Router();

  router.get('/health', async (_req, res) => {
    const health = { gateway: true, services: {} };
    try {
      const obs = await fetch(`${OBS_URL}/health`);
      health.services.obsController = await obs.json();
    } catch {
      health.services.obsController = { ok: false };
    }
    try {
      const safety = await fetch(`${SAFETY_URL}/health`);
      health.services.safety = await safety.json();
    } catch {
      health.services.safety = { ok: false };
    }
    res.json(health);
  });

  router.post('/scene', async (req, res) => {
    try {
      const r = await fetch(`${OBS_URL}/scene`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      res.status(r.status).json(await r.json());
    } catch (e) {
      res.status(502).json({ error: e.message });
    }
  });

  router.post('/wallpaper', async (req, res) => {
    try {
      const r = await fetch(`${OBS_URL}/wallpaper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      res.status(r.status).json(await r.json());
    } catch (e) {
      res.status(502).json({ error: e.message });
    }
  });

  router.post('/stream/start', async (_req, res) => {
    try {
      const r = await fetch(`${OBS_URL}/stream/start`, { method: 'POST' });
      res.status(r.status).json(await r.json());
    } catch (e) {
      res.status(502).json({ error: e.message });
    }
  });

  router.post('/stream/stop', async (_req, res) => {
    try {
      const r = await fetch(`${OBS_URL}/stream/stop`, { method: 'POST' });
      res.status(r.status).json(await r.json());
    } catch (e) {
      res.status(502).json({ error: e.message });
    }
  });

  router.post('/moderation/check', async (req, res) => {
    try {
      const r = await fetch(`${SAFETY_URL}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      res.status(r.status).json(await r.json());
    } catch (e) {
      res.status(502).json({ error: e.message });
    }
  });

  router.post('/kill-switch', async (_req, res) => {
    try {
      const r = await fetch(`${OBS_URL}/scene`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneName: 'BRB' }),
      });
      res.status(r.status).json(await r.json());
    } catch (e) {
      res.status(502).json({ error: e.message });
    }
  });

  return router;
}

module.exports = { buildRoutes };