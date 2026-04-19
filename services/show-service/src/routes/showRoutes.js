const express = require('express');
const router = express.Router();
const {
    getShows,
    getShowById,
    getShowsByTheatre,
    getShowsByMovie,
    createShow,
    updateShow,
    deleteShow
} = require('../controllers/showController');
const { protect, isTheatreOwner } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getShows);
router.get('/movie/:movieId', getShowsByMovie);
router.get('/:id', getShowById);
router.get('/theatre/:theatreId', getShowsByTheatre);

// Protected routes (Theatre Owner only)
router.post('/', protect, isTheatreOwner, createShow);
router.put('/:id', protect, isTheatreOwner, updateShow);
router.delete('/:id', protect, isTheatreOwner, deleteShow);

module.exports = router;