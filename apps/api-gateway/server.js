require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const { buildRoutes } = require('./routes');

const PORT = process.env.API_GATEWAY_PORT || 3010;
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '';
const LOCAL_MODE =
  !JWT_SECRET ||
  JWT_SECRET.includes('your-') ||
  process.env.TIKCAST_LOCAL === '1';

const app = express();
app.use(cors());
app.use(express.json());

function authMiddleware(req, res, next) {
  if (LOCAL_MODE) {
    return next();
  }
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required in non-local mode' });
  }
  next();
}

app.use('/api', authMiddleware, buildRoutes());

app.get('/', (_req, res) => {
  res.json({ name: 'TIKCAST API Gateway', docs: '/api/health' });
});

app.listen(PORT, () => {
  console.log('[ENGINE] API Gateway Ready');
});