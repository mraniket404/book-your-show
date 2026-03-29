const express = require('express');
const router = express.Router();
const {
    getPendingUsers,
    approveUser,
    getUsersByRole,
    getUserStats
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

router.get('/pending-users', getPendingUsers);
router.put('/approve-user/:id', approveUser);
router.get('/users', getUsersByRole);
router.get('/stats', getUserStats);

module.exports = router;