const express = require('express');
const router = express.Router();
const { getPendingMovies, approveMovie } = require('../controllers/adminMovieController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/pending', getPendingMovies);
router.put('/approve/:id', approveMovie);

module.exports = router;