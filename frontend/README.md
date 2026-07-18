# CanchealApp Frontend

Next.js 15 frontend for CanchealApp, built with the Pages Router, React, JavaScript, and TailwindCSS.

## Responsibilities

- Render the public landing page.
- Handle login and registration screens.
- Protect authenticated pages with `withAuth`.
- Provide club discovery, club detail, availability, booking, and booking history flows.
- Provide owner-facing club, field, and availability management screens.
- Call the backend through `frontend/lib/api.js`.

## Key Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page. |
| `/login` | User login. |
| `/register` | User registration. |
| `/clubs` | Paginated club listing. |
| `/clubs/[id]` | Club profile and booking entry point. |
| `/explore` | Marketplace-style discovery. |
| `/availability` | Field/date/slot booking flow. |
| `/my-bookings` | User booking history and cancellation. |
| `/owner/dashboard` | Owner operations dashboard. |
| `/owner/create-club` | Standalone club creation page. |
| `/owner/[id]/fields` | Standalone field creation page. |
| `/owner/club/[id]` | Club field and availability management. |

## Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

If `NEXT_PUBLIC_API_URL` is not set, API requests fall back to same-origin paths.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Local Development

Run from `frontend/`:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The backend should be running separately on `http://localhost:4000` for full-stack flows.

## Validation

```bash
npm run lint
npm run build
```

## Notes

- The app uses `pages/`, not the App Router.
- The project is JavaScript-first. TypeScript packages may exist from Next.js tooling, but application code is currently JavaScript.
- Temporary club ratings/reviews/rankings live in `frontend/lib/club-experience.js` until the backend exposes real data.
