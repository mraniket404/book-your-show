import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaTicketAlt, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import bookingService from '../services/bookingService'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await bookingService.getMyBookings()
        setBookings(res.data.data)
      } catch (error) {
        toast.error('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getStatusColor = (s) => {
    if (s === 'confirmed') return 'text-green-600 bg-green-100'
    if (s === 'pending') return 'text-yellow-600 bg-yellow-100'
    if (s === 'cancelled') return 'text-red-600 bg-red-100'
    return 'text-gray-600 bg-gray-100'
  }

  if (loading) return <Loader />

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#ff4d2e] mb-8">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Bookings Yet</h3>
          <Link to="/movies" className="inline-block bg-[#ff4d2e] text-white px-6 py-2 rounded-lg">Browse Movies</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b._id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xl font-bold">{b.movieId?.title}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(b.status)}`}>
                      {b.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FaTicketAlt className="text-[#ff4d2e]" />
                      <span>ID: {b.bookingReference}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-[#ff4d2e]" />
                      <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-[#ff4d2e]" />
                      <span>{b.showTime || 'Show Time'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-[#ff4d2e]" />
                      <span>{b.theatreId?.name}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.seats?.map(s => (
                      <span key={s.seatId} className="bg-[#fff1f0] text-[#ff4d2e] px-3 py-1 rounded-lg text-sm font-semibold">
                        {s.seatId}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#ff4d2e]">₹{b.totalAmount}</div>
                  {b.status === 'confirmed' && (
                    <Link to={`/booking-confirmation/${b.bookingReference}`} className="inline-block mt-2 text-[#ff4d2e] hover:underline text-sm">
                      View Ticket
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings