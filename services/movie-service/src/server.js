const app = require('./app');
const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
    console.log(`\n🎬 MOVIE SERVICE STARTED`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}/mraniket404/health`);
    console.log(`=================================\n`);
});

server.timeout = 60000;

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});