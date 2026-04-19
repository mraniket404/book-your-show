import api from './api';

const movieService = {
    // Get all movies
    getMovies: async (params) => {
        const response = await api.get('/movies', { params });
        return response;
    },

    // Get movie by ID
    getMovieById: async (id) => {
        const response = await api.get(`/movies/${id}`);
        return response;
    },

    // Get now showing movies
    getNowShowing: async () => {
        const response = await api.get('/movies/now-showing');
        return response;
    },

    // Get upcoming movies
    getUpcoming: async () => {
        const response = await api.get('/movies/upcoming');
        return response;
    },

    // Create movie (for distributor)
    createMovie: async (data) => {
        const response = await api.post('/movies', data);
        return response;
    },

    // Update movie
    updateMovie: async (id, data) => {
        const response = await api.put(`/movies/${id}`, data);
        return response;
    },

    // Delete movie
    deleteMovie: async (id) => {
        const response = await api.delete(`/movies/${id}`);
        return response;
    }
};

export default movieService;