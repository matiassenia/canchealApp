# CanchealApp Backend

Express API for CanchealApp, using Prisma and PostgreSQL.

## Responsibilities

- User registration and login.
- JWT creation and verification.
- Club, field, availability, and booking APIs.
- Owner/admin authorization for operational actions.
- Booking conflict detection.
- Health checks for deployment monitoring.

## Requirements

- Node.js 18 or newer.
- npm.
- Docker and Docker Compose for local PostgreSQL.
- A configured `backend/.env` file.

## Environment

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

Do not commit real secrets or `.env` files.

## Local Development

Start PostgreSQL from the repository root:

```bash
docker compose up -d
```

Run the backend from `backend/`:

```bash
npm install
npx prisma migrate dev
npm run dev
```

The API defaults to `http://localhost:4000`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts `node index.js`. |
| `npm start` | Starts `node index.js`. |
| `npm run db:up` | Starts the root Docker Compose database. |
| `npm run db:down` | Stops the root Docker Compose database. |
| `npm run prisma:generate` | Runs `prisma generate`. |
| `npm run prisma:migrate` | Runs `prisma migrate dev`. |
| `npm run seed` | Runs `node prisma/seed.js`. |
| `npm test` | Runs `node --check index.js`. |

## Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Clubs

- `GET /clubs`
- `GET /clubs/mine` authenticated
- `GET /clubs/:id`
- `POST /clubs` authenticated, `OWNER` or `ADMIN`

### Fields

- `GET /fields`
- `GET /fields/club/:id`
- `POST /fields` authenticated, club owner only

### Availability

- `GET /availability/:id`
- `GET /availability/:id/slots?date=YYYY-MM-DD&slotMinutes=60`
- `POST /availability` authenticated, club owner or `ADMIN`

### Bookings

- `POST /bookings` authenticated
- `GET /bookings/user` authenticated
- `DELETE /bookings/:id` authenticated
- `PATCH /bookings/:id/status` authenticated

### Health

- `GET /health`

## Seed Data

Run from `backend/`:

```bash
npm run seed
```

Demo accounts created by the seed:

| Role | Email | Password |
| --- | --- | --- |
| USER | `demo.user@cancheal.test` | `demo1234` |
| OWNER | `demo.owner@cancheal.test` | `demo1234` |
| ADMIN | `demo.admin@cancheal.test` | `demo1234` |

The seed creates six clubs, multiple fields per club, weekly availability rules, and sample bookings.

## Validation

```bash
npm test
npx prisma validate
```

## More Documentation

- Root project overview: `../README.md`
- Full API reference: `../docs/API.md`
- Database model: `../docs/DATABASE.md`
- Backend architecture: `../docs/BACKEND.md`
