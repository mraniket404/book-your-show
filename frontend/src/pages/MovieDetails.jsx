import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaStar, FaClock, FaCalendarAlt, FaLanguage } from 'react-icons/fa'
import movieService from '../services/movieService'
import showService from '../services/showService'
import Loader from '../components/Loader'
import { useCity } from '../hooks/useCity'

const MovieDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedCity } = useCity()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [movieRes, showsRes] = await Promise.all([
          movieService.getMovieById(id),
          showService.getShows({ movieId: id, city: selectedCity })
        ])
        setMovie(movieRes.data.data)
        setShows(showsRes.data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, selectedCity])

  if (loading) return <Loader />
  if (!movie) return <div className="text-center py-12">Movie not found</div>

  return (
    <div>
      <div className="bg-gradient-to-r from-[#ff4d2e] to-[#e63e1f] text-white rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <img src={movie.poster || 'https://via.placeholder.com/300x450'} alt={movie.title} className="w-64 h-96 object-cover rounded-lg shadow-xl" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                <FaStar className="text-yellow-400" />
                <span>{movie.rating || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                <FaClock />
                <span>{movie.duration} mins</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                <FaLanguage />
                <span>{movie.language}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                <FaCalendarAlt />
                <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="text-white/90 mb-4">{movie.description}</p>
            <div className="flex flex-wrap gap-2">
              {movie.genre?.map(g => (
                <span key={g} className="bg-white/20 px-3 py-1 rounded-full text-sm">{g}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[#ff4d2e] mb-6">Show Times in {selectedCity}</h2>
      {shows.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-500">No shows available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {shows.map((group, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{group.theatre.name}</h3>
                  <p className="text-gray-600 text-sm">{group.theatre.address}</p>
                </div>
                <div className="flex gap-2">
                  {group.theatre.amenities?.slice(0, 3).map((a, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{a}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {group.shows.map(show => (
                  <button
                    key={show._id}
                    onClick={() => navigate(`/seat-booking/${show._id}`)}
                    className="border-2 border-[#ff4d2e] text-[#ff4d2e] hover:bg-[#ff4d2e] hover:text-white px-4 py-2 rounded-lg transition"
                  >
                    <div className="font-semibold">{show.time}</div>
                    <div className="text-xs">{show.format}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MovieDetails