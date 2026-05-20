# AGENTS

## Repo shape
- Two separate Node projects, no workspace runner: `backend/` (Express + Prisma) and `frontend/` (Next.js pages router).
- Start commands and installs must be run per folder; root has no `package.json` scripts.

## Local run order (backend depends on DB)
- Start Postgres first from repo root: `docker compose up -d` (uses `docker-compose.yml`, DB `canchas_app` on `localhost:5432`).
- Backend setup/run from `backend/`: `npm install`, `npx prisma migrate dev`, then `npm run dev` (runs `node index.js`, default port `4000`).
- Frontend setup/run from `frontend/`: `npm install`, then `npm run dev` (default port `3000`).

## Env and integration gotchas
- Frontend API client uses `process.env.NEXT_PUBLIC_API_URL` and falls back to empty string (`frontend/lib/api.js`), so without that env it calls same-origin paths and misses backend; set it to `http://localhost:4000` for local full-stack work.
- Backend CORS allowlist comes from `CORS_ORIGINS` (comma-separated) and defaults to only `http://localhost:3000` (`backend/index.js`).
- Backend requires `DATABASE_URL` and `JWT_SECRET` in `backend/.env`; `PORT` defaults to `4000`.

## Verification shortcuts
- Backend health check: `GET /health` verifies API + DB query (`SELECT 1`).
- Frontend lint only exists in `frontend/`: `npm run lint`.
- Backend has no real test suite (`npm test` is a placeholder that exits with error), so validate backend changes via targeted endpoint calls.

## Prisma workflow notes
- Schema is `backend/prisma/schema.prisma` (PostgreSQL).
- After model changes, run migration (`npx prisma migrate dev`) before running app code that depends on new columns/tables.
- Seed script exists at `backend/prisma/seed.js`, but no npm script is wired; run explicitly with `node prisma/seed.js` from `backend/` when needed.
