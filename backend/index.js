
// 🚀 Archivo principal (`index.js`)
//`js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const prisma = require('./src/lib/prisma');

const app = express();

if (!process.env.JWT_SECRET) {
  console.error('Missing required environment variable: JWT_SECRET');
  process.exit(1);
}

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://cancheal-app.vercel.app',
];

const VERCEL_PROJECT_SUFFIX = '-matias-projects-53ae7b18.vercel.app';

function parseOrigins(value) {
  return (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...parseOrigins(process.env.FRONTEND_URLS),
  ...parseOrigins(process.env.CORS_ORIGINS),
].filter(Boolean);

const allowedOrigins = new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]);

if (allowedOrigins.has('*')) {
  console.error('CORS origins cannot include * when credentials are enabled.');
  process.exit(1);
}

function isAllowedVercelPreview(origin) {
  return origin.startsWith('https://cancheal-') && origin.endsWith(VERCEL_PROJECT_SUFFIX);
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allowedOrigins.has(origin) || isAllowedVercelPreview(origin);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Origin not allowed by CORS' });
  }
  next();
});
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();
  res.locals.dbTimings = [];
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const logPayload = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(1)),
      db: res.locals.dbTimings
    };
    console.log(JSON.stringify(logPayload));
  });
  next();
});

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const clubRoutes = require('./src/routes/clubRoutes');
const fieldRoutes = require('./src/routes/fieldRoutes');
const availabilityRoutes = require('./src/routes/availabilityRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');

// Usar rutas
app.use('/auth', authRoutes);
app.use('/clubs', clubRoutes);
app.use('/fields', fieldRoutes);
app.use('/availability', availabilityRoutes);
app.use('/bookings', bookingRoutes);

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'up' });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ ok: false, db: 'down' });
  }
});

// Puerto y start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

