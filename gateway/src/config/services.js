const serviceConfig = {
    auth: {
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
        routes: ['/api/auth'],
        protected: false,
        timeout: 5000
    },
    movie: {
        url: process.env.MOVIE_SERVICE_URL || 'http://localhost:5002',
        routes: ['/api/movies'],
        protected: false,
        timeout: 5000
    },
    show: {
        url: process.env.SHOW_SERVICE_URL || 'http://localhost:5003',
        routes: ['/api/shows'],
        protected: false,
        timeout: 5000
    },
    theatre: {
        url: process.env.THEATRE_SERVICE_URL || 'http://localhost:5004',
        routes: ['/api/theatre'],
        protected: false,
        timeout: 5000
    },
    booking: {
        url: process.env.BOOKING_SERVICE_URL || 'http://localhost:5005',
        routes: ['/api/bookings'],
        protected: true,
        timeout: 5000
    },
    payment: {
        url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5006',
        routes: ['/api/payments'],
        protected: true,
        timeout: 5000
    }
};

// Public routes that don't require authentication
const publicRoutes = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/movies',
    '/api/movies/now-showing',
    '/api/movies/upcoming',
    '/api/movies/status',
    '/api/theatre',
    '/api/theatre/cities',
    '/api/theatre/[^/]+/layout',
    '/api/shows',
    '/api/shows/[^/]+$',
    '/health',
    '/'
];

// Admin only routes
const adminRoutes = [
    '/api/movies$',
    '/api/movies/\\w+$',
    '/api/theatre/owner',
    '/api/theatre/owner/.*'
];

module.exports = { serviceConfig, publicRoutes, adminRoutes };