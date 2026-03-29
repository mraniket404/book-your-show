const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Create proxy middleware for a service
 */
const createServiceProxy = (targetUrl, serviceName) => {
    return createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: (path, req) => {
            // Keep the original path
            return path;
        },
        onProxyReq: (proxyReq, req, res) => {
            // Log request
            console.log(`[PROXY] ${serviceName}: ${req.method} ${req.url}`);
            
            // Forward authorization header
            if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization);
            }
        },
        onError: (err, req, res) => {
            console.error(`[PROXY ERROR] ${serviceName}:`, err.message);
            res.status(503).json({
                success: false,
                message: `${serviceName} service is currently unavailable`,
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        },
        onProxyRes: (proxyRes, req, res) => {
            // Log response status
            console.log(`[PROXY RESPONSE] ${serviceName}: ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
        },
        timeout: 30000,
        proxyTimeout: 30000
    });
};

module.exports = { createServiceProxy };