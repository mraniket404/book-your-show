const User = require('../models/User');

/**
 * @desc    Get all pending users (distributors, theatre owners)
 * @route   GET /mraniket404/api/admin/pending-users
 * @access  Private (Admin only)
 */
const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({
            role: { $in: ['distributor', 'theatre-owner'] },
            isVerified: false
        }).select('-password').sort({ createdAt: 1 });
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get pending users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Approve or reject user
 * @route   PUT /mraniket404/api/admin/approve-user/:id
 * @access  Private (Admin only)
 */
const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified, rejectionReason } = req.body;
        
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (user.role === 'user') {
            return res.status(400).json({
                success: false,
                message: 'Regular users do not require approval'
            });
        }
        
        user.isVerified = isVerified;
        await user.save();
        
        res.status(200).json({
            success: true,
            message: `User ${isVerified ? 'approved' : 'rejected'} successfully`,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Get all users by role
 * @route   GET /mraniket404/api/admin/users
 * @access  Private (Admin only)
 */
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.query;
        let query = {};
        
        if (role) {
            query.role = role;
        }
        
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Get user statistics
 * @route   GET /mraniket404/api/admin/stats
 * @access  Private (Admin only)
 */
const getUserStats = async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    verified: {
                        $sum: { $cond: ['$isVerified', 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: ['$isVerified', 0, 1] }
                    }
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getPendingUsers,
    approveUser,
    getUsersByRole,
    getUserStats
};