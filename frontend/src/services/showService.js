import api from './api'

const showService = {
  getShows: (params) => api.get('/shows', { params }),
  getShowById: (id) => api.get(`/shows/${id}`),
  getShowsByTheatre: (theatreId, date) => api.get(`/shows/theatre/${theatreId}`, { params: { date } })
}

export default showService