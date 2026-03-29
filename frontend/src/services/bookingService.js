import api from './api'

const bookingService = {
  initiateBooking: (data) => api.post('/bookings/initiate', data),
  confirmBooking: (data) => api.post('/bookings/confirm', data),
  cancelBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBookingByReference: (reference) => api.get(`/bookings/reference/${reference}`),
  getSeatAvailability: (showId) => api.get(`/bookings/availability/${showId}`)
}

export default bookingService