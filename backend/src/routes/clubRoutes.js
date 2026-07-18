//🗺️ Rutas de Clubes (`clubRoutes.js`)
//js
const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');

const authMiddleware = require('../middlewares/authMiddleware');

if (!authMiddleware) throw new Error('authMiddleware está undefined');


router.get('/', clubController.getClubs);
router.get('/mine', authMiddleware, clubController.getMyClubs);
router.get('/:id', clubController.getClubById);
router.post('/', authMiddleware, clubController.createClub);

module.exports = router;

