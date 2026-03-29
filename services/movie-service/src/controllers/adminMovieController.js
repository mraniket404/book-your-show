const Movie = require('../models/Movie');

const getPendingMovies = async (req, res) => {
    try {
        const movies = await Movie.find({ status: 'pending' })
            .populate('distributorId', 'name email companyName')
            .sort({ createdAt: 1 });
        res.status(200).json({ success: true, count: movies.length, data: movies });
    } catch (error) {
        console.error('Get pending movies error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const approveMovie = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }
        
        movie.status = status;
        movie.approvedBy = req.user.id;
        if (status === 'rejected') {
            movie.rejectionReason = rejectionReason;
        }
        
        await movie.save();
        
        res.status(200).json({
            success: true,
            message: `Movie ${status}`,
            data: movie
        });
    } catch (error) {
        console.error('Approve movie error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getPendingMovies, approveMovie };