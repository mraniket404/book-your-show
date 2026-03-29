const express = require('express');
const router = express.Router();
const {
    getTheatresByCity,
    getTheatreById,
    getTheatreLayout
} = require('../controllers/theatreController');

router.get('/', getTheatresByCity);
router.get('/:id', getTheatreById);
router.get('/:id/layout', getTheatreLayout);

module.exports = router;