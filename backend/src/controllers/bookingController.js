// 📆 Controlador de Reservas (`bookingController.js`)
//js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createBooking = async (req, res) => {
  const { fieldId, date, timeSlot } = req.body;
  const userId = req.user.id;

  try {
    const booking = await prisma.booking.create({
      data: {
        userId,
        fieldId,
        date: new Date(date),
        timeSlot,
        status: 'PENDING'
      }
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  const userId = req.user.id;
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        field: {
          include: { club: true }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { status } = req.body;
  try {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
