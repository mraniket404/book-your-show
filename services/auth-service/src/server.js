const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5001;
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

// Increase server timeout values
const server = app.listen(PORT, () => {
    console.log('\n=================================');
    console.log('🔐 AUTH SERVICE STARTED');
    console.log('=================================');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}${BASE_PATH}/health`); 
    console.log(`⏱️  Server Timeout: 120 seconds`);
    console.log('=================================\n');
});

// CRITICAL: Set server timeouts
server.timeout = 120000; // 120 seconds
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