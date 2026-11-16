require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const obsWs = require('obs-websocket-js');
const OBSWebSocket = obsWs.default || obsWs.OBSWebSocket || obsWs;

const PORT = process.env.OBS_CONTROLLER_PORT || 3011;
const OBS_URL = process.env.OBS_WEBSOCKET_URL || 'ws://localhost:4455';
const OBS_PASSWORD = process.env.OBS_WEBSOCKET_PASSWORD || '';

const app = express();
app.use(cors());
app.use(express.json());

const obs = new OBSWebSocket();
let obsConnected = false;
let mockQueue = [];
let reconnectTimer = null;
let lastObsError = null;

const RTMP_URL = process.env.TIKTOK_RTMP_URL || '';
const RTMP_KEY = process.env.TIKTOK_STREAM_KEY || '';
const rtmpConfigured =
  Boolean(RTMP_URL) &&
  Boolean(RTMP_KEY) &&
  !/^\s*rtmp:\/\/\.\.\.\s*$/i.test(RTMP_URL) &&
  !/YOUR_|changeme|TODO|xxx|\.\.\./i.test(RTMP_KEY);

const SCENE_ALIASES = {
  'full-cam': 'Full Cam',
  'split-screen': 'Split Screen',
  reaction: 'Reaction',
  'news-desk': 'News Desk',
  shopping: 'Shopping',
  gaming: 'Gaming',
  'dj-radio': 'DJ Radio',
  'movie-mode': 'Movie Mode',
  brb: 'BRB',
};

function resolveSceneName(name) {
  if (!name) return name;
  const key = String(name).toLowerCase().replace(/\s+/g, '-');
  return SCENE_ALIASES[key] || name;
}

async function connectObs() {
  try {
    await obs.connect(OBS_URL, OBS_PASSWORD || undefined);
    obsConnected = true;
    lastObsError = null;
    console.log('[ENGINE] OBS Connected');
    while (mockQueue.length) {
      const job = mockQueue.shift();
      try {
        await job();
      } catch (e) {
        console.warn('[ENGINE] Queued action failed:', e.message);
      }
    }
    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }
  } catch (err) {
    obsConnected = false;
    lastObsError = err?.message || String(err);
    if (!reconnectTimer) {
      console.log('[ENGINE] OBS offline — retrying');
      reconnectTimer = setInterval(() => {
        connectObs().catch(() => {});
      }, 5000);
    }
  }
}

obs.on('ConnectionClosed', () => {
  obsConnected = false;
  console.log('[ENGINE] OBS offline — retrying');
  if (!reconnectTimer) {
    reconnectTimer = setInterval(() => {
      connectObs().catch(() => {});
    }, 5000);
  }
});

async function switchScene(sceneName) {
  const resolved = resolveSceneName(sceneName);
  if (!obsConnected) {
    mockQueue.push(() => switchScene(sceneName));
    console.log(`[ENGINE] Scene Switched to ${resolved} (mock)`);
    return { ok: true, mock: true, sceneName: resolved };
  }
  await obs.call('SetCurrentProgramScene', { sceneName: resolved });
  console.log(`[ENGINE] Scene Switched to ${resolved}`);
  return { ok: true, sceneName: resolved };
}

async function setWallpaper(fileUrl) {
  if (!fileUrl) {
    return { ok: false, error: 'fileUrl required' };
  }
  if (!obsConnected) {
    console.log(`[ENGINE] Wallpaper set to ${fileUrl} (mock)`);
    return { ok: true, mock: true, fileUrl };
  }
  try {
    await obs.call('SetInputSettings', {
      inputName: 'Wallpaper',
      inputSettings: { local_file: fileUrl, is_local_file: true },
    });
    console.log(`[ENGINE] Wallpaper updated: ${fileUrl}`);
  } catch {
    await setSourceVisibility('Wallpaper', true);
    console.log(`[ENGINE] Wallpaper source toggled (fallback): ${fileUrl}`);
  }
  return { ok: true, fileUrl };
}

async function setSourceVisibility(sourceName, visible) {
  if (!obsConnected) {
    return { ok: true, mock: true, sourceName, visible };
  }
  await obs.call('SetSceneItemEnabled', {
    sceneName: await getCurrentScene(),
    sceneItemId: await findSceneItemId(sourceName),
    sceneItemEnabled: visible,
  });
  return { ok: true, sourceName, visible };
}

async function getCurrentScene() {
  const { currentProgramSceneName } = await obs.call('GetCurrentProgramScene');
  return currentProgramSceneName;
}

async function findSceneItemId(sourceName) {
  const sceneName = await getCurrentScene();
  const { sceneItems } = await obs.call('GetSceneItemList', { sceneName });
  const item = sceneItems.find((i) => i.sourceName === sourceName || i.sourceName.includes(sourceName));
  if (!item) throw new Error(`Source not found: ${sourceName}`);
  return item.sceneItemId;
}

async function startStream() {
  if (!obsConnected) {
    console.log('[ENGINE] Stream start (mock)');
    return { ok: true, mock: true, streaming: true };
  }
  const status = await obs.call('GetStreamStatus');
  if (status.outputActive) {
    return { ok: true, streaming: true, already: true };
  }
  await obs.call('StartStream');
  console.log('[ENGINE] Stream started');
  return { ok: true, streaming: true };
}

async function stopStream() {
  if (!obsConnected) {
    console.log('[ENGINE] Stream stop (mock)');
    return { ok: true, mock: true, streaming: false };
  }
  await obs.call('StopStream');
  console.log('[ENGINE] Stream stopped');
  return { ok: true, streaming: false };
}

app.get('/health', (_req, res) => {
  res.json({
    service: 'obs-controller',
    obsConnected,
    mockQueueLength: mockQueue.length,
    obsUrl: OBS_URL,
    passwordSet: Boolean(OBS_PASSWORD),
    lastError: lastObsError,
    rtmpConfigured,
    rtmpUrlSet: Boolean(RTMP_URL) && !/^\s*rtmp:\/\/\.\.\.\s*$/i.test(RTMP_URL),
    streamKeySet: Boolean(RTMP_KEY),
    ok: true,
  });
});

app.get('/stream/config', (_req, res) => {
  res.json({
    ok: true,
    obsConnected,
    rtmpConfigured,
    rtmpUrlSet: Boolean(RTMP_URL) && !/^\s*rtmp:\/\/\.\.\.\s*$/i.test(RTMP_URL),
    streamKeySet: Boolean(RTMP_KEY),
    goLiveReady: obsConnected && rtmpConfigured,
    blockers: [
      !obsConnected ? 'OBS WebSocket not connected (:4455)' : null,
      !OBS_PASSWORD ? 'OBS_WEBSOCKET_PASSWORD empty in .env' : null,
      !rtmpConfigured ? 'TIKTOK_RTMP_URL / TIKTOK_STREAM_KEY not set (still placeholder)' : null,
    ].filter(Boolean),
  });
});

app.post('/scene', async (req, res) => {
  try {
    const { sceneName } = req.body;
    if (!sceneName) {
      return res.status(400).json({ error: 'sceneName required' });
    }
    const result = await switchScene(sceneName);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/wallpaper', async (req, res) => {
  try {
    const { fileUrl } = req.body;
    const result = await setWallpaper(fileUrl);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/stream/start', async (_req, res) => {
  try {
    res.json(await startStream());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/stream/stop', async (_req, res) => {
  try {
    res.json(await stopStream());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/source/visibility', async (req, res) => {
  try {
    const { sourceName, visible, settings } = req.body || {};
    if (!sourceName) return res.status(400).json({ error: 'sourceName required' });
    const enabled = visible !== false;

    if (settings?.text && obsConnected) {
      try {
        await obs.call('SetInputSettings', {
          inputName: sourceName,
          inputSettings: { text: settings.text },
          overlay: true,
        });
      } catch {
        /* text source optional */
      }
    }

    if (settings?.fileUrl && obsConnected && sourceName === 'Music_Bank') {
      try {
        await obs.call('SetInputSettings', {
          inputName: 'Music_Bank',
          inputSettings: {
            local_file: settings.fileUrl,
            is_local_file: true,
          },
          overlay: true,
        });
      } catch {
        /* media source optional */
      }
    }

    try {
      const result = await setSourceVisibility(sourceName, enabled);
      console.log(`[ENGINE] Source ${sourceName} visible=${enabled}`);
      res.json({ ...result, settings: settings || null });
    } catch (e) {
      console.log(`[ENGINE] Source ${sourceName} visible=${enabled} (mock/fallback): ${e.message}`);
      res.json({ ok: true, mock: true, sourceName, visible: enabled, settings: settings || null });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

connectObs().catch(() => {});

app.listen(PORT, () => {
  console.log(`[ENGINE] OBS Controller listening on :${PORT}`);
});

module.exports = {
  switchScene,
  setWallpaper,
  setSourceVisibility,
  startStream,
  stopStream,
};