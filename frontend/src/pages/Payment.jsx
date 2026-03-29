import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaCreditCard, FaGooglePay, FaPaypal, FaArrowLeft, FaLock } from 'react-icons/fa'
import toast from 'react-hot-toast'
import bookingService from '../services/bookingService'
import Loader from '../components/Loader'

const Payment = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [method, setMethod] = useState('card')

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

  const handlePayment = async () => {
    setProcessing(true)
    setTimeout(async () => {
      try {
        await bookingService.confirmBooking({ bookingId: booking._id, paymentId: 'PAY-' + Date.now() })
        toast.success('Payment successful!')
        navigate(`/booking-confirmation/${booking.bookingReference}`)
      } catch (error) {
        toast.error('Payment failed')
        await bookingService.cancelBooking(booking._id)
        navigate('/my-bookings')
      } finally {
        setProcessing(false)
      }
    }, 2000)
  }

  if (loading) return <Loader />
  if (!booking) return <div className="text-center py-12">Booking not found</div>

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-[#ff4d2e] mb-6">
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
          <div className="space-y-3 mb-6">
            <button onClick={() => setMethod('card')} className={`w-full flex items-center gap-3 p-3 border rounded-lg ${method === 'card' ? 'border-[#ff4d2e] bg-[#fff1f0]' : 'border-gray-200'}`}>
              <FaCreditCard className="text-2xl" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Credit/Debit Card</div>
                <div className="text-sm text-gray-500">Visa, Mastercard, RuPay</div>
              </div>
              {method === 'card' && <div className="w-4 h-4 bg-[#ff4d2e] rounded-full"></div>}
            </button>
            <button onClick={() => setMethod('upi')} className={`w-full flex items-center gap-3 p-3 border rounded-lg ${method === 'upi' ? 'border-[#ff4d2e] bg-[#fff1f0]' : 'border-gray-200'}`}>
              <FaGooglePay className="text-2xl" />
              <div className="flex-1 text-left">
                <div className="font-semibold">UPI</div>
                <div className="text-sm text-gray-500">Google Pay, PhonePe, Paytm</div>
              </div>
              {method === 'upi' && <div className="w-4 h-4 bg-[#ff4d2e] rounded-full"></div>}
            </button>
            <button onClick={() => setMethod('netbanking')} className={`w-full flex items-center gap-3 p-3 border rounded-lg ${method === 'netbanking' ? 'border-[#ff4d2e] bg-[#fff1f0]' : 'border-gray-200'}`}>
              <FaPaypal className="text-2xl" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Net Banking</div>
                <div className="text-sm text-gray-500">All major banks</div>
              </div>
              {method === 'netbanking' && <div className="w-4 h-4 bg-[#ff4d2e] rounded-full"></div>}
            </button>
          </div>
          {method === 'card' && (
            <div className="space-y-4">
              <input type="text" placeholder="Card Number" className="input-field" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="MM/YY" className="input-field" />
                <input type="text" placeholder="CVV" className="input-field" />
              </div>
              <input type="text" placeholder="Cardholder Name" className="input-field" />
            </div>
          )}
          {method === 'upi' && (
            <input type="text" placeholder="Enter UPI ID" className="input-field" />
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking Reference</span>
              <span className="font-semibold">{booking.bookingReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Movie</span>
              <span className="font-semibold">{booking.movieId?.title || 'Movie'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Theatre</span>
              <span className="font-semibold">{booking.theatreId?.name || 'Theatre'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seats</span>
              <span className="font-semibold text-[#ff4d2e]">{booking.seats?.map(s => s.seatId).join(', ')}</span>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-2xl font-bold text-[#ff4d2e]">₹{booking.totalAmount}</span>
            </div>
            <button onClick={handlePayment} disabled={processing} className="w-full btn-primary flex items-center justify-center gap-2">
              {processing ? 'Processing...' : <><FaLock /> Pay ₹{booking.totalAmount}</>}
            </button>
            <p className="text-xs text-gray-500 text-center mt-4">Secure payment gateway</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment