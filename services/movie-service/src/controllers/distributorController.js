const Movie = require('../models/Movie');

const addMovie = async (req, res) => {
    try {
        const movieData = {
            ...req.body,
            distributorId: req.user.id,
            status: 'pending'
        };
        
        const movie = await Movie.create(movieData);
        
        res.status(201).json({
            success: true,
            message: 'Movie submitted for approval',
            data: movie
        });
    } catch (error) {
        console.error('Add movie error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMyMovies = async (req, res) => {
    try {
        const movies = await Movie.find({ distributorId: req.user.id })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: movies.length, data: movies });
    } catch (error) {
        console.error('Get my movies error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findOne({
            _id: req.params.id,
            distributorId: req.user.id,
            status: 'pending'
        });
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found or already processed'
            });
        }
        
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.status(200).json({ success: true, data: updatedMovie });
    } catch (error) {
        console.error('Update movie error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findOne({
            _id: req.params.id,
            distributorId: req.user.id,
            status: 'pending'
        });
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found or cannot be deleted'
            });
        }
        
        await movie.deleteOne();
        res.status(200).json({ success: true, message: 'Movie deleted successfully' });
    } catch (error) {
        console.error('Delete movie error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { addMovie, getMyMovies, updateMovie, deleteMovie };