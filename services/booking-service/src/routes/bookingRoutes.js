const express = require('express');
const router = express.Router();
const { initiateBooking, confirmBooking, cancelBooking, getUserBookings, getBookingByReference, getSeatAvailability } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/initiate', initiateBooking);
router.post('/confirm', confirmBooking);
router.delete('/:bookingId', cancelBooking);
router.get('/my-bookings', getUserBookings);
router.get('/reference/:reference', getBookingByReference);
router.get('/availability/:showId', getSeatAvailability);

module.exports = router;