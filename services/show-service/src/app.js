const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const showRoutes = require('./routes/showRoutes');
const showOwnerRoutes = require('./routes/showOwnerRoutes');
const connectDB = require('./config/database');

const app = express();
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

connectDB();

app.use(cors());
app.use(express.json());

app.use(`${BASE_PATH}/api/shows`, showRoutes);
app.use(`${BASE_PATH}/api/shows/owner`, showOwnerRoutes);

app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({ status: 'OK', service: 'show-service', basePath: BASE_PATH });
});

module.exports = app;