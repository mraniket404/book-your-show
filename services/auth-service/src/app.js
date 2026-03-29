const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const connectDB = require('./config/database');

const app = express();
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

connectDB();

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests' }
});
app.use('/api', limiter);

// Increase body size limit and timeout
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add request timeout middleware - CRITICAL FIX
app.use((req, res, next) => {
    req.setTimeout(120000);
    res.setTimeout(120000);
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📥 [AUTH] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`📦 Body:`, req.body);
    }
    next();
});

// CORS configuration - Add all gateway ports
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000', 'http://localhost:5006', 'http://localhost:5007', 'http://localhost:5008'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight
app.options('*', cors());

// Routes
app.use(`${BASE_PATH}/api/auth`, authRoutes);
app.use(`${BASE_PATH}/api/admin`, adminRoutes);

// Health check
app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'auth-service',
        basePath: BASE_PATH,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler
app.use((req, res) => {
    console.log(`❌ [AUTH] Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        success: false, 
        message: `Route not found: ${req.originalUrl}` 
    });
});

// Global error handler with specific handling for aborted requests
app.use((err, req, res, next) => {
    console.error('❌ [AUTH] Global error:', err.message);
    
    // Handle request aborted errors
    if (err.message === 'request aborted' || err.code === 'ECONNRESET') {
        return res.status(400).json({
            success: false,
            message: 'Request timeout. Please try again.'
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

module.exports = app;