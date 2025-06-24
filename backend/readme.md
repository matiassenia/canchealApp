// ... CONTENIDO ANTERIOR ...

---

## 📘 README - Backend CanchealApp

### 📦 Requisitos previos
- Node.js 18 o superior
- Docker + Docker Compose
- Yarn o npm

---

### 🧱 Instalación del proyecto
1. Cloná este repositorio:
```bash
git clone https://github.com/tuusuario/canchealApp.git
cd canchealApp/backend
```

2. Instalá las dependencias:
```bash
npm install
```

3. Creá el archivo `.env` con este contenido:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/canchas_app"
JWT_SECRET=supersecretoseguro
```

4. Levantá la base de datos con Docker:
```bash
docker-compose up -d
```

5. Empujá el esquema Prisma y ejecutá el seed:
```bash
npx prisma db push --force-reset
node prisma/seed.js
```

6. Iniciá el servidor:
```bash
node index.js
```

---

### 📮 Endpoints disponibles

#### 🔐 Auth
- `POST /auth/register`
- `POST /auth/login`

#### 👤 Usuarios
- `GET /users/me` *(próximo)*

#### 🏢 Clubes
- `GET /clubs`
- `POST /clubs` *(requiere token)*

#### 🏟️ Canchas
- `GET /fields/club/:id`
- `POST /fields` *(requiere token)*

#### 🕓 Disponibilidad
- `GET /availability/:id`
- `POST /availability` *(requiere token)*

#### 📆 Reservas
- `POST /bookings`
- `GET /bookings/user`
- `PATCH /bookings/:id/status`

---

### 🧪 Datos de prueba del seed

**Usuario común:**
```json
{
  "email": "juan@example.com",
  "password": "123456"
}
```

**Dueño de club:**
```json
{
  "email": "club@example.com",
  "password": "123456"
}
```

---


