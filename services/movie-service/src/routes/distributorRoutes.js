const express = require('express');
const router = express.Router();
const { addMovie, getMyMovies, updateMovie, deleteMovie } = require('../controllers/distributorController');
const { protect, distributor } = require('../middleware/authMiddleware');

router.use(protect);
router.use(distributor);

router.post('/add', addMovie);
router.get('/my-movies', getMyMovies);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

module.exports = router;