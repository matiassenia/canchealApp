
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

const isProduction = process.env.NODE_ENV === 'production';
const corsOriginsValue = process.env.CORS_ORIGINS || (isProduction ? '' : 'http://localhost:3000');
const allowedOrigins = corsOriginsValue
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && !allowedOrigins.length) {
  console.error('CORS_ORIGINS is required in production.');
  process.exit(1);
}

if (allowedOrigins.includes('*')) {
  console.error('CORS_ORIGINS cannot include * when credentials are enabled.');
  process.exit(1);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
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

