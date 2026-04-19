const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token with role
 */
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
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

        // Validation
        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Set verification status
        const isVerified = role === 'user' ? true : false;

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

        // Generate token WITH ROLE
        const token = generateToken(user._id, user.role);

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
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
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
        
        // Check verification for non-users
        if (user.role !== 'user' && !user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending admin approval'
            });
        }
        
        // Generate token WITH ROLE
        const token = generateToken(user._id, user.role);
        
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
            message: 'Server error'
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
            message: 'Server error'
        });
    }
};

// ✅ NEW FUNCTION: Update user role
/**
 * @desc    Update user role (for admin/theatre owner)
 * @route   PUT /mraniket404/api/auth/update-role
 * @access  Private
 */
const updateRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        const validRoles = ['user', 'distributor', 'theatre-owner', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Valid roles: user, distributor, theatre-owner, admin'
            });
        }
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        user.role = role;
        user.updatedAt = Date.now();
        await user.save();
        
        // Generate new token with updated role
        const token = generateToken(user._id, user.role);
        
        res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    updateRole  // ✅ Export the new function
};