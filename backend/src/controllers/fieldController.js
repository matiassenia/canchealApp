// 🏟️ Controlador de Canchas (`fieldController.js`)
//js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getFieldsByClub = async (req, res) => {
  const clubId = parseInt(req.params.id);
  try {
    const fields = await prisma.field.findMany({
      where: { clubId },
      include: { availability: true }
    });
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createField = async (req, res) => {
  const { name, type, imageUrl, clubId } = req.body;
  const userId = req.user.id;

  if (!name || !type || !clubId) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
    });

    if (!club || club.ownerId !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para agregar canchas a este club' });
    }

    const field = await prisma.field.create({
      data: {
        name,
        type,
        imageUrl,
        clubId: parseInt(clubId)
      }
    });

    res.status(201).json(field);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
