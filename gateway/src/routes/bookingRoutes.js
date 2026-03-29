const express = require('express');
const router = express.Router();
const { createServiceProxy } = require('../config/proxy');
const { serviceConfig } = require('../config/services');
const { bookingLimiter } = require('../middleware/rateLimiter');

// Create proxy for booking service
const bookingProxy = createServiceProxy(serviceConfig.booking.url, 'Booking');

// Apply booking rate limiter
router.use(bookingLimiter);

// Forward all booking requests to booking service
router.use('/', bookingProxy);

module.exports = router;