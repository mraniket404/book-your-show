const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

// Security middleware
app.use(helmet());

// CORS Configuration
app.use(cors({ 
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// Logging
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`🌐 [GATEWAY] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        const logBody = { ...req.body };
        if (logBody.password) logBody.password = '***';
        if (logBody.seatLayout) logBody.seatLayout = '[SEAT DATA]';
        console.log(`📦 Body:`, logBody);
    }
    next();
});

// Health check endpoint
app.get(`${BASE_PATH}/health`, (req, res) => {
    res.json({
        status: 'OK',
        service: 'api-gateway',
        basePath: BASE_PATH,
        timestamp: new Date().toISOString()
    });
});

// Test endpoint
app.get(`${BASE_PATH}/test`, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Gateway is working!',
        timestamp: new Date().toISOString()
    });
});

// Services status endpoint
app.get(`${BASE_PATH}/services`, async (req, res) => {
    const axios = require('axios');
    const services = {
        auth: { port: 5001, status: 'unknown', url: 'http://localhost:5001/mraniket404/health' },
        movies: { port: 5002, status: 'unknown', url: 'http://localhost:5002/mraniket404/health' },
        shows: { port: 5003, status: 'unknown', url: 'http://localhost:5003/mraniket404/health' },
        theatre: { port: 5004, status: 'unknown', url: 'http://localhost:5004/mraniket404/health' },
        bookings: { port: 5005, status: 'unknown', url: 'http://localhost:5005/mraniket404/health' }
    };
    
    for (const [name, service] of Object.entries(services)) {
        try {
            const response = await axios.get(service.url, { timeout: 3000 });
            service.status = response.data.database === 'connected' ? 'healthy' : 'degraded';
        } catch (error) {
            service.status = 'unavailable';
        }
    }
    
    res.json({ success: true, gateway: { port: 5006, basePath: BASE_PATH }, services });
});

// ==================== PROXY CONFIGURATIONS ====================

// Auth Proxy (Port 5001)
app.use(`${BASE_PATH}/api/auth`, createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    proxyTimeout: 120000,
    timeout: 120000,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔵 [AUTH PROXY] ${req.method} ${req.url}`);
        if (req.method === 'POST' && req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`🟢 [AUTH PROXY] Response: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
        console.error('🔴 [AUTH PROXY] Error:', err.message);
        res.status(503).json({ success: false, message: 'Auth service unavailable' });
    }
}));

// Movie Proxy (Port 5002)
app.use(`${BASE_PATH}/api/movies`, createProxyMiddleware({
    target: 'http://localhost:5002',
    changeOrigin: true,
    proxyTimeout: 60000,
    timeout: 60000,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔵 [MOVIE PROXY] ${req.method} ${req.url}`);
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`🟢 [MOVIE PROXY] Response: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
        console.error('🔴 [MOVIE PROXY] Error:', err.message);
        res.status(503).json({ success: false, message: 'Movie service unavailable' });
    }
}));

// Show Proxy (Port 5003)
app.use(`${BASE_PATH}/api/shows`, createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
    proxyTimeout: 120000,
    timeout: 120000,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔵 [SHOW PROXY] ${req.method} ${req.url}`);
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`🟢 [SHOW PROXY] Response: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
        console.error('🔴 [SHOW PROXY] Error:', err.message);
        res.status(503).json({ success: false, message: 'Show service unavailable' });
    }
}));

// Theatre Proxy (Port 5004)
app.use(`${BASE_PATH}/api/theatre`, createProxyMiddleware({
    target: 'http://localhost:5004',
    changeOrigin: true,
    proxyTimeout: 60000,
    timeout: 60000,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔵 [THEATRE PROXY] ${req.method} ${req.url}`);
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`🟢 [THEATRE PROXY] Response: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
        console.error('🔴 [THEATRE PROXY] Error:', err.message);
        res.status(503).json({ success: false, message: 'Theatre service unavailable' });
    }
}));

// Booking Proxy (Port 5005)
app.use(`${BASE_PATH}/api/bookings`, createProxyMiddleware({
    target: 'http://localhost:5005',
    changeOrigin: true,
    proxyTimeout: 60000,
    timeout: 60000,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔵 [BOOKING PROXY] ${req.method} ${req.url}`);
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`🟢 [BOOKING PROXY] Response: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
        console.error('🔴 [BOOKING PROXY] Error:', err.message);
        res.status(503).json({ success: false, message: 'Booking service unavailable' });
    }
}));

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ success: false, message: `Route not found: ${req.url}` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Gateway error:', err);
    res.status(500).json({ success: false, message: 'Internal gateway error' });
});

module.exports = app;