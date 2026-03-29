const express = require('express');
const router = express.Router();
const {
    registerTheatre,
    getMyTheatres,
    createCustomLayout,
    updateSeats,
    updateTheatre,
    getLayoutForEdit,
    addShow
} = require('../controllers/theatreOwnerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/register', registerTheatre);
router.get('/my-theatres', getMyTheatres);
router.get('/:theatreId/layout/edit', getLayoutForEdit);
router.post('/:theatreId/layout', createCustomLayout);
router.put('/:theatreId/seats', updateSeats);
router.put('/:theatreId', updateTheatre);
router.post('/:theatreId/shows', addShow);

module.exports = router;