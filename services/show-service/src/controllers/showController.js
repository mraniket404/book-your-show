const Show = require('../models/Show');
const axios = require('axios');

const getShows = async (req, res) => {
    try {
        const { movieId, city, date, theatreId } = req.query;
        
        if (!movieId || !city) {
            return res.status(400).json({ success: false, message: 'Movie ID and City are required' });
        }
        
        // Get theatres in city from theatre service
        const theatreResponse = await axios.get(`${process.env.THEATRE_SERVICE_URL}/mraniket404/api/theatre?city=${city}`);
        const theatres = theatreResponse.data.data;
        const theatreIds = theatres.map(t => t._id);
        
        let query = { movieId, theatreId: { $in: theatreIds }, status: 'active' };
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59);
            query.date = { $gte: startDate, $lte: endDate };
        }
        if (theatreId) query.theatreId = theatreId;
        
        const shows = await Show.find(query).sort({ date: 1, time: 1 });
        
        const groupedShows = {};
        shows.forEach(show => {
            const theatre = theatres.find(t => t._id === show.theatreId.toString());
            if (theatre) {
                if (!groupedShows[show.theatreId]) {
                    groupedShows[show.theatreId] = { theatre, shows: [] };
                }
                groupedShows[show.theatreId].shows.push(show);
            }
        });
        
        res.status(200).json({ success: true, count: shows.length, data: Object.values(groupedShows) });
    } catch (error) {
        console.error('Get shows error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getShowById = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id);
        if (!show) {
            return res.status(404).json({ success: false, message: 'Show not found' });
        }
        
        // Get theatre details
        const theatreResponse = await axios.get(`${process.env.THEATRE_SERVICE_URL}/mraniket404/api/theatre/${show.theatreId}/layout`);
        const theatre = theatreResponse.data.data;
        
        // Get movie details
        const movieResponse = await axios.get(`${process.env.MOVIE_SERVICE_URL}/mraniket404/api/movies/${show.movieId}`);
        const movie = movieResponse.data.data;
        
        const seats = theatre.seatLayout?.seats?.map(seat => ({
            ...seat,
            isBooked: show.bookedSeats.includes(seat.seatId),
            isAvailable: !show.bookedSeats.includes(seat.seatId) && show.status === 'active'
        })) || [];
        
        res.status(200).json({
            success: true,
            data: {
                ...show.toObject(),
                movieId: movie,
                theatreId: theatre,
                seats,
                availableSeats: show.availableSeats
            }
        });
    } catch (error) {
        console.error('Get show error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getShows, getShowById };