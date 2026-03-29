const express = require('express');
const router = express.Router();
const { createServiceProxy } = require('../config/proxy');
const { serviceConfig } = require('../config/services');
const { authLimiter } = require('../middleware/rateLimiter');

// Create proxy for auth service
const authProxy = createServiceProxy(serviceConfig.auth.url, 'Auth');

// Apply rate limiter to auth routes
router.use(authLimiter);

// Forward all auth requests to auth service
router.use('/', authProxy);

module.exports = router;