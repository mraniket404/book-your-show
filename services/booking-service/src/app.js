const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const bookingRoutes = require('./routes/bookingRoutes');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');

const app = express();
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

connectDB();
connectRedis();

app.use(cors());
app.use(express.json());

app.use(`${BASE_PATH}/api/bookings`, bookingRoutes);

app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({ status: 'OK', service: 'booking-service', basePath: BASE_PATH });
});

module.exports = app;