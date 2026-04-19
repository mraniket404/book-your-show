const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const theatreRoutes = require('./routes/theatreRoutes');

const app = express();
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Theatre service connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5006'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`📥 [THEATRE] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`📦 Body:`, req.body);
    }
    next();
});

// Routes
app.use(`${BASE_PATH}/api/theatre`, theatreRoutes);

// Health check
app.get(`${BASE_PATH}/health`, (req, res) => {
    res.json({
        status: 'OK',
        service: 'theatre-service',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.url}`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Theatre service error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

module.exports = app;