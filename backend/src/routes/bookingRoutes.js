//🛣️ Rutas de Reservas (`bookingRoutes.js`)
//js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, bookingController.createBooking);
router.get('/user', authMiddleware, bookingController.getUserBookings);
router.patch('/:id/status', authMiddleware, bookingController.updateBookingStatus);

module.exports = router;
