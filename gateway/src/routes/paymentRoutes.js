const express = require('express');
const router = express.Router();
const { createServiceProxy } = require('../config/proxy');
const { serviceConfig } = require('../config/services');

// Create proxy for payment service
const paymentProxy = createServiceProxy(serviceConfig.payment.url, 'Payment');

// Forward all payment requests to payment service
router.use('/', paymentProxy);

module.exports = router;