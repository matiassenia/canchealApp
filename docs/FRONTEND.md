# Frontend

The frontend is a Next.js 15 application using the Pages Router, React, JavaScript, and TailwindCSS. It focuses on product clarity, responsive layouts, and direct API integration without introducing a heavy client-side state framework.

## Pages Router

Routes are file-based under `frontend/pages`.

Key pages:

- `/`: landing page.
- `/login`: authentication form.
- `/register`: account creation form.
- `/clubs`: paginated club list.
- `/clubs/[id]`: club detail and field booking entry point.
- `/explore`: marketplace-style discovery with client-side filters.
- `/availability`: field/date/slot booking flow.
- `/my-bookings`: user reservation history and cancellation.
- `/owner/dashboard`: owner operational dashboard for accounts whose JWT role allows owner workflows.
- `/owner/create-club`: standalone club creation page.
- `/owner/[id]/fields`: standalone field creation page.
- `/owner/club/[id]`: club operations page with field and availability management.

## API Client

`frontend/lib/api.js` centralizes API requests.

Responsibilities:

- Read `NEXT_PUBLIC_API_URL`.
- Add `Authorization: Bearer <token>` when a token exists in `localStorage`.
- Normalize base URL and request path.

Trade-off:

- This keeps API access small and understandable.
- It does not provide automatic retries, request cancellation, caching, or refresh tokens.

## Authentication UX

Authenticated pages are protected with `withAuth`. The token is stored in `localStorage` and attached to API requests by the shared API client.

Current limitation:

- Token storage is simple and practical for this project stage, but a production-grade auth system could move toward httpOnly cookies, refresh tokens, and stronger session lifecycle controls.

## Design System

Visual primitives live mainly in:

- `frontend/lib/ui.js`
- `frontend/components/ui-kit.js`

The design language uses:

- Dark green and lime accents.
- Soft gradients.
- Subtle sports-field texture.
- Translucent glass-like surfaces.
- Premium cards and responsive grids.
- Accessible form labels and focus states.

Temporary club experience data lives in `frontend/lib/club-experience.js`, not inside the UI kit. That module provides deterministic presentation data for ratings, reviews, rankings, and badges until the backend exposes real fields.

## Component Responsibilities

- `Navbar`: primary navigation.
- `ClubDiscoveryCard`: marketplace club card for explore flows.
- `FieldAvailabilitySelector`: weekly availability editing UI for owners.
- `ui-kit.js`: reusable visual components such as cards, surfaces, rating display, state blocks, status badges, and pagination.

## Responsive Strategy

The application uses Tailwind breakpoints directly in page and component markup. Layouts generally start as single-column mobile views and expand to two or three columns on larger screens.

## Marketplace

The marketplace experience includes:

- Club discovery cards.
- Search by club name.
- Zone filter.
- Field type filter.
- Visual ranking categories.

Ranking labels are currently visual categories only. They are not interactive filters unless supported by actual filtering logic.

## Booking UI

The booking page accepts contextual query parameters:

- `clubId`
- `fieldId`

It then loads fields, selects a date, requests available slots, and posts a booking to the backend.

## Frontend Validation

```bash
cd frontend
npm run lint
npm run build
```

## Known Limitations

- No global data cache.
- No server-side rendering data loaders for API-backed pages.
- Reviews, ratings, rankings, and badges are presentation data unless supplied by future backend fields.
- No payment or notification UI is connected yet.
