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
    console.log(`🔗 Health: http://localhost:${PORT}${BASE_PATH}/health`);
    console.log(`🔗 Services: http://localhost:${PORT}${BASE_PATH}/services`);
    console.log(`🔗 Auth: http://localhost:${PORT}${BASE_PATH}/api/auth/login`);
    console.log(`🔗 Shows: http://localhost:${PORT}${BASE_PATH}/api/shows`);
    console.log(`🔗 Theatre: http://localhost:${PORT}${BASE_PATH}/api/theatre`);
    console.log('=================================\n');
});

server.timeout = 300000;
server.keepAliveTimeout = 300000;
server.headersTimeout = 300000;

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server...');
    server.close(() => process.exit(0));
});