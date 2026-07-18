
// 🏢 Controlador de Clubes (`clubController.js`)
//js
const prisma = require('../lib/prisma');
const { sendError } = require('../utils/errorResponse');

const MAX_CLUBS_LIMIT = 50;

const clubListSelect = {
  id: true,
  name: true,
  address: true,
  zone: true,
  description: true,
  ownerId: true,
  owner: { select: { id: true, name: true } },
  fields: {
    select: { id: true, name: true, type: true, imageUrl: true, clubId: true }
  }
};

function parsePositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function clampLimit(value) {
  const parsed = parsePositiveInt(value);
  if (!parsed) return 12;
  return Math.min(parsed, MAX_CLUBS_LIMIT);
}

function hasPaginationParams(query) {
  return query.page !== undefined || query.limit !== undefined || query.zone !== undefined || query.search !== undefined;
}

function buildClubWhere({ zone, search, ownerId } = {}) {
  const where = {};

  if (ownerId) where.ownerId = ownerId;
  if (zone && typeof zone === 'string') where.zone = { equals: zone.trim(), mode: 'insensitive' };
  if (search && typeof search === 'string') {
    const term = search.trim();
    if (term) {
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
        { zone: { contains: term, mode: 'insensitive' } }
      ];
    }
  }

  return where;
}

function recordDbTiming(res, label, startedAt) {
  if (!res.locals.dbTimings) return;
  const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
  res.locals.dbTimings.push({ label, durationMs: Number(durationMs.toFixed(1)) });
}

exports.getClubs = async (req, res) => {
  try {
    if (hasPaginationParams(req.query)) {
      const page = parsePositiveInt(req.query.page) || 1;
      const limit = clampLimit(req.query.limit);
      const skip = (page - 1) * limit;
      const where = buildClubWhere({ zone: req.query.zone, search: req.query.search });
      const dbStartedAt = process.hrtime.bigint();
      const [clubs, total] = await prisma.$transaction([
        prisma.club.findMany({
          where,
          select: clubListSelect,
          orderBy: { name: 'asc' },
          skip,
          take: limit
        }),
        prisma.club.count({ where })
      ]);
      recordDbTiming(res, 'clubs.paginated', dbStartedAt);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      return res.json({
        data: clubs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      });
    }

    const dbStartedAt = process.hrtime.bigint();
    const clubs = await prisma.club.findMany({
      select: clubListSelect,
      orderBy: { name: 'asc' }
    });
    recordDbTiming(res, 'clubs.list', dbStartedAt);
    res.json(clubs);
  } catch (err) {
    console.error('Error en getClubs:', err);
    sendError(res, err, { status: 500, message: 'No se pudieron obtener los clubes.' });
  }
};

exports.getMyClubs = async (req, res) => {
  const userId = req.user && req.user.id;

  if (!userId) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }

  try {
    const dbStartedAt = process.hrtime.bigint();
    const clubs = await prisma.club.findMany({
      where: { ownerId: userId },
      select: clubListSelect,
      orderBy: { name: 'asc' }
    });
    recordDbTiming(res, 'clubs.mine', dbStartedAt);

    res.json(clubs);
  } catch (err) {
    console.error('Error en getMyClubs:', err);
    sendError(res, err, { status: 500, message: 'No se pudieron obtener tus clubes.' });
  }
};

exports.getClubById = async (req, res) => {
  const clubId = parsePositiveInt(req.params.id);

  if (!clubId) {
    return res.status(400).json({ error: 'clubId inválido.' });
  }

  try {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: clubListSelect
    });

    if (!club) {
      return res.status(404).json({ error: 'Club no encontrado.' });
    }

    res.json(club);
  } catch (err) {
    console.error('Error en getClubById:', err);
    sendError(res, err, { status: 500, message: 'No se pudo obtener el club.' });
  }
};

exports.createClub = async (req, res) => {
  const { name, address, zone, description } = req.body;
  const ownerId = req.user && req.user.id;
  const role = req.user && req.user.role;

  if (!ownerId) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }

  if (role !== 'OWNER' && role !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo propietarios o administradores pueden crear clubes.' });
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
