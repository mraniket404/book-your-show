const Movie = require('../models/Movie');

const getMovies = async (req, res) => {
    try {
        const { city, language, genre, status, search, page = 1, limit = 10 } = req.query;

        let query = { isActive: true, status: { $in: ['approved', 'now-showing', 'upcoming'] } };

        if (language) query.language = language;
        if (genre) query.genre = { $in: [genre] };
        if (status) query.status = status;
        if (search) query.$text = { $search: search };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const movies = await Movie.find(query)
            .sort({ releaseDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Movie.countDocuments(query);

        res.status(200).json({
            success: true,
            count: movies.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: movies
        });
    } catch (error) {
        console.error('Get movies error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }
        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        console.error('Get movie error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getNowShowing = async (req, res) => {
    try {
        const movies = await Movie.find({ status: 'now-showing', isActive: true })
            .sort({ releaseDate: -1 })
            .limit(20);
        res.status(200).json({ success: true, count: movies.length, data: movies });
    } catch (error) {
        console.error('Get now showing error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getUpcoming = async (req, res) => {
    try {
        const movies = await Movie.find({ status: 'upcoming', isActive: true })
            .sort({ releaseDate: 1 })
            .limit(20);
        res.status(200).json({ success: true, count: movies.length, data: movies });
    } catch (error) {
        console.error('Get upcoming error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getMovies, getMovieById, getNowShowing, getUpcoming };