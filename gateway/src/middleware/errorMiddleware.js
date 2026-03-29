const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        code: err.code || 'INTERNAL_ERROR'
    });
};

const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.url}`,
        basePath: '/mraniket404',
        availableRoutes: [
            'GET /mraniket404/health',
            'POST /mraniket404/api/auth/register',
            'POST /mraniket404/api/auth/login',
            'GET /mraniket404/api/movies',
            'GET /mraniket404/api/theatre',
            'GET /mraniket404/api/shows',
            'POST /mraniket404/api/bookings/initiate'
        ]
    });
};

module.exports = { errorHandler, notFound };