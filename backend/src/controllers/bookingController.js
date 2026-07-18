// 📆 Controlador de Reservas (`bookingController.js`)
const { BookingStatus, Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');
const { sendError } = require('../utils/errorResponse');

const ISO_DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

function parsePositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function isIsoDateTime(value) {
  return typeof value === 'string' && ISO_DATE_TIME_REGEX.test(value);
}

function validateBookingStatus(status) {
  const allowed = new Set(Object.values(BookingStatus));
  return allowed.has(status);
}

function canTransitionBooking(currentStatus, nextStatus) {
  const allowedTransitions = {
    [BookingStatus.PENDING]: new Set([BookingStatus.CONFIRMED, BookingStatus.CANCELLED]),
    [BookingStatus.CONFIRMED]: new Set([BookingStatus.CANCELLED]),
    [BookingStatus.CANCELLED]: new Set([])
  };

  return allowedTransitions[currentStatus] && allowedTransitions[currentStatus].has(nextStatus);
}

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

  const numericFieldId = parsePositiveInt(fieldId);

  if (!numericFieldId) {
    return badRequest(res, 'fieldId inválido.');
  }

  if (!isIsoDateTime(startAt) || !isIsoDateTime(endAt)) {
    return badRequest(res, 'startAt y endAt deben tener formato ISO 8601 válido.');
  }

  const parsedStart = parseDate(startAt);
  const parsedEnd = parseDate(endAt);

  if (!parsedStart || !parsedEnd) {
    return badRequest(res, 'Fechas inválidas.');
  }

  if (parsedStart >= parsedEnd) {
    return badRequest(res, 'El rango horario es inválido (startAt debe ser menor que endAt).');
  }

  // (Opcional) Mínimo 60 minutos
  const minutes = (parsedEnd.getTime() - parsedStart.getTime()) / 60000;
  if (minutes < 60) {
    return badRequest(res, 'La reserva debe tener una duración mínima de 60 minutos.');
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const field = await tx.field.findUnique({
        where: { id: numericFieldId },
        select: { id: true }
      });

      if (!field) {
        const error = new Error('Cancha no encontrada.');
        error.statusCode = 404;
        throw error;
      }

      // Overlap check (mismo field, no canceladas) inside the transaction to reduce double-booking races.
      const conflict = await tx.booking.findFirst({
        where: {
          fieldId: numericFieldId,
          status: { not: BookingStatus.CANCELLED },
          startAt: { lt: parsedEnd },
          endAt: { gt: parsedStart }
        },
        select: { id: true, startAt: true, endAt: true, status: true }
      });

      if (conflict) {
        const error = new Error('Horario no disponible: se superpone con otra reserva.');
        error.statusCode = 409;
        error.conflict = conflict;
        throw error;
      }

      return tx.booking.create({
        data: {
          userId,
          fieldId: numericFieldId,
          startAt: parsedStart,
          endAt: parsedEnd,
          status: BookingStatus.PENDING
        }
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });

    res.status(201).json(booking);
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ error: err.message, conflict: err.conflict });
    }

    if (err.statusCode === 404) {
      return res.status(404).json({ error: err.message });
    }

    if (err.code === 'P2034') {
      return res.status(409).json({ error: 'Horario no disponible: intenta nuevamente.' });
    }

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
  const bookingId = parsePositiveInt(req.params.id);
  const { status } = req.body;
  const userId = req.user && req.user.id;
  const role = req.user && req.user.role;

  if (!bookingId || !status) {
    return badRequest(res, 'Datos inválidos.');
  }

  if (!validateBookingStatus(status)) {
    return badRequest(res, 'Status inválido.');
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { field: { select: { club: { select: { ownerId: true } } } } }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    if (!canTransitionBooking(booking.status, status)) {
      return res.status(400).json({ error: 'Transición de estado inválida.' });
    }

    const isBookingUser = booking.userId === userId;
    const isClubOwner = booking.field && booking.field.club && booking.field.club.ownerId === userId;
    const isAdmin = role === 'ADMIN';

    if (isBookingUser && status !== BookingStatus.CANCELLED && !isAdmin) {
      return res.status(403).json({ error: 'Los usuarios solo pueden cancelar sus reservas.' });
    }

    if (!isBookingUser && !isClubOwner && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar esta reserva.' });
    }

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
  const bookingId = parsePositiveInt(req.params.id);
  const userId = req.user && req.user.id;
  const role = req.user && req.user.role;

  if (!userId) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }

  if (!bookingId) {
    return badRequest(res, 'Datos inválidos.');
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
