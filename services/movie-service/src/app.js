const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const movieRoutes = require('./routes/movieRoutes');
const distributorRoutes = require('./routes/distributorRoutes');
const adminMovieRoutes = require('./routes/adminMovieRoutes');
const connectDB = require('./config/database');

const app = express();
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

connectDB();

app.use(cors());
app.use(express.json());

app.use(`${BASE_PATH}/api/movies`, movieRoutes);
app.use(`${BASE_PATH}/api/movies/distributor`, distributorRoutes);
app.use(`${BASE_PATH}/api/movies/admin`, adminMovieRoutes);

app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({ status: 'OK', service: 'movie-service', basePath: BASE_PATH });
});

app.get(BASE_PATH, (req, res) => {
    res.json({
        name: 'Movie Service',
        basePath: BASE_PATH,
        endpoints: {
            public: `${BASE_PATH}/api/movies`,
            distributor: `${BASE_PATH}/api/movies/distributor`,
            admin: `${BASE_PATH}/api/movies/admin`
        }
    });
});

module.exports = app;