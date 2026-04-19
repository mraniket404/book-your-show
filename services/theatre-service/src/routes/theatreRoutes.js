const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createTheatre,
    getMyTheatre,
    updateTheatre,
    deleteTheatre,
    addScreen,
    getScreens,
    getScreenById,
    updateScreen,
    deleteScreen,
    saveSeatLayout,
    getSeatLayout,
    lockSeat,
    unlockSeat,
    bookSeat,
    getAvailableSeats,
    getCities
} = require('../controllers/theatreController');

// Public routes
router.get('/cities', getCities);

// Theatre routes
router.post('/', protect, createTheatre);
router.get('/my-theatre', protect, getMyTheatre);
router.put('/', protect, updateTheatre);
router.delete('/', protect, deleteTheatre);

// Screen routes
router.post('/screens', protect, addScreen);
router.get('/screens', protect, getScreens);
router.get('/screens/:screenId', protect, getScreenById);
router.put('/screens/:screenId', protect, updateScreen);
router.delete('/screens/:screenId', protect, deleteScreen);

// Seat Layout routes
router.post('/screens/:screenId/layout', protect, saveSeatLayout);
router.get('/screens/:screenId/layout', protect, getSeatLayout);

// Seat Booking/Locking routes
router.post('/screens/:screenId/seats/:seatId/lock', protect, lockSeat);
router.post('/screens/:screenId/seats/:seatId/unlock', protect, unlockSeat);
router.post('/screens/:screenId/seats/:seatId/book', protect, bookSeat);
router.get('/screens/:screenId/seats/available', protect, getAvailableSeats);

module.exports = router;