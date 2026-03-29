const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const theatreRoutes = require('./routes/theatreRoutes');
const theatreOwnerRoutes = require('./routes/theatreOwnerRoutes');
const connectDB = require('./config/database');

const app = express();
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

connectDB();

app.use(cors());
app.use(express.json());

app.use(`${BASE_PATH}/api/theatre`, theatreRoutes);
app.use(`${BASE_PATH}/api/theatre/owner`, theatreOwnerRoutes);

app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({ status: 'OK', service: 'theatre-service', basePath: BASE_PATH });
});

module.exports = app;