const Movie = require('../models/Movie');

const createMovie = async (req, res) => {
    try {
        console.log('📝 Creating movie...');
        console.log('req.user:', req.user);
        
        const userId = req.user?.id;
        console.log('User ID:', userId);
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const { title, description, duration, language, genre, releaseDate, poster, trailer, status } = req.body;
        
        // Validation
        if (!title || !description || !duration || !language || !genre || !releaseDate) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        // Process genre
        let genreArray = genre;
        if (typeof genre === 'string') {
            genreArray = genre.split(',').map(g => g.trim());
        }
        
        // Process language - take first language only
        let mainLanguage = language;
        if (language.includes('/')) {
            mainLanguage = language.split('/')[0].trim();
        }
        
        const movieData = {
            title: title.trim(),
            description: description.trim(),
            duration: Number(duration),
            language: mainLanguage,
            genre: genreArray,
            releaseDate: new Date(releaseDate),
            poster: poster || 'https://via.placeholder.com/300x450?text=No+Poster',
            trailer: trailer || '',
            status: status || 'upcoming',
            distributorId: userId,
            isActive: true,
            createdAt: new Date()
        };
        
        console.log('Saving movie:', movieData);
        
        const movie = new Movie(movieData);
        await movie.save();
        
        console.log('✅ Movie saved:', movie._id);
        
        res.status(201).json({
            success: true,
            message: 'Movie added successfully',
            data: movie
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find({ isActive: true }).sort({ releaseDate: -1 });
        res.json({ success: true, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }
        res.json({ success: true, data: movie });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getNowShowing = async (req, res) => {
    try {
        const movies = await Movie.find({ status: 'now-showing', isActive: true }).sort({ releaseDate: -1 });
        res.json({ success: true, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUpcoming = async (req, res) => {
    try {
        const movies = await Movie.find({ status: 'upcoming', isActive: true }).sort({ releaseDate: 1 });
        res.json({ success: true, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyMovies = async (req, res) => {
    try {
        const userId = req.user?.id;
        const movies = await Movie.find({ distributorId: userId, isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteMovie = async (req, res) => {
    try {
        const userId = req.user?.id;
        const movie = await Movie.findOne({ _id: req.params.id, distributorId: userId });
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }
        movie.isActive = false;
        await movie.save();
        res.json({ success: true, message: 'Movie deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createMovie,
    getMovies,
    getMovieById,
    getNowShowing,
    getUpcoming,
    getMyMovies,
    deleteMovie
};