import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaClock, FaChair, FaCalendarAlt } from 'react-icons/fa'
import showService from '../services/showService'
import movieService from '../services/movieService'
import { useCity } from '../hooks/useCity'
import Loader from '../components/Loader'

const TheatreSelection = () => {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const { selectedCity } = useCity()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [movieRes, showsRes] = await Promise.all([movieService.getMovieById(movieId), showService.getShows({ movieId, city: selectedCity, date: selectedDate })])
        setMovie(movieRes.data.data)
        setShows(showsRes.data.data)
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    load()
  }, [movieId, selectedCity, selectedDate])

  const getDates = () => { const dates = []; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() + i); dates.push(d.toISOString().split('T')[0]); } return dates; }

  if (loading) return <Loader />

  return (
    <div>
      {movie && <div className="bg-gradient-to-r from-[#ff4d2e] to-[#e63e1f] text-white rounded-2xl p-6 mb-8"><div className="flex items-center gap-4"><img src={movie.poster || 'https://via.placeholder.com/80x120'} alt={movie.title} className="w-20 h-28 object-cover rounded-lg" /><div><h1 className="text-2xl font-bold">{movie.title}</h1><p>{movie.language} | {movie.duration} mins</p><div className="flex items-center gap-2 mt-2"><FaMapMarkerAlt /><span>{selectedCity}</span></div></div></div></div>}
      <div className="mb-8"><h2 className="text-lg font-semibold mb-3">Select Date</h2><div className="flex gap-3 overflow-x-auto pb-2">{getDates().map(date => (<button key={date} onClick={() => setSelectedDate(date)} className={`px-4 py-2 rounded-lg whitespace-nowrap ${selectedDate === date ? 'bg-[#ff4d2e] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}><div className="text-sm font-semibold">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div><div className="text-xs">{new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div></button>))}</div></div>
      {shows.length === 0 ? <div className="text-center py-12 bg-white border border-gray-200 rounded-xl"><p className="text-gray-500">No shows available</p></div> : <div className="space-y-6">{shows.map((group, idx) => (<div key={idx} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"><div className="bg-gray-50 px-6 py-4 border-b"><div className="flex justify-between"><div><h3 className="text-xl font-bold">{group.theatre.name}</h3><p className="text-gray-600 text-sm">{group.theatre.address}</p></div><div className="flex gap-2">{group.theatre.amenities?.slice(0,3).map((a,i)=><span key={i} className="text-xs bg-gray-200 px-2 py-1 rounded">{a}</span>)}</div></div></div><div className="p-6"><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">{group.shows.map(show => (<button key={show._id} onClick={() => navigate(`/seat-booking/${show._id}`)} className="border-2 border-[#ff4d2e] hover:bg-[#ff4d2e] hover:text-white rounded-lg p-3 transition text-center"><div className="font-bold text-lg">{show.time}</div><div className="text-xs mt-1">{show.format}</div><div className="text-xs mt-1 flex items-center justify-center gap-1"><FaChair /><span>{show.availableSeats} seats</span></div></button>))}</div></div></div>))}</div>}
    </div>
  )
}

export default TheatreSelection