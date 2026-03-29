const express = require('express');
const router = express.Router();
const { createServiceProxy } = require('../config/proxy');
const { serviceConfig } = require('../config/services');

// Create proxy for movie service
const movieProxy = createServiceProxy(serviceConfig.movie.url, 'Movie');

// Forward all movie requests to movie service
router.use('/', movieProxy);

module.exports = router;