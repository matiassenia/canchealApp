# Roadmap

This roadmap reflects the current product direction without claiming features that are not implemented yet.

## Completed

- User registration.
- User login.
- JWT authentication.
- Protected authenticated routes.
- Club listing.
- Club detail pages.
- Marketplace exploration.
- Field listing by club.
- Availability lookup.
- Booking creation.
- Booking overlap protection.
- Booking history.
- Booking cancellation.
- Owner dashboard.
- Club creation.
- Field creation.
- Weekly availability management.
- Responsive UI.
- Sports-oriented visual system.
- Vercel frontend deployment.
- Render backend deployment.

## Short Term

- Capture and add production screenshots to `docs/images`.
- Add endpoint-level backend tests for authentication, clubs, fields, availability, and bookings.
- Improve seed documentation and local demo setup.
- Add owner-facing booking list once the backend exposes owner reservation endpoints.
- Replace temporary frontend ratings/reviews with API-provided fields when backend support exists.

## Medium Term

- Reviews and ratings persisted in the database.
- Favorites for users.
- Club image gallery.
- Map/geolocation support for clubs.
- Better marketplace sorting and ranking.
- Owner analytics based only on real booking data.
- Notification events for booking changes.

## Long Term

- Payments and refunds.
- Subscription or SaaS-style owner plans.
- AI-assisted club discovery.
- AI-assisted owner operations, such as suggested availability and demand insights.
- Advanced search with ranking and personalization.
- Multi-tenant operational tooling for admins.

## Explicit Non-Goals For The Current Stage

- No frontend framework migration.
- No TypeScript migration.
- No monorepo/workspace conversion.
- No new component library.
- No new animation library.
- No backend rewrite.

## Product Risks

- Payments introduce compliance, reconciliation, refund, and provider reliability concerns.
- Reviews require moderation and abuse-prevention strategy.
- Owner analytics should not be shown with fake numbers; they should be derived from persisted bookings and payments.
- Image uploads require storage, optimization, and security controls.
