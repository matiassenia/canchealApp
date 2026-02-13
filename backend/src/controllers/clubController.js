
// 🏢 Controlador de Clubes (`clubController.js`)
//js
const { PrismaClient } = require('@prisma/client');
const { sendError } = require('../utils/errorResponse');
const prisma = new PrismaClient();

exports.getClubs = async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      include: { fields: true, owner: { select: { id: true, name: true } } }
    });
    res.json(clubs);
  } catch (err) {
    console.error('Error en getClubs:', err);
    sendError(res, err, { status: 500, message: 'No se pudieron obtener los clubes.' });
  }
};

exports.createClub = async (req, res) => {
  const { name, address, zone, description } = req.body;
  const ownerId = req.user && req.user.id;

  if (!ownerId) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }

  if (!name || !address || !zone || !description) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  try {
    const newClub = await prisma.club.create({
      data: {
        name,
        address,
        zone,
        description,
        ownerId
      }
    });
    res.status(201).json(newClub);
  } catch (err) {
    console.error('Error en createClub:', err);
    sendError(res, err, { status: 400, message: 'No se pudo crear el club.' });
  }
};
