# Technical Decisions

This document captures the main architectural choices and their trade-offs.

## Why Next.js?

Next.js provides a mature React application framework with routing, build tooling, production optimizations, and first-class Vercel deployment support. For CanchealApp, it keeps the frontend deployable without custom infrastructure.

Trade-offs:

- Next.js introduces framework conventions that must be followed consistently.
- The project currently uses client-side data fetching for API-backed flows rather than server-side data loading.

## Why Pages Router?

The Pages Router is stable, simple, and sufficient for the current app. The routing model is easy to understand for contributors and recruiters reviewing the project.

Trade-offs:

- It does not use App Router features such as server components or nested layouts.
- Migrating later would be possible but should only happen for a clear product or engineering benefit.

## Why React?

React is the natural UI layer for Next.js and provides a strong ecosystem for building interactive flows such as availability selection and owner dashboards.

Trade-offs:

- State management can become scattered if flows grow without clear boundaries.
- The current project intentionally avoids adding a global state library until there is a real need.

## Why TailwindCSS?

Tailwind allows fast iteration while keeping styling close to the components and pages that use it. It fits the current design-system approach, where shared tokens live in `frontend/lib/ui.js` and reusable primitives live in `ui-kit.js`.

Trade-offs:

- Long class strings can reduce readability if not managed carefully.
- Strong design consistency requires shared tokens and components, not only utility classes.

## Why Express?

Express keeps the backend explicit and easy to inspect. Routes, middleware, and controllers are familiar to most Node.js developers and are appropriate for this API size.

Trade-offs:

- Express does not enforce structure by itself.
- Validation, error handling, and authorization conventions must be maintained by the team.

## Why Prisma?

Prisma provides a typed schema, migrations, and a productive data access API. It makes the database model easy to review and evolve.

Trade-offs:

- Prisma abstracts SQL, which can hide query complexity if the data model grows.
- Production migration discipline is required.

## Why PostgreSQL?

PostgreSQL is reliable, mature, relational, and a strong fit for reservations, ownership, availability, and future payments/reviews.

Trade-offs:

- Operational responsibility increases compared to a purely managed document database.
- Some marketplace search features may eventually require specialized indexing or search infrastructure.

## Why Vercel?

Vercel provides the fastest path to reliable deployment for a Next.js frontend.

Trade-offs:

- Environment variables and preview URL behavior must be coordinated with backend CORS.

## Why Render?

Render provides straightforward Node.js backend hosting and integrates well with managed PostgreSQL services.

Trade-offs:

- Free or low-cost tiers may have cold starts or resource constraints.
- Backend/database availability depends on Render plan and configuration.

## Why Separate Frontend and Backend Projects?

The repository has two independent Node projects rather than a workspace. This keeps deployment roots simple and mirrors the production topology.

Trade-offs:

- Commands must be run per folder.
- Shared tooling is not centralized.

## Why Deterministic Presentation Data For Ratings?

The frontend currently includes deterministic temporary metadata for ratings, review previews, rankings, and amenities to support visual/product iteration before backend review models exist.

Trade-offs:

- It improves product presentation during design work.
- It must remain clearly separated from reusable visual components and be replaced by backend-provided data later.

## Current Architectural Boundaries

- Frontend: presentation, routing, UX orchestration, and API calls.
- Backend: authentication, authorization, validation, business rules, and persistence.
- Database: durable source of truth.

These boundaries should remain stable unless a future feature creates a concrete need to change them.
