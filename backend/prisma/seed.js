
// 🌱 Script de Seed (`prisma/seed.js`)
//js
require('dotenv').config();
const { PrismaClient, BookingStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('demo1234', 10);

  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.field.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  const demoUser = await prisma.user.create({
    data: {
      name: 'Jugador Demo',
      email: 'demo.user@cancheal.test',
      password: hashedPassword,
      role: 'USER'
    }
  });

  const ownerUser = await prisma.user.create({
    data: {
      name: 'Owner Demo',
      email: 'demo.owner@cancheal.test',
      password: hashedPassword,
      role: 'OWNER'
    }
  });

  await prisma.user.create({
    data: {
      name: 'Admin Demo',
      email: 'demo.admin@cancheal.test',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  const clubSeeds = [
    {
      name: 'Complejo Norte FC',
      address: 'Av. del Libertador 1200',
      zone: 'San Miguel',
      description: 'Complejo con canchas de 5 y 7 para partidos nocturnos.',
      fields: [{ name: 'Norte 5A', type: '5' }, { name: 'Norte 7B', type: '7' }]
    },
    {
      name: 'Gol de Oro Canchas',
      address: 'Calle Belgrano 550',
      zone: 'Devoto',
      description: 'Predio familiar con buena iluminacion y vestuarios.',
      fields: [{ name: 'Gol 5', type: '5' }, { name: 'Gol 11', type: '11' }]
    },
    {
      name: 'La Diez Sports',
      address: 'Ruta 8 Km 28',
      zone: 'Tortuguitas',
      description: 'Cancha de 11 para torneos y canchas rapidas de 5.',
      fields: [{ name: 'Diez 11', type: '11' }, { name: 'Diez 5', type: '5' }]
    },
    {
      name: 'Pasion de Barrio',
      address: 'San Martin 1440',
      zone: 'Caseros',
      description: 'Canchas de cesped sintetico para partidos de semana.',
      fields: [{ name: 'Barrio 7', type: '7' }, { name: 'Barrio 5', type: '5' }]
    },
    {
      name: 'Arena Futbol Center',
      address: 'Av. Mitre 3021',
      zone: 'Avellaneda',
      description: 'Predio urbano ideal para after office y ligas amateurs.',
      fields: [{ name: 'Arena 7', type: '7' }, { name: 'Arena 11', type: '11' }]
    },
    {
      name: 'Distrito Canchero',
      address: 'Cochabamba 890',
      zone: 'Caballito',
      description: 'Complejo centrico para partidos rapidos y entrenamiento.',
      fields: [{ name: 'Distrito 5', type: '5' }, { name: 'Distrito 7', type: '7' }]
    }
  ];

  const createdFields = [];

  for (const clubSeed of clubSeeds) {
    const club = await prisma.club.create({
      data: {
        name: clubSeed.name,
        address: clubSeed.address,
        zone: clubSeed.zone,
        description: clubSeed.description,
        ownerId: ownerUser.id
      }
    });

    for (const fieldSeed of clubSeed.fields) {
      const field = await prisma.field.create({
        data: {
          name: fieldSeed.name,
          type: fieldSeed.type,
          imageUrl: null,
          clubId: club.id
        }
      });
      createdFields.push(field);
    }
  }

  const defaultAvailability = [
    { weekday: 1, startTime: '18:00', endTime: '23:00' },
    { weekday: 2, startTime: '18:00', endTime: '23:00' },
    { weekday: 3, startTime: '18:00', endTime: '23:00' },
    { weekday: 4, startTime: '18:00', endTime: '23:00' },
    { weekday: 5, startTime: '18:00', endTime: '23:30' },
    { weekday: 6, startTime: '10:00', endTime: '22:00' }
  ];

  for (const field of createdFields) {
    const variations = field.type === '11'
      ? defaultAvailability.map((slot) => ({ ...slot, startTime: slot.weekday >= 5 ? '09:00' : '19:00' }))
      : defaultAvailability;

    await prisma.availability.createMany({
      data: variations.map((slot) => ({
        fieldId: field.id,
        weekday: slot.weekday,
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    });
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const bookingStart1 = new Date(tomorrow);
  bookingStart1.setHours(19, 0, 0, 0);
  const bookingEnd1 = new Date(bookingStart1.getTime() + 60 * 60 * 1000);

  const bookingStart2 = new Date(inTwoDays);
  bookingStart2.setHours(20, 0, 0, 0);
  const bookingEnd2 = new Date(bookingStart2.getTime() + 60 * 60 * 1000);

  const bookingStart3 = new Date(inTwoDays);
  bookingStart3.setHours(21, 0, 0, 0);
  const bookingEnd3 = new Date(bookingStart3.getTime() + 60 * 60 * 1000);

  await prisma.booking.createMany({
    data: [
      {
        userId: demoUser.id,
        fieldId: createdFields[0].id,
        startAt: bookingStart1,
        endAt: bookingEnd1,
        status: BookingStatus.PENDING
      },
      {
        userId: demoUser.id,
        fieldId: createdFields[1].id,
        startAt: bookingStart2,
        endAt: bookingEnd2,
        status: BookingStatus.CONFIRMED
      },
      {
        userId: demoUser.id,
        fieldId: createdFields[2].id,
        startAt: bookingStart3,
        endAt: bookingEnd3,
        status: BookingStatus.CANCELLED
      }
    ]
  });

  console.log('Seed demo completado');
  console.log('USER  -> demo.user@cancheal.test / demo1234');
  console.log('OWNER -> demo.owner@cancheal.test / demo1234');
  console.log('ADMIN -> demo.admin@cancheal.test / demo1234');
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
