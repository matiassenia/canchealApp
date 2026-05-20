// 🕓 Controlador de Disponibilidad (`availabilityController.js`)
const { PrismaClient } = require('@prisma/client');
const { sendError } = require('../utils/errorResponse');
const prisma = new PrismaClient();

function parseDate(value) {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return null;
  return d;
}

async function getAvailability(req, res) {
  const fieldId = Number(req.params.id);
  if (!fieldId) {
    return res.status(400).json({ error: 'fieldId inválido.' });
  }
  try {
    const availability = await prisma.availability.findMany({
      where: { fieldId }
    });
    res.json(availability);
  } catch (err) {
    console.error('Error en getAvailability:', err);
    sendError(res, err, { status: 500, message: 'No se pudo obtener la disponibilidad.' });
  }
}

async function setAvailability(req, res) {
  const { fieldId, slots } = req.body;
  const userId = req.user && req.user.id;
  const role = req.user && req.user.role;
  const numericFieldId = Number(fieldId);

  if (!userId) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }

  if (!numericFieldId || !Array.isArray(slots)) {
    return res.status(400).json({ error: 'Datos incompletos.' });
  }

  try {
    const field = await prisma.field.findUnique({
      where: { id: numericFieldId },
      select: { id: true, club: { select: { ownerId: true } } }
    });

    if (!field) {
      return res.status(404).json({ error: 'Cancha no encontrada.' });
    }

    const isOwner = field.club && field.club.ownerId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para modificar esta disponibilidad.' });
    }

    await prisma.availability.deleteMany({ where: { fieldId: numericFieldId } });

    await prisma.availability.createMany({
      data: slots.map(({ weekday, startTime, endTime }) => ({
        fieldId: numericFieldId,
        weekday,
        startTime,
        endTime
      }))
    });

    res.status(201).json({ message: 'Disponibilidad guardada correctamente' });
  } catch (err) {
    console.error('Error en setAvailability:', err);
    sendError(res, err, { status: 500, message: 'No se pudo guardar la disponibilidad.' });
  }
}

async function getAvailableSlots(req, res) {
  const fieldId = Number(req.params.id);
  const { date, slotMinutes } = req.query;

  if (!fieldId) return res.status(400).json({ error: 'fieldId inválido.' });
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Falta query param date (YYYY-MM-DD).' });
  }

  const minutes = slotMinutes ? Number(slotMinutes) : 60;
  if (!minutes || minutes <= 0 || minutes > 240) {
    return res.status(400).json({ error: 'slotMinutes inválido.' });
  }

  // Día local Argentina (-03:00)
  const dayStart = parseDate(`${date}T00:00:00-03:00`);
  const dayEnd = parseDate(`${date}T23:59:59-03:00`);
  if (!dayStart || !dayEnd) {
    return res.status(400).json({ error: 'date inválida (formato esperado YYYY-MM-DD).' });
  }

  const weekday = dayStart.getDay();

  try {
    const rules = await prisma.availability.findMany({
      where: { fieldId, weekday }
    });

    if (!rules.length) {
      return res.json({ fieldId, date, slotMinutes: minutes, slots: [] });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        fieldId,
        status: { not: 'CANCELLED' },
        startAt: { lt: dayEnd },
        endAt: { gt: dayStart }
      },
      select: { startAt: true, endAt: true }
    });

    const slots = [];

    for (const rule of rules) {
      const rangeStart = parseDate(`${date}T${rule.startTime}:00-03:00`);
      const rangeEnd = parseDate(`${date}T${rule.endTime}:00-03:00`);
      if (!rangeStart || !rangeEnd || rangeStart >= rangeEnd) continue;

      for (
        let t = new Date(rangeStart);
        t.getTime() + minutes * 60000 <= rangeEnd.getTime();
        t = new Date(t.getTime() + minutes * 60000)
      ) {
        const slotStart = new Date(t);
        const slotEnd = new Date(t.getTime() + minutes * 60000);

        const overlaps = bookings.some((b) => b.startAt < slotEnd && b.endAt > slotStart);
        if (!overlaps) {
          slots.push({ startAt: slotStart.toISOString(), endAt: slotEnd.toISOString() });
        }
      }
    }

    res.json({ fieldId, date, slotMinutes: minutes, slots });
  } catch (err) {
    console.error('Error en getAvailableSlots:', err);
    sendError(res, err, { status: 500, message: 'No se pudieron obtener los slots disponibles.' });
  }
}

module.exports = {
  getAvailability,
  setAvailability,
  getAvailableSlots
};
