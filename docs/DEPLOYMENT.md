# Deployment

CanchealApp is deployed as two independent services: the frontend on Vercel and the backend on Render. The database should be a managed PostgreSQL instance compatible with Prisma.

## Frontend on Vercel

Recommended Vercel settings:

| Setting | Value |
| --- | --- |
| Root directory | `frontend` |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output | Next.js default |

Required environment variable:

```env
NEXT_PUBLIC_API_URL=https://canchealapp.onrender.com
```

Deploy checklist:

1. Configure the Vercel project root as `frontend`.
2. Add `NEXT_PUBLIC_API_URL`.
3. Deploy.
4. Confirm the frontend can call `/health` through the backend URL.

## Backend on Render

Recommended Render settings:

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Build command | `npm install && npx prisma generate` |
| Start command | `npm start` |

Required environment variables:

```env
DATABASE_URL=<managed-postgres-url>
JWT_SECRET=<strong-secret>
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://cancheal-app.vercel.app
FRONTEND_URLS=https://cancheal-app.vercel.app
CORS_ORIGINS=https://cancheal-app.vercel.app
```

Render usually injects its own `PORT`; keep the app compatible by reading `process.env.PORT`, which the backend already does.

## Database Migrations

For production, migrations should be applied before or during release:

```bash
cd backend
npx prisma migrate deploy
```

For local development:

```bash
cd backend
npx prisma migrate dev
```

## CORS

The backend allows:

- Localhost origins used for development.
- The production Vercel frontend.
- Matching Vercel preview URLs for the current project suffix.
- Additional origins configured via `FRONTEND_URL`, `FRONTEND_URLS`, or `CORS_ORIGINS`.

Do not set `*` as an allowed origin while credentials are enabled.

## Health Check

Use:

```http
GET /health
```

Expected response:

```json
{ "ok": true, "db": "up" }
```

## Release Validation

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend:

```bash
cd backend
npm test
npx prisma validate
```

Production smoke checks:

- Open the frontend.
- Register or log in.
- Load clubs.
- Open a club detail page.
- Check availability for a field.
- Create a booking.
- Cancel a booking from `My Bookings`.
