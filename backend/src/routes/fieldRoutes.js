//🧭 Rutas de Canchas (`fieldRoutes.js`)
//js
const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/club/:id', fieldController.getFieldsByClub);
router.post('/', authMiddleware, fieldController.createField);

module.exports = router;

