const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

/**
 * @desc    Register a new user
 * @route   POST /mraniket404/api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    try {
        console.log('📝 [REGISTER] Request received');
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
        
        const { 
            name, 
            email, 
            password, 
            phoneNumber, 
            city, 
            role,
            companyName,
            gstNumber 
        } = req.body;

        // Validate required fields
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        if (!phoneNumber) missingFields.push('phoneNumber');
        
        if (missingFields.length > 0) {
            console.log('❌ Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate phone number format
        if (!/^\d{10}$/.test(phoneNumber.toString())) {
            console.log('❌ Invalid phone number format:', phoneNumber);
            return res.status(400).json({
                success: false,
                message: 'Phone number must be exactly 10 digits'
            });
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Invalid email format:', email);
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password length
        if (password.length < 6) {
            console.log('❌ Password too short:', password.length);
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // For distributors and theatre owners, set isVerified to false initially
        const isVerified = role === 'user' ? true : false;

        console.log('✅ Creating user with data:', {
            name,
            email,
            role: role || 'user',
            phoneNumber,
            isVerified
        });

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phoneNumber: phoneNumber.toString(),
            city: city || '',
            role: role || 'user',
            companyName: companyName || '',
            gstNumber: gstNumber || '',
            isVerified
        });

        console.log('✅ User created successfully:', user._id);

        // Generate token
        const token = generateToken(user._id);

        // Return user data
        res.status(201).json({
            success: true,
            message: role === 'user' 
                ? 'Registration successful!' 
                : 'Registration successful! Your account is pending admin approval.',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                city: user.city,
                isVerified: user.isVerified,
                companyName: user.companyName,
                token
            }
        });

    } catch (error) {
        console.error('❌ Register error:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            console.log('❌ Validation errors:', errors);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }
        
        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            console.log('❌ Duplicate field:', field);
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /mraniket404/api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        const isPasswordMatch = await user.matchPassword(password);
        
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Check if user is verified (for distributors and theatre owners)
        if (user.role !== 'user' && !user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending admin approval. Please wait for verification.'
            });
        }
        
        const token = generateToken(user._id);
        
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                city: user.city,
                isVerified: user.isVerified,
                companyName: user.companyName,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /mraniket404/api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /mraniket404/api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
    try {
        const { name, phoneNumber, city, address } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (city) user.city = city;
        if (address) user.address = address;
        
        await user.save();
        
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                city: user.city,
                address: user.address,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile
};