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
import DistributorDashboard from './pages/DistributorDashboard'
import TheatreOwnerDashboard from './pages/TheatreOwnerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { useAuth } from './hooks/useAuth'

// Role-based route guard component
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2e]"></div>
    </div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - No Login Required */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes - Login Required (All authenticated users) */}
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
        
        {/* Distributor Dashboard - Only for distributors */}
        <Route 
          path="distributor/*" 
          element={
            <RoleRoute allowedRoles={['distributor']}>
              <DistributorDashboard />
            </RoleRoute>
          } 
        />
        
        {/* Theatre Owner Dashboard - Only for theatre owners */}
        <Route 
          path="theatre-owner/*" 
          element={
            <RoleRoute allowedRoles={['theatre-owner']}> 
              <TheatreOwnerDashboard />
            </RoleRoute>
          } 
        />
        
        {/* Admin Dashboard - Only for admin */}
        <Route 
          path="admin/*" 
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          } 
        />
      </Route>
      
      {/* Redirect any unknown route to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes