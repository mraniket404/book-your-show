const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    phoneNumber: String,
    city: String,
    isVerified: Boolean,
    createdAt: Date
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'aniketgosavi964@gmail.com' });
        if (existingAdmin) {
            console.log('\n⚠️  Admin already exists!');
            console.log('📧 Email: aniketgosavi964@gmail.com');
            console.log('🔑 Password: Aniket@8788');
            console.log('\n💡 Use these credentials to login\n');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Aniket@8788', salt);

        // Create admin user
        const admin = new User({
            name: 'Aniket Gosavi',
            email: 'aniketgosavi964@gmail.com',
            password: hashedPassword,
            role: 'admin',
            phoneNumber: '9999999999',
            city: 'System',
            isVerified: true,
            createdAt: new Date()
        });

        await admin.save();
        
        console.log('\n🎉 Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: aniketgosavi964@gmail.com');
        console.log('🔑 Password: Aniket@8788');
        console.log('👤 Name: Aniket Gosavi');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  Please keep these credentials safe!\n');

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createAdmin();