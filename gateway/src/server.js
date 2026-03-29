const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5006;
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n=================================');
    console.log('🚀 API GATEWAY STARTED');
    console.log('=================================');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Gateway URL: http://localhost:${PORT}${BASE_PATH}`);
    console.log(`🔗 Health: http://localhost:${PORT}${BASE_PATH}/health`);
    console.log(`🔗 Test: http://localhost:${PORT}${BASE_PATH}/test`);
    console.log(`🔗 Auth Test: http://localhost:${PORT}${BASE_PATH}/api/auth/test`);
    console.log(`🔗 Register: http://localhost:${PORT}${BASE_PATH}/api/auth/register`);
    console.log('=================================\n');
});

// Increase server timeouts
server.timeout = 120000;
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;

// Handle connection errors
server.on('clientError', (err, socket) => {
    console.error('Client error:', err.message);
    if (socket.writable) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => {
        process.exit(1);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});