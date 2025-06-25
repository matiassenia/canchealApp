
// 🚀 Archivo principal (`index.js`)
//`js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const clubRoutes = require('./src/routes/clubRoutes');
const fieldRoutes = require('./src/routes/fieldRoutes');
const availabilityRoutes = require('./src/routes/availabilityRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');

// Usar rutas
app.use('/auth', authRoutes);
app.use('/clubs', clubRoutes);
app.use('/fields', fieldRoutes);
app.use('/availability', availabilityRoutes);
app.use('/bookings', bookingRoutes);

// Puerto y start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

