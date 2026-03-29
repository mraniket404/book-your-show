import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/mraniket404/api';

const theatreService = {
    // Get all cities
    getCities: async () => {
        try {
            console.log('📍 Fetching cities from:', `${API_URL}/theatre/cities`);
            const response = await api.get('/theatre/cities');
            return response.data;
        } catch (error) {
            console.error('Error fetching cities:', error);
            // Return mock data if service is not available
            return {
                success: true,
                data: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']
            };
        }
    },

    // Get theatres by city
    getTheatresByCity: async (city) => {
        try {
            const response = await api.get(`/theatre/city/${city}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching theatres:', error);
            return { success: false, data: [] };
        }
    },

    // Get theatre by ID
    getTheatreById: async (id) => {
        try {
            const response = await api.get(`/theatre/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching theatre:', error);
            throw error;
        }
    }
};

export default theatreService;