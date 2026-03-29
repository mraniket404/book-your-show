const jwt = require('jsonwebtoken');
const { publicRoutes } = require('../config/services');

/**
 * Verify JWT token
 */
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
            code: 'NO_TOKEN'
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            code: 'AUTH_FAILED'
        });
    }
};

/**
 * Check if route is public
 */
const isPublicRoute = (path) => {
    return publicRoutes.some(route => {
        // Exact match
        if (route === path) return true;
        
        // Pattern match for routes with parameters
        if (route.includes('[^/]+')) {
            const regex = new RegExp('^' + route.replace(/\[[^\]]+\]/g, '[^/]+') + '$');
            return regex.test(path);
        }
        
        // Prefix match
        if (route.endsWith('/') && path.startsWith(route)) return true;
        if (!route.endsWith('/') && (path === route || path.startsWith(route + '/'))) return true;
        
        return false;
    });
};

/**
 * Main authentication middleware
 */
const authenticate = async (req, res, next) => {
    const path = req.path;
    
    // Skip authentication for public routes
    if (isPublicRoute(path)) {
        return next();
    }
    
    // Verify token for protected routes
    await verifyToken(req, res, next);
};

module.exports = { authenticate, verifyToken, isPublicRoute };