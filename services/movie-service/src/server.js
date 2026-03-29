const app = require('./app');
const PORT = process.env.PORT || 5002;
const BASE_PATH = process.env.BASE_PATH || '/mraniket404';

const server = app.listen(PORT, () => {
    console.log(`\n🎬 MOVIE SERVICE STARTED`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}${BASE_PATH}/health`);
    console.log(`📋 Base Path: ${BASE_PATH}\n`);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});