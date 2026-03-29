const express = require('express');
const router = express.Router();
const { createServiceProxy } = require('../config/proxy');
const { serviceConfig } = require('../config/services');

// Create proxy for theatre service
const theatreProxy = createServiceProxy(serviceConfig.theatre.url, 'Theatre');

// Forward all theatre requests to theatre service
router.use('/', theatreProxy);

module.exports = router;