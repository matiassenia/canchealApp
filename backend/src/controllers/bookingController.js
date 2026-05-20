// 📆 Controlador de Reservas (`bookingController.js`)
const { PrismaClient, BookingStatus } = require('@prisma/client');
const { sendError } = require('../utils/errorResponse');
const prisma = new PrismaClient();

function parseDate(value) {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return null;
  return d;
}

exports.createBooking = async (req, res) => {
  const { fieldId, startAt, endAt } = req.body;
  const userId = req.user && req.user.id;

  if (!userId) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }

  const parsedStart = parseDate(startAt);
  const parsedEnd = parseDate(endAt);
  const numericFieldId = Number(fieldId);

  if (!numericFieldId || !parsedStart || !parsedEnd) {
    return res.status(400).json({ error: 'Faltan campos requeridos o fechas inválidas.' });
  }

  if (parsedStart >= parsedEnd) {
    return res.status(400).json({ error: 'El rango horario es inválido (startAt debe ser menor que endAt).' });
  }

  // (Opcional) Mínimo 60 minutos
  const minutes = (parsedEnd.getTime() - parsedStart.getTime()) / 60000;
  if (minutes < 60) {
    return res.status(400).json({ error: 'La reserva debe tener una duración mínima de 60 minutos.' });
  }

  try {
    // Overlap check (mismo field, no canceladas)
    const conflict = await prisma.booking.findFirst({
      where: {
        fieldId: numericFieldId,
        status: { not: BookingStatus.CANCELLED },
        startAt: { lt: parsedEnd },
        endAt: { gt: parsedStart }
      },
      select: { id: true, startAt: true, endAt: true, status: true }
    });

    if (conflict) {
      return res.status(409).json({
        error: 'Horario no disponible: se superpone con otra reserva.',
        conflict
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        fieldId: numericFieldId,
        startAt: parsedStart,
        endAt: parsedEnd,
        status: BookingStatus.PENDING
      }
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error('Error en createBooking:', err);
    sendError(res, err, { status: 400, message: 'No se pudo crear la reserva.' });
  }
};

exports.getUserBookings = async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        field: {
          include: { club: true }
        }
      },
      orderBy: { startAt: 'desc' }
    });

    res.json(bookings);
  } catch (err) {
    console.error('Error en getUserBookings:', err);
    sendError(res, err, { status: 500, message: 'No se pudieron obtener las reservas.' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const bookingId = Number(req.params.id);
  const { status } = req.body;

  if (!bookingId || !status) {
    return res.status(400).json({ error: 'Datos inválidos.' });
  }

  // Validar status contra enum
  const allowed = new Set(Object.values(BookingStatus));
  if (!allowed.has(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }

  try {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    });
    res.json(updated);
  } catch (err) {
    console.error('Error en updateBookingStatus:', err);
    sendError(res, err, { status: 400, message: 'No se pudo actualizar la reserva.' });
  }
};

exports.cancelBooking = async (req, res) => {
  const bookingId = Number(req.params.id);
  const userId = req.user && req.user.id;
  const role = req.user && req.user.role;

  if (!userId) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }

  if (!bookingId) {
    return res.status(400).json({ error: 'Datos inválidos.' });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    const isOwner = booking.userId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para cancelar esta reserva.' });
    }

    const cancelled = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED }
    });

    res.json(cancelled);
  } catch (err) {
    console.error('Error en cancelBooking:', err);
    sendError(res, err, { status: 400, message: 'No se pudo cancelar la reserva.' });
  }
};
