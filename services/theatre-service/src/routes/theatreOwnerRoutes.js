const express = require('express');
const router = express.Router();
const { registerTheatre, getMyTheatres, createSeatLayout, updatePricing, updateSeat } = require('../controllers/theatreOwnerController');
const { protect, theatreOwner } = require('../middleware/authMiddleware');

router.use(protect);
router.use(theatreOwner);

router.post('/register', registerTheatre);
router.get('/my-theatres', getMyTheatres);
router.post('/:theatreId/layout', createSeatLayout);
router.put('/:theatreId/pricing', updatePricing);
router.put('/:theatreId/seats/:seatId', updateSeat);

module.exports = router;