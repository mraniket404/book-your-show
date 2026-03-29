const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        // Remove directConnection parameter if it exists for SRV URIs
        const cleanURI = mongoURI.replace(/&?directConnection=true/, '');
        
        const conn = await mongoose.connect(cleanURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        console.error('Please check your MongoDB connection string');
        process.exit(1);
    }
};

module.exports = connectDB;