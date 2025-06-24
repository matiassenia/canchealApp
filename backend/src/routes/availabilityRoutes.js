
// 📅 Rutas de Disponibilidad (`availabilityRoutes.js`)
//js
const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:id', availabilityController.getAvailability);
router.post('/', authMiddleware, availabilityController.setAvailability);

module.exports = router;
