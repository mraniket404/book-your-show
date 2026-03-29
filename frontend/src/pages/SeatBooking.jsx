import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaClock, FaWallet } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Seat from '../components/Seat'
import SeatLegend from '../components/SeatLegend'
import Loader from '../components/Loader'
import showService from '../services/showService'
import bookingService from '../services/bookingService'

const SeatBooking = () => {
  const { showId } = useParams()
  const navigate = useNavigate()
  const [show, setShow] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [heldSeats, setHeldSeats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [showRes, availRes] = await Promise.all([
          showService.getShowById(showId),
          bookingService.getSeatAvailability(showId)
        ])
        setShow(showRes.data.data)
        setHeldSeats(availRes.data.data.held.map(h => h.seatId))
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showId])

  const handleSeatSelect = (seat) => {
    if (selectedSeats.find(s => s.seatId === seat.seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s.seatId !== seat.seatId))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const handleProceed = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }
    try {
      const res = await bookingService.initiateBooking({ showId, seats: selectedSeats })
      toast.success('Seats locked! Complete payment within 3 minutes')
      navigate(`/payment/${res.data.data.bookingId}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to lock seats')
    }
  }

  if (loading) return <Loader />
  if (!show) return <div className="text-center py-12">Show not found</div>

  const total = selectedSeats.reduce((s, seat) => s + seat.price, 0)

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center text-[#ff4d2e] mb-6">
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Select Seats</h2>
            <SeatLegend />
            <div className="relative mb-8">
              <div className="w-full h-2 bg-gray-300 rounded-full"></div>
              <div className="text-center text-gray-500 text-sm mt-2">Screen</div>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-12 gap-2">
                {show.seats?.map(seat => {
                  const isBooked = show.bookedSeats?.includes(seat.seatId)
                  const isHold = heldSeats.includes(seat.seatId)
                  const isSelected = selectedSeats.find(s => s.seatId === seat.seatId)
                  return (
                    <div key={seat.seatId} className="col-span-1">
                      <Seat
                        seat={seat}
                        isSelected={!!isSelected}
                        isBooked={isBooked}
                        isHold={isHold}
                        onSelect={handleSeatSelect}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-600 text-sm">Movie</p>
                <p className="font-semibold">{show.movieId?.title}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Theatre</p>
                <p className="font-semibold">{show.theatreId?.name}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Date & Time</p>
                  <p className="font-semibold">{new Date(show.date).toLocaleDateString()} | {show.time}</p>
                </div>
                <FaClock className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Selected Seats</p>
                {selectedSeats.length === 0 ? (
                  <p className="text-gray-400">No seats selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSeats.map(seat => (
                      <span key={seat.seatId} className="bg-[#fff1f0] text-[#ff4d2e] px-2 py-1 rounded text-sm">
                        {seat.seatId} (₹{seat.price})
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <p className="font-bold text-lg">Total</p>
                  <p className="font-bold text-2xl text-[#ff4d2e]">₹{total}</p>
                </div>
              </div>
            </div>
            <button onClick={handleProceed} className="w-full btn-primary flex items-center justify-center gap-2">
              <FaWallet /> Proceed to Pay
            </button>
            <p className="text-xs text-gray-500 text-center mt-4">Seats will be held for 3 minutes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeatBooking