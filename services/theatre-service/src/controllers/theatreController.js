const Theatre = require('../models/Theatre');

const getTheatresByCity = async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ success: false, message: 'City is required' });
        }
        
        const theatres = await Theatre.find({ city, isActive: true, isVerified: true })
            .select('name address amenities images totalSeats contactNumber');
        res.status(200).json({ success: true, count: theatres.length, data: theatres });
    } catch (error) {
        console.error('Get theatres error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getTheatreById = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id).select('name address amenities images contactNumber email description');
        if (!theatre) {
            return res.status(404).json({ success: false, message: 'Theatre not found' });
        }
        res.status(200).json({ success: true, data: theatre });
    } catch (error) {
        console.error('Get theatre error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getTheatreLayout = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id).select('name seatLayout totalSeats');
        if (!theatre) {
            return res.status(404).json({ success: false, message: 'Theatre not found' });
        }
        res.status(200).json({ success: true, data: theatre });
    } catch (error) {
        console.error('Get layout error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getCities = async (req, res) => {
    try {
        const cities = await Theatre.distinct('city', { isActive: true, isVerified: true });
        res.status(200).json({ success: true, count: cities.length, data: cities });
    } catch (error) {
        console.error('Get cities error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getTheatresByCity, getTheatreById, getTheatreLayout, getCities };