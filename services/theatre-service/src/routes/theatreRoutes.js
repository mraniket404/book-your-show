const express = require('express');
const router = express.Router();
const { getTheatresByCity, getTheatreById, getTheatreLayout, getCities } = require('../controllers/theatreController');

router.get('/', getTheatresByCity);
router.get('/cities', getCities);
router.get('/:id', getTheatreById);
router.get('/:id/layout', getTheatreLayout);

module.exports = router;