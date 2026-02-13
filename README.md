# ⚽ Cancheal App

Sistema completo de gestión de reservas de canchas de fútbol.

Backend con arquitectura limpia, autenticación JWT, motor de disponibilidad dinámico y protección contra reservas solapadas.

---

## 🚀 Tech Stack

### Backend
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT Authentication

### Frontend
- Next.js

---

## 📌 Arquitectura General

```
Frontend (Next.js)
        ↓
Express API
        ↓
Prisma ORM
        ↓
PostgreSQL
```

La API está organizada en:
- Controllers
- Routes
- Middlewares
- Prisma schema

---

## 🔐 Autenticación

Sistema basado en JWT.

### Endpoints

```
POST /auth/register
POST /auth/login
```

### Seguridad implementada

- Rutas protegidas con `authMiddleware`
- Validación de header `Authorization: Bearer <token>`
- Tokens con expiración
- Roles: USER / OWNER / ADMIN

---

## 🏢 Clubs y Canchas

### Clubs
```
GET  /clubs
POST /clubs (protected)
```

Un club:
- Tiene owner
- Tiene múltiples fields

### Fields
```
GET  /fields/club/:id
POST /fields (protected)
```

Una cancha:
- Pertenece a un club
- Tiene disponibilidad semanal
- Tiene reservas asociadas

---

## 📆 Sistema de Reservas (Booking por Rangos)

El modelo Booking utiliza rangos reales de tiempo:

```prisma
model Booking {
  id      Int      @id @default(autoincrement())
  userId  Int
  fieldId Int
  startAt DateTime
  endAt   DateTime
  status  BookingStatus @default(PENDING)
}
```

### Estados
- PENDING
- CONFIRMED
- CANCELLED

---

## 🧠 Protección contra solapamientos

Una reserva entra en conflicto si:

```
existing.startAt < new.endAt
AND
existing.endAt > new.startAt
```

Si hay conflicto:
```
HTTP 409 Conflict
```

Esto evita:
- Reservas duplicadas
- Solapamientos parciales
- Edge cases de inicio/fin iguales

---

## 🕓 Motor de Disponibilidad

### Disponibilidad semanal

Modelo:

```prisma
model Availability {
  id        Int
  fieldId   Int
  weekday   Int     // 0=Domingo ... 6=Sábado
  startTime String
  endTime   String
}
```

### Generación dinámica de slots

Endpoint:

```
GET /availability/:fieldId/slots?date=YYYY-MM-DD&slotMinutes=60
```

El sistema:

1. Obtiene reglas semanales para ese weekday
2. Genera slots de duración configurable
3. Resta reservas existentes
4. Devuelve solo slots disponibles

---

## 📡 API Endpoints

### Auth
```
POST /auth/register
POST /auth/login
```

### Clubs
```
GET  /clubs
POST /clubs (protected)
```

### Fields
```
GET  /fields/club/:id
POST /fields (protected)
```

### Availability
```
GET  /availability/:fieldId
POST /availability (protected)
GET  /availability/:fieldId/slots?date=YYYY-MM-DD&slotMinutes=60
```

### Bookings
```
POST  /bookings (protected)
GET   /bookings/user (protected)
PATCH /bookings/:id/status (protected)
```

---

## 🛠 Instalación y ejecución local

### 1️⃣ Levantar base de datos

```
docker compose up -d
```

---

### 2️⃣ Backend

```
cd backend
npm install
npx prisma migrate dev
node index.js
```

Servidor corre por defecto en:

```
http://localhost:4000
```

---

### 3️⃣ Frontend

```
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing Manual con cURL

### Crear reserva

```
curl -X POST http://localhost:4000/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"fieldId":1,"startAt":"2026-02-13T19:00:00-03:00","endAt":"2026-02-13T20:00:00-03:00"}'
```

### Obtener slots disponibles

```
curl "http://localhost:4000/availability/1/slots?date=2026-02-13&slotMinutes=60"
```

---

## ⚙️ Consideraciones Técnicas

- Base de datos guarda fechas en UTC
- Conversión manual a zona horaria Argentina (-03:00)
- Slot generator configurable por duración
- Middleware centralizado para protección
- Prisma migrations sincronizadas

---

## 🛡 Seguridad

- JWT obligatorio para crear reservas
- Validación estricta de headers
- Overlap validation evita doble booking
- Manejo de errores estandarizado

---

## 📈 Próximos pasos

- Mejorar manejo de timezones con Luxon
- Agregar índices en Booking para performance
- Panel de gestión para OWNER
- Dashboard de reservas
- Integración con pagos
- Tests automatizados
- Rate limiting

---

## 📌 Estado actual del proyecto

✔ Autenticación funcional  
✔ Sistema de roles  
✔ Creación de clubes y canchas  
✔ Reservas por rango horario  
✔ Protección contra solapamientos  
✔ Generación dinámica de slots  
✔ Middleware seguro  
✔ Prisma migrado correctamente  

---

## 🎯 Objetivo del Proyecto

Construir una base sólida para una app real de reservas de canchas, escalable y lista para evolucionar hacia producción.
