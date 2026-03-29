const express = require('express');
const router = express.Router();
const {
    getCities,
    getCityById,
    createCity
} = require('../controllers/cityController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getCities);
router.get('/:id', getCityById);

// Admin routes
router.post('/', protect, admin, createCity);

module.exports = router;