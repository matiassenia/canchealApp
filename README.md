# CanchealApp

Football field booking platform with player discovery flow and owner operations flow.

## Product Summary

CanchealApp helps:
- **Players** discover clubs, check availability, book slots, and manage reservations.
- **Club owners** manage clubs/fields, configure weekly availability, and monitor operational KPIs.

Current architecture stays intentionally simple: one backend API + one frontend app.

## Architecture

```text
Frontend (Next.js pages router)
        |
        v
Backend API (Express)
        |
        v
Prisma ORM
        |
        v
PostgreSQL
```

- `frontend/`: Next.js UI and booking UX
- `backend/`: Express routes/controllers, auth, Prisma data access
- `docker-compose.yml`: local Postgres

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Node.js, Express 4, Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (Bearer token)

## Core Features

- Register / login
- Explore clubs and profile pages
- Contextual booking flow (Explore/Club -> Availability)
- Slot-based availability UI
- Booking creation with overlap protection
- Booking cancellation (`DELETE /bookings/:id`, soft cancel)
- Owner dashboard and club/field/availability management
- Role-based authorization (`USER`, `OWNER`, `ADMIN`)

## Booking Flow (Player)

1. Explore clubs (`/explore`) or clubs list (`/clubs`)
2. Open club profile (`/clubs/[id]`)
3. Go to availability (`/availability?clubId=...&fieldId=...`)
4. Select field + slot
5. Confirm booking
6. Track/cancel in `My Bookings` (`/my-bookings`)

## Owner Flow

1. Login as owner
2. Open owner dashboard (`/owner/dashboard`)
3. Create/manage clubs
4. Create fields
5. Edit weekly availability and save
6. Use operational cards/sections for daily visibility

## API Overview

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Clubs
- `GET /clubs`
- `POST /clubs` (auth)

### Fields
- `GET /fields`
- `GET /fields/club/:id`
- `POST /fields` (auth)

### Availability
- `GET /availability/:id`
- `GET /availability/:id/slots?date=YYYY-MM-DD&slotMinutes=60`
- `POST /availability` (auth)

### Bookings
- `POST /bookings` (auth)
- `GET /bookings/user` (auth)
- `DELETE /bookings/:id` (auth)
- `PATCH /bookings/:id/status` (auth)

## Demo Credentials

Seed creates these users:
- `demo.user@cancheal.test` / `demo1234`
- `demo.owner@cancheal.test` / `demo1234`
- `demo.admin@cancheal.test` / `demo1234`

## Screenshots (Placeholders)

Add screenshots here before publishing:
- `docs/screenshots/explore.png`
- `docs/screenshots/club-profile.png`
- `docs/screenshots/availability.png`
- `docs/screenshots/my-bookings.png`
- `docs/screenshots/owner-dashboard.png`

## Project Structure

```text
.
├─ backend/
│  ├─ index.js
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ seed.js
│  └─ src/
│     ├─ controllers/
│     ├─ middlewares/
│     ├─ routes/
│     └─ utils/
├─ frontend/
│  ├─ components/
│  ├─ lib/
│  └─ pages/
└─ docker-compose.yml
```

## Environment Variables

### Backend (`backend/.env`)
- `DATABASE_URL` (required)
- `JWT_SECRET` (required)
- `PORT` (optional, default `4000`)
- `CORS_ORIGINS` (optional, comma-separated; default allows `http://localhost:3000`)

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL` (recommended: `http://localhost:4000`)

## Local Setup

### 1) Start database

```bash
docker compose up -d
```

### 2) Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

## Seed / Demo Data

Reset DB and load realistic demo data:

```bash
cd backend
npx prisma migrate reset --force
npm run seed
```

Seed includes:
- 6 clubs in different zones
- multiple fields per club (5/7/11)
- varied weekly availability
- sample bookings with `PENDING`, `CONFIRMED`, `CANCELLED`

## Manual QA Checklist

- **Player flow:** login -> explore -> club profile -> availability -> book
- **Booking reliability:** confirm booking, verify success feedback
- **Cancellation flow:** cancel from `my-bookings`, verify `CANCELLED` badge
- **Owner flow:** login owner -> dashboard -> create field -> save availability
- **Availability management:** switch fields and verify loaded weekly slots

## Deployment Notes

### Frontend (Vercel)
- Root directory: `frontend`
- Build command: `npm run build`
- Required env: `NEXT_PUBLIC_API_URL=<your-backend-url>`

### Backend (Railway or Render)
- Root directory: `backend`
- Start command: `npm run dev` (or `node index.js`)
- Required env: `DATABASE_URL`, `JWT_SECRET`, optional `CORS_ORIGINS`, `PORT`

### PostgreSQL (Neon or Supabase)
- Create Postgres instance
- Copy connection string to `DATABASE_URL`
- Run Prisma migrations from backend:

```bash
cd backend
npx prisma migrate deploy
```

## Production Build Readiness (Current Status)

- **Backend:** basic syntax checks pass.
- **Frontend:** `npm run build` currently fails due lint/type issues in some existing pages/components.

Before public deploy, fix frontend build blockers flagged by Next.js lint/type check.

## Likely Deployment Risks

- Frontend build blockers (lint/parser issues) prevent successful production build.
- Missing/incorrect `NEXT_PUBLIC_API_URL` causes API calls to wrong origin.
- Missing `CORS_ORIGINS` in backend may block frontend requests in hosted envs.
- Weak or leaked JWT secrets in non-local environments.
- Timezone assumptions in booking display/selection can cause confusion across regions.

## Future Improvements (Scoped, Realistic)

- Add backend automated tests for auth/booking/availability paths.
- Add frontend e2e smoke tests for booking and cancellation.
- Improve timezone handling UX and formatting consistency.
- Add screenshots and short demo video for portfolio presentation.
- Add lightweight CI checks for `npm run build` and Prisma migration validation.
