import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import TheatreSelection from './pages/TheatreSelection'
import SeatBooking from './pages/SeatBooking'
import Payment from './pages/Payment'
import BookingConfirmation from './pages/BookingConfirmation'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - No Login Required */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes - Login Required */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="movies" element={<Movies />} />
        <Route path="movies/:id" element={<MovieDetails />} />
        <Route path="theatre-selection/:movieId" element={<TheatreSelection />} />
        <Route path="seat-booking/:showId" element={<SeatBooking />} />
        <Route path="payment/:bookingId" element={<Payment />} />
        <Route path="booking-confirmation/:bookingId" element={<BookingConfirmation />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Redirect any unknown route to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes