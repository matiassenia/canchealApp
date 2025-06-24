// 🕓 Controlador de Disponibilidad (`availabilityController.js`)
//js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAvailability = async (req, res) => {
  const fieldId = parseInt(req.params.id);
  try {
    const availability = await prisma.availability.findMany({
      where: { fieldId }
    });
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setAvailability = async (req, res) => {
  const { fieldId, weekday, startTime, endTime } = req.body;
  try {
    const available = await prisma.availability.create({
      data: {
        fieldId,
        weekday,
        startTime,
        endTime
      }
    });
    res.status(201).json(available);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
