// 🏟️ Controlador de Canchas (`fieldController.js`)
//js
const prisma = require('../lib/prisma');
const { sendError } = require('../utils/errorResponse');

exports.getFields = async (req, res) => {
  try {
    const fields = await prisma.field.findMany({
      include: { availability: true }
    });
    res.json(fields);
  } catch (err) {
    console.error('Error en getFields:', err);
    sendError(res, err, { status: 500, message: 'No se pudieron obtener las canchas.' });
  }
};

exports.getFieldsByClub = async (req, res) => {
  const clubId = parseInt(req.params.id);
  if (Number.isNaN(clubId)) {
    return res.status(400).json({ error: 'clubId inválido.' });
  }
  try {
    const fields = await prisma.field.findMany({
      where: { clubId },
      include: { availability: true }
    });
    res.json(fields);
  } catch (err) {
    console.error('Error en getFieldsByClub:', err);
    sendError(res, err, { status: 500, message: 'No se pudieron obtener las canchas.' });
  }
};

exports.createField = async (req, res) => {
  const { name, type, imageUrl, clubId } = req.body;
  const userId = req.user && req.user.id;

  if (!userId) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }

  if (!name || !type || !clubId) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
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
    sendError(res, err, { status: 400, message: 'No se pudo crear la cancha.' });
  }
};
