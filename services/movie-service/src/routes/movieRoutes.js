const express = require('express');
const router = express.Router();
const {
    createMovie,
    getMovies,
    getMovieById,
    getNowShowing,
    getUpcoming,
    getMyMovies,
    deleteMovie
} = require('../controllers/movieController');
const { protect, distributor } = require('../middleware/authMiddleware');

// ========== PUBLIC ROUTES ==========
router.get('/', getMovies);
router.get('/now-showing', getNowShowing);
router.get('/upcoming', getUpcoming);
router.get('/:id', getMovieById);

// ========== PROTECTED ROUTES ==========
router.use(protect);

// Distributor only routes
router.post('/', distributor, createMovie);
router.get('/my/movies', distributor, getMyMovies);
router.delete('/:id', distributor, deleteMovie);

module.exports = router;