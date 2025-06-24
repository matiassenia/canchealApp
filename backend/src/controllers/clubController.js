
// 🏢 Controlador de Clubes (`clubController.js`)
//js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getClubs = async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      include: { fields: true, owner: { select: { id: true, name: true } } }
    });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createClub = async (req, res) => {
  const { name, address, zone, description } = req.body;
  const ownerId = req.user.id;

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
    res.status(400).json({ error: err.message });
  }
};
