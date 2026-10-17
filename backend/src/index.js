require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const fieldTypeRoutes = require('./routes/fieldTypeRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const timeSlotRoutes = require('./routes/timeSlotRoutes');
const priceRoutes = require('./routes/priceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sport Booking API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/field-types', fieldTypeRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/time-slots', timeSlotRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stats', statsRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
