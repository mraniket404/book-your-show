import api from './api'

const movieService = {
  getMovies: (params) => api.get('/movies', { params }),
  getMovieById: (id) => api.get(`/movies/${id}`),
  getNowShowing: () => api.get('/movies/now-showing'),
  getUpcoming: () => api.get('/movies/upcoming')
}

export default movieService