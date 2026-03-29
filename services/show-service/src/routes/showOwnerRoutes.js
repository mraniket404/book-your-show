const express = require('express');
const router = express.Router();
const { addShow, getMyShows, updateShow, deleteShow } = require('../controllers/showOwnerController');
const { protect, theatreOwner } = require('../middleware/authMiddleware');

router.use(protect);
router.use(theatreOwner);

router.post('/add', addShow);
router.get('/my-shows', getMyShows);
router.put('/:id', updateShow);
router.delete('/:id', deleteShow);

module.exports = router;