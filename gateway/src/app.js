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
        console.log(`📦 Request Body:`, JSON.stringify(req.body, null, 2));
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

// Simple test endpoint
app.get(`${BASE_PATH}/test`, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Gateway is working!',
        timestamp: new Date().toISOString()
    });
});

// Auth service test endpoint
app.get(`${BASE_PATH}/api/auth/test`, async (req, res) => {
    try {
        const axios = require('axios');
        const response = await axios.get('http://localhost:5001/mraniket404/health', {
            timeout: 5000
        });
        res.json({ 
            success: true, 
            message: 'Gateway is connected to Auth Service',
            gateway: {
                port: process.env.PORT || 5006,
                basePath: BASE_PATH
            },
            authService: response.data 
        });
    } catch (error) {
        res.status(503).json({ 
            success: false, 
            message: 'Auth service is not reachable',
            error: error.message,
            gateway: {
                port: process.env.PORT || 5006,
                basePath: BASE_PATH
            }
        });
    }
});

// ==================== PROXY CONFIGURATIONS ====================

// Auth Proxy
app.use(`${BASE_PATH}/api/auth`, createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: {
        '^/mraniket404/api/auth': '/mraniket404/api/auth'
    },
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
        console.log(`🟢 [AUTH PROXY] Response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('🔴 [AUTH PROXY] Error:', err.message);
        res.status(503).json({ 
            success: false, 
            message: 'Auth service is currently unavailable',
            error: err.message
        });
    }
}));

// Movie Proxy
app.use(`${BASE_PATH}/api/movies`, createProxyMiddleware({
    target: 'http://localhost:5002',
    changeOrigin: true,
    pathRewrite: {
        '^/mraniket404/api/movies': '/mraniket404/api/movies'
    },
    onError: (err, req, res) => {
        console.error('Movie proxy error:', err.message);
        res.status(503).json({ success: false, message: 'Movie service unavailable' });
    }
}));

// Theatre Proxy with Mock Cities Support
app.get(`${BASE_PATH}/api/theatre/cities`, (req, res) => {
    console.log('📍 [THEATRE MOCK] Serving mock cities data');
    res.json({
        success: true,
        data: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']
    });
});

app.use(`${BASE_PATH}/api/theatre`, createProxyMiddleware({
    target: 'http://localhost:5004',
    changeOrigin: true,
    pathRewrite: {
        '^/mraniket404/api/theatre': '/mraniket404/api/theatre'
    },
    proxyTimeout: 60000,
    timeout: 60000,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔵 [THEATRE PROXY] ${req.method} ${req.url}`);
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`🟢 [THEATRE PROXY] Response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('🔴 [THEATRE PROXY] Error:', err.message);
        if (req.url.includes('/cities')) {
            console.log('📍 [THEATRE MOCK] Falling back to mock cities data');
            return res.status(200).json({
                success: true,
                data: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']
            });
        }
        res.status(503).json({ 
            success: false, 
            message: 'Theatre service is currently unavailable',
            error: err.message
        });
    }
}));

// Show Proxy
app.use(`${BASE_PATH}/api/shows`, createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
    pathRewrite: {
        '^/mraniket404/api/shows': '/mraniket404/api/shows'
    },
    onError: (err, req, res) => {
        console.error('Show proxy error:', err.message);
        res.status(503).json({ success: false, message: 'Show service unavailable' });
    }
}));

// Booking Proxy
app.use(`${BASE_PATH}/api/bookings`, createProxyMiddleware({
    target: 'http://localhost:5005',
    changeOrigin: true,
    pathRewrite: {
        '^/mraniket404/api/bookings': '/mraniket404/api/bookings'
    },
    onError: (err, req, res) => {
        console.error('Booking proxy error:', err.message);
        res.status(503).json({ success: false, message: 'Booking service unavailable' });
    }
}));

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        success: false, 
        message: `Route not found: ${req.url}`,
        availableEndpoints: [
            `GET ${BASE_PATH}/health`,
            `GET ${BASE_PATH}/test`,
            `GET ${BASE_PATH}/api/auth/test`,
            `POST ${BASE_PATH}/api/auth/register`,
            `POST ${BASE_PATH}/api/auth/login`,
            `GET ${BASE_PATH}/api/auth/me`,
            `GET ${BASE_PATH}/api/theatre/cities`
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Gateway error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal gateway error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;