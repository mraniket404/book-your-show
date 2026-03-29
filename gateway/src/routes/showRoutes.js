const express = require('express');
const router = express.Router();
const { createServiceProxy } = require('../config/proxy');
const { serviceConfig } = require('../config/services');

// Create proxy for show service
const showProxy = createServiceProxy(serviceConfig.show.url, 'Show');

// Forward all show requests to show service
router.use('/', showProxy);

module.exports = router;