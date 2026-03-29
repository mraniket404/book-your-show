const City = require('../models/City');

/**
 * @desc    Get all cities
 * @route   GET /api/cities
 * @access  Public
 */
const getCities = async (req, res) => {
    try {
        const cities = await City.find({ isActive: true })
            .sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            count: cities.length,
            data: cities
        });

    } catch (error) {
        console.error('Get cities error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Get city by ID
 * @route   GET /api/cities/:id
 * @access  Public
 */
const getCityById = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);
        
        if (!city) {
            return res.status(404).json({
                success: false,
                message: 'City not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: city
        });

    } catch (error) {
        console.error('Get city error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Create new city (Admin only)
 * @route   POST /api/cities
 * @access  Private/Admin
 */
const createCity = async (req, res) => {
    try {
        const { name, state, country } = req.body;
        
        const cityExists = await City.findOne({ name });
        
        if (cityExists) {
            return res.status(400).json({
                success: false,
                message: 'City already exists'
            });
        }
        
        const city = await City.create({
            name,
            state,
            country
        });
        
        res.status(201).json({
            success: true,
            data: city
        });

    } catch (error) {
        console.error('Create city error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getCities,
    getCityById,
    createCity
};