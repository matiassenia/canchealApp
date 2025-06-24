
// 🌱 Script de Seed (`prisma/seed.js`)
//js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Crear usuarios
  const user = await prisma.user.create({
    data: {
      name: 'Juan Futbolero',
      email: 'juan@example.com',
      password: hashedPassword,
      role: 'USER'
    }
  });

  const owner = await prisma.user.create({
    data: {
      name: 'Club San Miguel',
      email: 'club@example.com',
      password: hashedPassword,
      role: 'OWNER'
    }
  });

  // Crear club
  const club = await prisma.club.create({
    data: {
      name: 'Club San Miguel',
      address: 'Calle Fútbol 123',
      zone: 'San Miguel',
      description: 'Cancha de 5 y 7',
      ownerId: owner.id
    }
  });

  // Crear canchas
  const field1 = await prisma.field.create({
    data: {
      name: 'Cancha 5',
      type: '5',
      imageUrl: null,
      clubId: club.id
    }
  });

  const field2 = await prisma.field.create({
    data: {
      name: 'Cancha 7',
      type: '7',
      imageUrl: null,
      clubId: club.id
    }
  });

  // Crear disponibilidad
  await prisma.availability.createMany({
    data: [
      { fieldId: field1.id, weekday: 1, startTime: '18:00', endTime: '22:00' },
      { fieldId: field1.id, weekday: 3, startTime: '18:00', endTime: '22:00' },
      { fieldId: field2.id, weekday: 2, startTime: '19:00', endTime: '23:00' }
    ]
  });

  console.log('Seed ejecutado correctamente');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());


//📝 Ejecutar el seed
//Para ejecutar este script:

//1. Asegurate de tener configurado `.env` con tu `DATABASE_URL`
//2. Ejecutá:
//bash
//npx prisma db push --force-reset
//node prisma/seed.js
