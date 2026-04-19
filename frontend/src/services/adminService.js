import api from './api';

const adminService = {
    // Get all pending users (distributors and theatre owners)
    getPendingUsers: async () => {
        try {
            console.log('📋 Fetching pending users...');
            const response = await api.get('/admin/pending-users');
            console.log(`✅ Found ${response.data?.count || 0} pending users`);
            return response;
        } catch (error) {
            console.error('❌ Get pending users error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Approve or reject user
    approveUser: async (userId, isVerified) => {
        try {
            console.log('📝 Approving user:', userId, 'Status:', isVerified ? 'APPROVE' : 'REJECT');
            const response = await api.put(`/admin/approve-user/${userId}`, {
                isVerified: isVerified
            });
            console.log('✅ Approve response:', response.data);
            return response;
        } catch (error) {
            console.error('❌ Approve user error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get all users by role (optional role filter)
    getUsersByRole: async (role = null) => {
        try {
            const params = role ? { role } : {};
            const response = await api.get('/admin/users', { params });
            console.log(`✅ Found ${response.data?.count || 0} users${role ? ` with role: ${role}` : ''}`);
            return response;
        } catch (error) {
            console.error('❌ Get users error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get user statistics (counts by role)
    getStats: async () => {
        try {
            console.log('📊 Fetching user statistics...');
            const response = await api.get('/admin/stats');
            console.log('✅ Stats received:', response.data);
            return response;
        } catch (error) {
            console.error('❌ Get stats error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get all users (admin only)
    getAllUsers: async () => {
        try {
            const response = await api.get('/admin/users');
            return response;
        } catch (error) {
            console.error('❌ Get all users error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get user by ID (admin only)
    getUserById: async (userId) => {
        try {
            const response = await api.get(`/admin/users/${userId}`);
            return response;
        } catch (error) {
            console.error('❌ Get user by ID error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Delete user (admin only)
    deleteUser: async (userId) => {
        try {
            console.log('🗑️ Deleting user:', userId);
            const response = await api.delete(`/admin/users/${userId}`);
            console.log('✅ User deleted successfully');
            return response;
        } catch (error) {
            console.error('❌ Delete user error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Update user role (admin only)
    updateUserRole: async (userId, newRole) => {
        try {
            console.log('🔄 Updating user role:', userId, 'to', newRole);
            const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
            console.log('✅ User role updated:', response.data);
            return response;
        } catch (error) {
            console.error('❌ Update user role error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get platform statistics (admin only)
    getPlatformStats: async () => {
        try {
            const response = await api.get('/admin/platform-stats');
            return response;
        } catch (error) {
            console.error('❌ Get platform stats error:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default adminService;