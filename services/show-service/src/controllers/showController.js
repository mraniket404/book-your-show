const Show = require('../models/Show');

// Get shows by theatre
const getShowsByTheatre = async (req, res) => {
    try {
        const { theatreId } = req.params;
        
        console.log('📥 [GET] Shows by theatre:', theatreId);
        
        // ✅ Try-catch for populate to avoid breaking if Movie model not available
        let shows;
        try {
            shows = await Show.find({ theatreId, status: 'active' })
                .populate('movieId', 'title poster language duration')
                .sort({ date: 1, time: 1 });
        } catch (populateError) {
            console.log('⚠️ Populate failed, fetching without populate:', populateError.message);
            shows = await Show.find({ theatreId, status: 'active' })
                .sort({ date: 1, time: 1 });
        }
        
        console.log(`✅ Found ${shows.length} shows for theatre ${theatreId}`);
        
        res.status(200).json({
            success: true,
            data: shows,
            count: shows.length
        });
    } catch (error) {
        console.error('❌ Get shows by theatre error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// Get shows by movie
const getShowsByMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { date } = req.query;
        
        console.log('📥 [GET] Shows by movie:', movieId, 'Date:', date);
        
        let query = { movieId, status: 'active' };
        
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }
        
        let shows;
        try {
            shows = await Show.find(query)
                .populate('movieId', 'title poster language duration')
                .populate('theatreId', 'name address city')
                .sort({ date: 1, time: 1 });
        } catch (populateError) {
            console.log('⚠️ Populate failed, fetching without populate:', populateError.message);
            shows = await Show.find(query).sort({ date: 1, time: 1 });
        }
        
        console.log(`✅ Found ${shows.length} shows for movie ${movieId}`);
        
        res.status(200).json({
            success: true,
            data: shows,
            count: shows.length
        });
    } catch (error) {
        console.error('❌ Get shows by movie error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// Get all shows
const getShows = async (req, res) => {
    try {
        const { movieId, theatreId, date, city } = req.query;
        let query = { status: 'active' };
        
        console.log('📥 [GET] All shows with filters:', { movieId, theatreId, date, city });
        
        if (movieId) query.movieId = movieId;
        if (theatreId) query.theatreId = theatreId;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }
        
        let shows;
        try {
            shows = await Show.find(query)
                .populate('movieId', 'title poster language duration description')
                .populate('theatreId', 'name address city amenities')
                .sort({ date: 1, time: 1 });
        } catch (populateError) {
            console.log('⚠️ Populate failed, fetching without populate:', populateError.message);
            shows = await Show.find(query).sort({ date: 1, time: 1 });
        }
        
        if (city && city !== 'all' && shows[0]?.theatreId) {
            shows = shows.filter(show => 
                show.theatreId?.city?.toLowerCase() === city.toLowerCase()
            );
        }
        
        console.log(`✅ Found ${shows.length} shows`);
        
        res.status(200).json({
            success: true,
            data: shows,
            count: shows.length
        });
    } catch (error) {
        console.error('❌ Get shows error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// Get show by ID
const getShowById = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('📥 [GET] Show by ID:', id);
        
        let show;
        try {
            show = await Show.findById(id)
                .populate('movieId')
                .populate('theatreId');
        } catch (populateError) {
            console.log('⚠️ Populate failed, fetching without populate:', populateError.message);
            show = await Show.findById(id);
        }
        
        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: show
        });
    } catch (error) {
        console.error('❌ Get show by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// Create show
const createShow = async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { movieId, theatreId, screenId, date, time, prices, format, totalSeats } = req.body;
        
        console.log('📝 [POST] Creating show:', { movieId, theatreId, screenId, date, time });
        
        // Validation
        if (!movieId || !theatreId || !screenId || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: movieId, theatreId, screenId, date, time'
            });
        }
        
        // Check if show already exists
        const existingShow = await Show.findOne({
            screenId,
            date: new Date(date),
            time,
            status: 'active'
        });
        
        if (existingShow) {
            return res.status(400).json({
                success: false,
                message: `Show already exists at ${time} on this screen`
            });
        }
        
        // Create show
        const show = new Show({
            movieId,
            theatreId,
            screenId,
            date: new Date(date),
            time,
            prices: {
                normal: prices?.normal || 180,
                premium: prices?.premium || 320,
                recliner: prices?.recliner || 550,
                sofa: prices?.sofa || 450,
                wheelchair: prices?.wheelchair || 180
            },
            format: format || '2D',
            availableSeats: totalSeats || 100,
            totalSeats: totalSeats || 100,
            bookedSeats: [],
            status: 'active'
        });
        
        const savedShow = await show.save();
        
        const duration = Date.now() - startTime;
        console.log(`✅ Show created: ${savedShow._id} at ${time} (${duration}ms)`);
        
        res.status(201).json({
            success: true,
            data: savedShow,
            message: 'Show created successfully',
            duration: `${duration}ms`
        });
        
    } catch (error) {
        console.error('❌ Create show error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// Update show
const updateShow = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        console.log('📝 [PUT] Updating show:', id, updateData);
        
        const show = await Show.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }
        
        console.log(`✅ Show updated: ${show._id}`);
        
        res.status(200).json({
            success: true,
            data: show,
            message: 'Show updated successfully'
        });
    } catch (error) {
        console.error('❌ Update show error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// Delete show
const deleteShow = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('📝 [DELETE] Deleting show:', id);
        
        const show = await Show.findByIdAndDelete(id);
        
        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }
        
        console.log(`✅ Show deleted: ${show._id}`);
        
        res.status(200).json({
            success: true,
            message: 'Show deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete show error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

module.exports = {
    getShows,
    getShowById,
    getShowsByTheatre,
    getShowsByMovie,
    createShow,
    updateShow,
    deleteShow
};