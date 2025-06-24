//🗺️ Rutas de Clubes (`clubRoutes.js`)
//js
const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
console.log('clubController:', clubController);

const authMiddleware = require('../middlewares/authMiddleware');

console.log('authMiddleware:', authMiddleware);

if (!authMiddleware) throw new Error('authMiddleware está undefined');


router.get('/', clubController.getClubs);
router.post('/', authMiddleware, clubController.createClub);

module.exports = router;

