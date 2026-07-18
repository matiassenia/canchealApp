# CanchealApp

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)

CanchealApp is a full-stack football field booking platform for players and club owners. Players can discover clubs, inspect fields, check availability, create reservations, and manage their booking history. Owners can publish clubs, add fields, configure weekly availability, and operate their venue from a dedicated dashboard.

The project is intentionally pragmatic: a Next.js frontend, an Express API, Prisma as the data access layer, and PostgreSQL as the source of truth.

> Banner placeholder: add a production-ready banner at `docs/images/banner.png` when visual assets are captured.

## Demo

- Frontend production: `https://cancheal-app.vercel.app`
- Backend production: `https://canchealapp.onrender.com`
- Backend health check: `https://canchealapp.onrender.com/health`

## Screenshots

Screenshots are intentionally referenced as documentation assets. Add the files below when capturing the final product screens:

| Screen | Path |
| --- | --- |
| Home | `docs/images/home.png` |
| Explore | `docs/images/explore.png` |
| Club detail | `docs/images/club.png` |
| Booking flow | `docs/images/booking.png` |
| Owner dashboard | `docs/images/dashboard.png` |

## Features

### Users

- Account registration and login.
- JWT-based authenticated sessions.
- Club marketplace and discovery views.
- Club profile pages with fields and booking calls to action.
- Field availability lookup by date.
- Booking creation with backend overlap protection.
- Booking history grouped by upcoming, past, and cancelled reservations.
- Booking cancellation.

### Owners

- Owner dashboard for operational workflows.
- Club creation for authenticated `OWNER` or `ADMIN` accounts.
- Field creation per owned club.
- Weekly availability management.
- Real operational counters based on clubs and fields already persisted.

### Platform

- Next.js Pages Router frontend.
- Express API with route/controller separation.
- Prisma ORM over PostgreSQL.
- Role-aware authorization using `USER`, `OWNER`, and `ADMIN`.
- Responsive sports-oriented design system built with TailwindCSS.
- Vercel frontend deployment and Render backend deployment.

## Architecture

```mermaid
flowchart LR
  Browser[Browser] --> NextJS[Next.js Frontend]
  NextJS --> API[Express API]
  API --> Prisma[Prisma Client]
  Prisma --> PostgreSQL[(PostgreSQL)]
```

The frontend owns rendering, routing, client-side authentication storage, and product flows. The backend owns authentication, authorization, validation, availability generation, reservation conflict checks, and persistence.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full architecture notes.

## Booking Flow

```mermaid
flowchart TD
  User[User] --> Marketplace[Explore clubs]
  Marketplace --> Club[Club detail]
  Club --> Field[Select field]
  Field --> Availability[Check available slots]
  Availability --> Booking[Create booking]
  Booking --> Database[(PostgreSQL)]
```

Bookings are created through the API with server-side validation and overlap detection inside a serializable transaction.

## Technologies

### Frontend

- Next.js 15
- React 19
- JavaScript
- TailwindCSS

### Backend

- Node.js
- Express 4
- Prisma Client
- bcryptjs
- jsonwebtoken
- cors
- dotenv

### Database

- PostgreSQL 15 locally via Docker Compose
- PostgreSQL-compatible managed database in production

### Deploy

- Vercel for the frontend
- Render for the backend

### Tools

- Prisma Migrate
- ESLint through `next lint`
- Docker Compose for local PostgreSQL

## Installation

This repository contains two independent Node projects: `backend/` and `frontend/`. Commands must be executed inside each folder.

### 1. Start PostgreSQL

From the repository root:

```bash
docker compose up -d
```

The local database is configured as:

```text
postgresql://postgres:postgres@localhost:5432/canchas_app
```

### 2. Configure Backend Environment

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/canchas_app?schema=public"
JWT_SECRET="replace-with-a-local-development-secret"
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
FRONTEND_URLS=http://localhost:3000,http://localhost:3001,https://cancheal-app.vercel.app
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://cancheal-app.vercel.app
```

### 3. Install and Run Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

### 4. Configure Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

If this variable is omitted, the frontend API client falls back to same-origin paths.

### 5. Install and Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

### Backend

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the Express server with `node index.js`. |
| `npm start` | Starts the Express server. |
| `npm run db:up` | Starts PostgreSQL using the root `docker-compose.yml`. |
| `npm run db:down` | Stops the local Docker database. |
| `npm run prisma:generate` | Generates Prisma Client. |
| `npm run prisma:migrate` | Runs `prisma migrate dev`. |
| `npm run seed` | Executes `backend/prisma/seed.js`. |
| `npm test` | Runs a syntax check for `backend/index.js`. |

### Frontend

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the Next.js development server. |
| `npm run build` | Builds the production frontend. |
| `npm start` | Starts the production Next.js server. |
| `npm run lint` | Runs Next.js linting. |

## Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs. The server exits when missing. |
| `PORT` | No | API port. Defaults to `4000`. |
| `NODE_ENV` | No | Runtime environment. |
| `FRONTEND_URL` | No | Single allowed frontend origin. |
| `FRONTEND_URLS` | No | Comma-separated allowed frontend origins. |
| `CORS_ORIGINS` | No | Backward-compatible comma-separated CORS allowlist. |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Recommended | Base URL for API requests, for example `http://localhost:4000`. |

Never commit real secrets or `.env` files.

## Repository Architecture

```text
.
├─ backend/
│  ├─ index.js
│  ├─ package.json
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ seed.js
│  └─ src/
│     ├─ controllers/
│     ├─ lib/
│     ├─ middlewares/
│     ├─ routes/
│     └─ utils/
├─ frontend/
│  ├─ components/
│  ├─ lib/
│  ├─ pages/
│  ├─ public/
│  └─ styles/
├─ docs/
│  ├─ API.md
│  ├─ ARCHITECTURE.md
│  ├─ BACKEND.md
│  ├─ DATABASE.md
│  ├─ DECISIONS.md
│  ├─ DEPLOYMENT.md
│  ├─ FRONTEND.md
│  └─ ROADMAP.md
└─ docker-compose.yml
```

## Roadmap

### Completed

- Login and registration.
- JWT authentication.
- Club marketplace and exploration.
- Club detail pages.
- Availability lookup.
- Booking creation and cancellation.
- Owner dashboard for seeded or preexisting owner/admin accounts.
- Club, field, and availability management.
- Responsive sports-oriented UI.

### In Progress

- Reviews as a product surface. The frontend currently contains deterministic presentation data prepared for future backend integration.
- Visual polish for marketplace and owner workflows.

### Future

- Real reviews and ratings.
- Favorites.
- Payments.
- Notifications.
- Club image gallery.
- Map/geolocation support.
- AI-assisted discovery and operations.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for a detailed roadmap.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DATABASE.md`](docs/DATABASE.md)
- [`docs/API.md`](docs/API.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- [`docs/FRONTEND.md`](docs/FRONTEND.md)
- [`docs/BACKEND.md`](docs/BACKEND.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)
- [`docs/DECISIONS.md`](docs/DECISIONS.md)

## Contributing

This is currently a personal portfolio project, but contributions can be reviewed using a standard open-source workflow:

1. Open an issue or describe the proposed change.
2. Keep changes scoped and aligned with the existing architecture.
3. Run the relevant validation commands before submitting changes.
4. Avoid committing secrets, generated build output, or unrelated refactors.

Recommended checks:

```bash
cd frontend
npm run lint
npm run build
```

```bash
cd backend
npm test
npx prisma validate
```

## License

ISC. See `backend/package.json` for the current package license declaration.

## Author

**Matías Senia**<br>
Backend & AI Integration Engineer
