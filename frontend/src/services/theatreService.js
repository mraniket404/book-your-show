import api from './api';

const theatreService = {
    // Get all cities
    getCities: async () => {
        const response = await api.get('/theatre/cities');
        return response;
    },

    // Create theatre
    createTheatre: async (data) => {
        const response = await api.post('/theatre', data);
        return response;
    },

    // Get my theatre
    getMyTheatre: async () => {
        const response = await api.get('/theatre/my-theatre');
        return response;
    },

    // Update theatre
    updateTheatre: async (data) => {
        const response = await api.put('/theatre', data);
        return response;
    },

    // Delete theatre
    deleteTheatre: async () => {
        const response = await api.delete('/theatre');
        return response;
    },

    // ✅ FIXED: Add screen (no theatreId parameter)
    addScreen: async (screenData) => {
        const response = await api.post('/theatre/screens', screenData);
        return response;
    },

    // Get screens
    getScreens: async () => {
        const response = await api.get('/theatre/screens');
        return response;
    },

    // Update screen
    updateScreen: async (screenId, data) => {
        const response = await api.put(`/theatre/screens/${screenId}`, data);
        return response;
    },

    // Delete screen
    deleteScreen: async (screenId) => {
        const response = await api.delete(`/theatre/screens/${screenId}`);
        return response;
    },

    // Save seat layout
    saveSeatLayout: async (screenId, layoutData) => {
        const response = await api.post(`/theatre/screens/${screenId}/layout`, layoutData);
        return response;
    },

    // Get seat layout
    getSeatLayout: async (screenId) => {
        const response = await api.get(`/theatre/screens/${screenId}/layout`);
        return response;
    }
};

export default theatreService;