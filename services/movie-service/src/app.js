const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const movieRoutes = require('./routes/movieRoutes');

const app = express();
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Movie service connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5006'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`📥 [MOVIE] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`📦 Body:`, req.body);
    }
    next();
});

// Routes
app.use(`${BASE_PATH}/api/movies`, movieRoutes);

// Health check
app.get(`${BASE_PATH}/health`, (req, res) => {
    res.json({ status: 'OK', service: 'movie-service', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.url}` });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Movie service error:', err);
    res.status(500).json({ success: false, message: err.message });
});

module.exports = app;