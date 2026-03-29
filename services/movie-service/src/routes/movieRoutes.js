const express = require('express');
const router = express.Router();
const { getMovies, getMovieById, getNowShowing, getUpcoming } = require('../controllers/movieController');

router.get('/', getMovies);
router.get('/now-showing', getNowShowing);
router.get('/upcoming', getUpcoming);
router.get('/:id', getMovieById);

module.exports = router;