const app = require('./app');
const PORT = process.env.PORT || 5004;
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

const server = app.listen(PORT, () => {
    console.log(`\n🎭 THEATRE SERVICE STARTED`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}${BASE_PATH}/health`);
    console.log(`=================================\n`);
});

server.timeout = 60000;

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});