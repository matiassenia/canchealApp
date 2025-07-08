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
  const { fieldId, slots } = req.body;

  if (!fieldId || !Array.isArray(slots)) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    // Borra disponibilidad anterior de esa cancha
    await prisma.availability.deleteMany({ where: { fieldId } });

    // Inserta todos los nuevos slots
    await prisma.availability.createMany({
      data: slots.map(({ weekday, startTime, endTime }) => ({
        fieldId,
        weekday,
        startTime,
        endTime
      }))
    });

    res.status(201).json({ message: 'Disponibilidad guardada correctamente' });
  } catch (err) {
    console.error('Error en setAvailability:', err);
    res.status(500).json({ error: err.message });
  }
};
