const Show = require('../models/Show');
const axios = require('axios');

const addShow = async (req, res) => {
    try {
        const { movieId, theatreId, date, time, language, format } = req.body;
        
        // Verify theatre belongs to owner
        const theatreResponse = await axios.get(`${process.env.THEATRE_SERVICE_URL}/mraniket404/api/theatre/owner/my-theatres`, {
            headers: { Authorization: req.headers.authorization }
        });
        
        const userTheatres = theatreResponse.data.data;
        const ownsTheatre = userTheatres.some(t => t._id === theatreId);
        
        if (!ownsTheatre) {
            return res.status(403).json({ success: false, message: 'You do not own this theatre' });
        }
        
        // Check if movie exists and is approved
        const movieResponse = await axios.get(`${process.env.MOVIE_SERVICE_URL}/mraniket404/api/movies/${movieId}`);
        if (movieResponse.data.data.status !== 'approved' && movieResponse.data.data.status !== 'now-showing') {
            return res.status(400).json({ success: false, message: 'Movie is not approved yet' });
        }
        
        // Check for duplicate show
        const existingShow = await Show.findOne({ theatreId, date: new Date(date), time });
        if (existingShow) {
            return res.status(400).json({ success: false, message: 'A show already exists at this time' });
        }
        
        // Get theatre details for seat count
        const theatreDetailResponse = await axios.get(`${process.env.THEATRE_SERVICE_URL}/mraniket404/api/theatre/${theatreId}`);
        const totalSeats = theatreDetailResponse.data.data.totalSeats;
        
        const show = await Show.create({
            movieId,
            theatreId,
            date: new Date(date),
            time,
            language,
            format,
            availableSeats: totalSeats
        });
        
        res.status(201).json({ success: true, message: 'Show added successfully', data: show });
    } catch (error) {
        console.error('Add show error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMyShows = async (req, res) => {
    try {
        const theatreResponse = await axios.get(`${process.env.THEATRE_SERVICE_URL}/mraniket404/api/theatre/owner/my-theatres`, {
            headers: { Authorization: req.headers.authorization }
        });
        
        const theatreIds = theatreResponse.data.data.map(t => t._id);
        const shows = await Show.find({ theatreId: { $in: theatreIds } }).sort({ date: -1, time: 1 });
        
        res.status(200).json({ success: true, count: shows.length, data: shows });
    } catch (error) {
        console.error('Get my shows error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateShow = async (req, res) => {
    try {
        const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!show) {
            return res.status(404).json({ success: false, message: 'Show not found' });
        }
        res.status(200).json({ success: true, data: show });
    } catch (error) {
        console.error('Update show error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteShow = async (req, res) => {
    try {
        const show = await Show.findByIdAndDelete(req.params.id);
        if (!show) {
            return res.status(404).json({ success: false, message: 'Show not found' });
        }
        res.status(200).json({ success: true, message: 'Show deleted successfully' });
    } catch (error) {
        console.error('Delete show error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { addShow, getMyShows, updateShow, deleteShow };