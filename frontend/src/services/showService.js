import api from './api';

const showService = {
    // Get all shows
    getShows: async (params) => {
        try {
            const response = await api.get('/shows', { params });
            return response;
        } catch (error) {
            console.error('getShows error:', error);
            throw error;
        }
    },

    // Get show by ID
    getShowById: async (id) => {
        try {
            const response = await api.get(`/shows/${id}`);
            return response;
        } catch (error) {
            console.error('getShowById error:', error);
            throw error;
        }
    },

    // Get shows by theatre
    getShowsByTheatre: async (theatreId, date) => {
        try {
            const params = date ? { date } : {};
            const response = await api.get(`/shows/theatre/${theatreId}`, { params });
            return response;
        } catch (error) {
            console.error('getShowsByTheatre error:', error);
            throw error;
        }
    },

    // Create show with retry logic
    createShow: async (data, retryCount = 0) => {
        try {
            console.log('📝 Creating show:', { movieId: data.movieId, theatreId: data.theatreId, screenId: data.screenId, date: data.date, time: data.time });
            const response = await api.post('/shows', data);
            return response;
        } catch (error) {
            if (error.message?.includes('timeout') && retryCount < 2) {
                console.log(`⏳ Retrying... (${retryCount + 1}/2)`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                return showService.createShow(data, retryCount + 1);
            }
            console.error('createShow error:', error);
            throw error;
        }
    },

    // Update show
    updateShow: async (id, data) => {
        try {
            const response = await api.put(`/shows/${id}`, data);
            return response;
        } catch (error) {
            console.error('updateShow error:', error);
            throw error;
        }
    },

    // Delete show
    deleteShow: async (id) => {
        try {
            const response = await api.delete(`/shows/${id}`);
            return response;
        } catch (error) {
            console.error('deleteShow error:', error);
            throw error;
        }
    },

    // Get available seats
    getAvailableSeats: async (showId) => {
        try {
            const response = await api.get(`/shows/${showId}/seats`);
            return response;
        } catch (error) {
            console.error('getAvailableSeats error:', error);
            throw error;
        }
    }
};

export default showService;