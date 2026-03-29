import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FaCheckCircle, FaTicketAlt, FaDownload, FaHome, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import bookingService from '../services/bookingService'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

const BookingConfirmation = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await bookingService.getBookingByReference(bookingId)
        setBooking(res.data.data)
      } catch (error) {
        toast.error('Booking not found')
        navigate('/my-bookings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [bookingId])

  const downloadTicket = () => {
    const ticket = `=================================
     BOOK YOUR SHOW - TICKET
=================================

Booking ID: ${booking.bookingReference}
Movie: ${booking.movieId?.title}
Theatre: ${booking.theatreId?.name}
Seats: ${booking.seats?.map(s => s.seatId).join(', ')}
Date: ${new Date(booking.createdAt).toLocaleDateString()}
Total: ₹${booking.totalAmount}

=================================
Thank you for booking!
=================================`
    const blob = new Blob([ticket], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-${booking.bookingReference}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Ticket downloaded!')
  }

  if (loading) return <Loader />
  if (!booking) return <div className="text-center py-12">Booking not found</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <FaCheckCircle className="text-green-500 text-4xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Booking Confirmed!</h1>
        <p className="text-gray-600">Your tickets have been booked successfully</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="bg-[#ff4d2e] p-4 text-white">
          <div className="flex justify-between">
            <FaTicketAlt className="text-2xl" />
            <span>E-Ticket</span>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center border-b pb-4 mb-4">
            <div className="text-2xl font-bold text-[#ff4d2e]">{booking.bookingReference}</div>
            <div className="text-sm text-gray-500">Booking Reference</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Movie</span>
              <span className="font-semibold">{booking.movieId?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Theatre</span>
              <span className="font-semibold">{booking.theatreId?.name}</span>
            </div>
            <div className="flex items-start gap-2">
              <FaMapMarkerAlt className="text-gray-400 mt-1" />
              <span className="text-sm text-gray-600">{booking.theatreId?.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seats</span>
              <span className="font-bold text-lg text-[#ff4d2e]">{booking.seats?.map(s => s.seatId).join(', ')}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="font-bold">Total Amount</span>
                <span className="font-bold text-xl text-[#ff4d2e]">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 text-center border-t">
          <div className="inline-block bg-white p-2 rounded-lg">
            <div className="w-24 h-24 bg-gray-800 mx-auto flex items-center justify-center text-white text-xs rounded">QR Code</div>
            <p className="text-xs text-gray-500 mt-2">Show at the theatre</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={downloadTicket} className="flex-1 btn-outline flex items-center justify-center gap-2">
          <FaDownload /> Download Ticket
        </button>
        <Link to="/" className="flex-1 btn-primary flex items-center justify-center gap-2">
          <FaHome /> Back to Home
        </Link>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-blue-800 mb-2">Important Instructions</h3>
        <ul className="text-sm text-blue-700">
          <li>• Reach theatre 30 minutes before show</li>
          <li>• Carry valid ID proof</li>
          <li>• No refunds on cancelled tickets</li>
        </ul>
      </div>
    </div>
  )
}

export default BookingConfirmation