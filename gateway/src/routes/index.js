const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const movieRoutes = require('./movieRoutes');
const theatreRoutes = require('./theatreRoutes');
const showRoutes = require('./showRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/theatre', theatreRoutes);
router.use('/shows', showRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);

// Root endpoint
router.get('/', (req, res) => {
    res.json({
        name: 'Book Your Show API Gateway',
        version: '1.0.0',
        services: {
            auth: '/api/auth',
            movies: '/api/movies',
            theatre: '/api/theatre',
            shows: '/api/shows',
            bookings: '/api/bookings',
            payments: '/api/payments'
        },
        documentation: 'API documentation available at /docs'
    });
});

module.exports = router;