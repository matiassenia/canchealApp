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
  try {
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
    res.status(400).json({ error: err.message });
  }
};


