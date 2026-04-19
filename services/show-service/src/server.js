const app = require('./app');
const PORT = process.env.PORT || 5003;
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

const server = app.listen(PORT, () => {
    console.log(`\n🎬 SHOW SERVICE STARTED`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}${BASE_PATH}/health`);
    console.log(`=================================\n`);
});

// Increase all timeouts
server.timeout = 300000;        // 5 minutes
server.keepAliveTimeout = 300000;
server.headersTimeout = 300000;

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.disconnect();
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.disconnect();
    });
});