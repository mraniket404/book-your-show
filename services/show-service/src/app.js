const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const showRoutes = require('./routes/showRoutes');

const app = express();
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

// Connect to MongoDB with timeout
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('✅ Show service connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5006', 'http://localhost:5003'],
    credentials: true
}));

// Increase payload limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response time logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`⏱️ ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Request logging (don't log huge data)
app.use((req, res, next) => {
    console.log(`📥 [SHOW] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        const logBody = { ...req.body };
        if (logBody.seatLayout) {
            logBody.seatLayout = `[DATA: ${JSON.stringify(logBody.seatLayout).length} chars]`;
        }
        console.log(`📦 Body keys:`, Object.keys(req.body));
    }
    next();
});

// Routes
app.use(`${BASE_PATH}/api/shows`, showRoutes);

// Health check
app.get(`${BASE_PATH}/health`, async (req, res) => {
    let dbStatus = 'disconnected';
    try {
        if (mongoose.connection.readyState === 1) {
            dbStatus = 'connected';
        }
    } catch (e) {
        dbStatus = 'error';
    }
    
    res.json({ 
        status: 'OK', 
        service: 'show-service',
        database: dbStatus,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.url}` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Show service error:', err);
    res.status(500).json({ success: false, message: err.message });
});

module.exports = app;