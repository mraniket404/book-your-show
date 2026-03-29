import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaFilm, FaTicketAlt, FaTheaterMasks } from 'react-icons/fa'
import MovieCard from '../components/MovieCard'
import Loader from '../components/Loader'
import movieService from '../services/movieService'

const Home = () => {
  const [nowShowing, setNowShowing] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [now, up] = await Promise.all([movieService.getNowShowing(), movieService.getUpcoming()])
        setNowShowing(now.data.data)
        setUpcoming(up.data.data)
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <div className="bg-[#ff4d2e] text-white rounded-2xl p-12 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Show</h1>
        <p className="text-xl mb-8">Experience the magic of cinema with just a few clicks</p>
        <Link to="/movies" className="inline-block bg-white text-[#ff4d2e] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">Book Tickets Now</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm"><div className="bg-[#fff1f0] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><FaFilm className="text-[#ff4d2e] text-2xl" /></div><h3 className="font-bold text-lg mb-2">Latest Movies</h3><p className="text-gray-600">Watch the newest releases</p></div>
        <div className="text-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm"><div className="bg-[#fff1f0] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><FaTheaterMasks className="text-[#ff4d2e] text-2xl" /></div><h3 className="font-bold text-lg mb-2">Best Theatres</h3><p className="text-gray-600">Premium cinema halls</p></div>
        <div className="text-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm"><div className="bg-[#fff1f0] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><FaTicketAlt className="text-[#ff4d2e] text-2xl" /></div><h3 className="font-bold text-lg mb-2">Easy Booking</h3><p className="text-gray-600">Quick & secure booking</p></div>
      </div>

      <div className="mb-12"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-[#ff4d2e]">Now Showing</h2><Link to="/movies" className="text-[#ff4d2e] hover:underline">View All</Link></div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">{nowShowing.slice(0,5).map(m => <MovieCard key={m._id} movie={m} />)}</div></div>
      <div><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-[#ff4d2e]">Coming Soon</h2><Link to="/movies" className="text-[#ff4d2e] hover:underline">View All</Link></div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">{upcoming.slice(0,5).map(m => <MovieCard key={m._id} movie={m} />)}</div></div>
    </div>
  )
}

export default Home