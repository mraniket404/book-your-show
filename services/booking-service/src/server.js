const app = require('./app');
const PORT = process.env.PORT || 5005;
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

const server = app.listen(PORT, () => {
    console.log(`\n🎫 BOOKING SERVICE STARTED`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}${BASE_PATH}/health\n`);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});