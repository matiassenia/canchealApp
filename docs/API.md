# API Reference

Base URL examples:

- Local: `http://localhost:4000`
- Production: `https://canchealapp.onrender.com`

Protected endpoints require:

```http
Authorization: Bearer <jwt>
```

## Health

### GET `/health`

Checks API and database connectivity.

Response:

```json
{ "ok": true, "db": "up" }
```

Errors:

- `500`: database check failed.

## Auth

### POST `/auth/register`

Creates a user account. The current implementation assigns the default Prisma role unless the schema default changes.

Body:

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "demo1234"
}
```

Response `201`:

```json
{
  "id": 1,
  "name": "Demo User",
  "email": "demo@example.com",
  "role": "USER"
}
```

Errors:

- `400`: missing fields or registration failure.

### POST `/auth/login`

Authenticates a user and returns a JWT.

Body:

```json
{
  "email": "demo@example.com",
  "password": "demo1234"
}
```

Response `200`:

```json
{ "token": "<jwt>" }
```

Errors:

- `400`: missing `email` or `password`.
- `401`: invalid credentials.
- `500`: invalid server configuration or unexpected login failure.

## Clubs

### GET `/clubs`

Returns clubs. Without query parameters, returns an array. With pagination/search parameters, returns a paginated object.

Query parameters:

- `page`: positive integer.
- `limit`: positive integer, capped at `50`.
- `zone`: case-insensitive exact zone match.
- `search`: case-insensitive search over `name`, `address`, and `zone`.

Response without pagination:

```json
[
  {
    "id": 1,
    "name": "Club Norte",
    "address": "Av. Example 123",
    "zone": "Palermo",
    "description": "Club description",
    "ownerId": 2,
    "owner": { "id": 2, "name": "Owner" },
    "fields": [{ "id": 1, "name": "Cancha 1", "type": "5", "imageUrl": null, "clubId": 1 }]
  }
]
```

Response with pagination:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 0,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

Errors:

- `500`: club list could not be loaded.

### GET `/clubs/mine`

Returns clubs owned by the authenticated user.

Auth: required.

Response `200`:

```json
[
  {
    "id": 1,
    "name": "Owner Club",
    "address": "Address",
    "zone": "Zone",
    "description": "Description",
    "ownerId": 2,
    "owner": { "id": 2, "name": "Owner" },
    "fields": []
  }
]
```

Errors:

- `401`: missing or invalid token.
- `500`: owned clubs could not be loaded.

### GET `/clubs/:id`

Returns one club by ID.

Response `200`:

```json
{
  "id": 1,
  "name": "Club Norte",
  "address": "Av. Example 123",
  "zone": "Palermo",
  "description": "Club description",
  "ownerId": 2,
  "owner": { "id": 2, "name": "Owner" },
  "fields": []
}
```

Errors:

- `400`: invalid club ID.
- `404`: club not found.
- `500`: club could not be loaded.

### POST `/clubs`

Creates a club for the authenticated owner/admin.

Auth: required. Role must be `OWNER` or `ADMIN`.

Body:

```json
{
  "name": "Club Norte",
  "address": "Av. Example 123",
  "zone": "Palermo",
  "description": "Club description"
}
```

Response `201`: created club.

Errors:

- `400`: missing required fields.
- `401`: missing or invalid token.
- `403`: user is not owner/admin.

## Fields

### GET `/fields`

Returns all fields, including availability rules.

Response `200`:

```json
[
  {
    "id": 1,
    "name": "Cancha 1",
    "type": "5",
    "imageUrl": null,
    "clubId": 1,
    "availability": []
  }
]
```

Errors:

- `500`: fields could not be loaded.

### GET `/fields/club/:id`

Returns fields for a club, including availability rules.

Errors:

- `400`: invalid club ID.
- `500`: fields could not be loaded.

### POST `/fields`

Creates a field for a club owned by the authenticated user.

Auth: required.

Body:

```json
{
  "name": "Cancha 1",
  "type": "5",
  "imageUrl": null,
  "clubId": 1
}
```

Response `201`: created field.

Errors:

- `400`: missing required fields.
- `401`: missing or invalid token.
- `403`: authenticated user does not own the club.

## Availability

### GET `/availability/:id`

Returns weekly availability rules for a field.

Response `200`:

```json
[
  {
    "id": 1,
    "fieldId": 1,
    "weekday": 1,
    "startTime": "18:00",
    "endTime": "23:00"
  }
]
```

Errors:

- `400`: invalid field ID.
- `500`: availability could not be loaded.

### GET `/availability/:id/slots`

Generates available booking slots for one field and date.

Query parameters:

- `date`: required, `YYYY-MM-DD`.
- `slotMinutes`: optional, defaults to `60`, max `240`.

Response `200`:

```json
{
  "fieldId": 1,
  "date": "2026-07-18",
  "slotMinutes": 60,
  "slots": [
    {
      "startAt": "2026-07-18T21:00:00.000Z",
      "endAt": "2026-07-18T22:00:00.000Z"
    }
  ]
}
```

Errors:

- `400`: invalid field ID, missing date, invalid date, or invalid slot length.
- `500`: slots could not be generated.

### POST `/availability`

Replaces all weekly availability rules for a field.

Auth: required. User must own the field's club or be `ADMIN`.

Body:

```json
{
  "fieldId": 1,
  "slots": [
    { "weekday": 1, "startTime": "18:00", "endTime": "23:00" }
  ]
}
```

Response `201`:

```json
{ "message": "Disponibilidad guardada correctamente" }
```

Errors:

- `400`: incomplete data or invalid availability slots.
- `401`: missing or invalid token.
- `403`: user cannot modify this field.
- `404`: field not found.

## Bookings

### POST `/bookings`

Creates a booking for the authenticated user.

Auth: required.

Body:

```json
{
  "fieldId": 1,
  "startAt": "2026-07-18T21:00:00.000Z",
  "endAt": "2026-07-18T22:00:00.000Z"
}
```

Response `201`: created booking with `PENDING` status.

Errors:

- `400`: invalid field ID, invalid ISO timestamps, invalid time range, or duration under 60 minutes.
- `401`: missing or invalid token.
- `404`: field not found.
- `409`: overlapping booking or serializable transaction conflict.

### GET `/bookings/user`

Returns bookings for the authenticated user, including field and club data.

Auth: required.

Response `200`:

```json
[
  {
    "id": 1,
    "userId": 1,
    "fieldId": 1,
    "startAt": "2026-07-18T21:00:00.000Z",
    "endAt": "2026-07-18T22:00:00.000Z",
    "status": "PENDING",
    "field": { "club": {} }
  }
]
```

Errors:

- `401`: missing or invalid token.
- `500`: bookings could not be loaded.

### DELETE `/bookings/:id`

Soft-cancels a booking by setting status to `CANCELLED`.

Auth: required. User must own the booking or be `ADMIN`.

Response `200`: updated booking.

Errors:

- `400`: invalid booking ID.
- `401`: missing or invalid token.
- `403`: user cannot cancel this booking.
- `404`: booking not found.

### PATCH `/bookings/:id/status`

Updates booking status with transition validation.

Auth: required. Booking owner can only cancel; club owner or admin can perform allowed operational transitions.

Body:

```json
{ "status": "CONFIRMED" }
```

Allowed transitions:

- `PENDING` -> `CONFIRMED`
- `PENDING` -> `CANCELLED`
- `CONFIRMED` -> `CANCELLED`

Errors:

- `400`: invalid data, invalid status, or invalid transition.
- `401`: missing or invalid token.
- `403`: insufficient permissions.
- `404`: booking not found.
