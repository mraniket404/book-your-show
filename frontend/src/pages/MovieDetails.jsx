import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaStar, FaClock, FaCalendarAlt, FaLanguage, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa'
import movieService from '../services/movieService'
import showService from '../services/showService'
import Loader from '../components/Loader'
import { useCity } from '../hooks/useCity'

const MovieDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedCity, setSelectedCity, cities } = useCity()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  // Get next 7 days
  const getNext7Days = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [movieRes, showsRes] = await Promise.all([
          movieService.getMovieById(id),
          showService.getShows({ movieId: id, date: selectedDate })
        ])
        setMovie(movieRes.data.data)
        
        // Filter shows by selected city
        let filteredShows = showsRes.data.data || []
        if (selectedCity && selectedCity !== 'all') {
          filteredShows = filteredShows.filter(show => 
            show.theatreId?.city?.toLowerCase() === selectedCity.toLowerCase()
          )
        }
        
        setShows(filteredShows)
      } catch (error) {
        console.error('Error loading movie details:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, selectedCity, selectedDate])

  // Group shows by theatre
  const groupedShows = shows.reduce((acc, show) => {
    const theatreId = show.theatreId?._id
    if (!theatreId) return acc
    
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatreId,
        shows: []
      }
    }
    acc[theatreId].shows.push(show)
    return acc
  }, {})

  if (loading) return <Loader />
  if (!movie) return <div className="text-center py-12">Movie not found</div>

  return (
    <div>
      {/* Movie Banner - Like BookMyShow */}
      <div className="relative bg-gradient-to-r from-[#ff4d2e] to-[#e63e1f] text-white rounded-2xl overflow-hidden mb-6">
        <div className="flex flex-col md:flex-row p-6 md:p-8">
          <img 
            src={movie.poster || 'https://via.placeholder.com/300x450'} 
            alt={movie.title} 
            className="w-40 h-56 md:w-56 md:h-80 object-cover rounded-lg shadow-xl mx-auto md:mx-0" 
          />
          <div className="flex-1 md:ml-8 mt-4 md:mt-0 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                <FaStar className="text-yellow-400" />
                <span>{movie.rating || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                <FaClock />
                <span>{movie.duration} mins</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                <FaLanguage />
                <span>{movie.language}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                <FaCalendarAlt />
                <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '2024'}</span>
              </div>
            </div>
            <p className="text-white/90 text-sm md:text-base mb-4 line-clamp-3">{movie.description}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {movie.genre?.slice(0, 4).map(g => (
                <span key={g} className="bg-white/20 px-3 py-1 rounded-full text-xs">{g}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {getNext7Days().map(date => {
            const dateObj = new Date(date)
            const isToday = date === new Date().toISOString().split('T')[0]
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-center transition-all min-w-[80px]
                  ${selectedDate === date 
                    ? 'bg-[#ff4d2e] text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-[#ff4d2e]'
                  }`}
              >
                <div className="text-xs font-medium">
                  {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">
                  {dateObj.getDate()}
                </div>
                <div className="text-xs">
                  {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                </div>
                {isToday && <div className="text-[10px] mt-1">Today</div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* City Selector - Like BookMyShow */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <button 
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium hover:border-[#ff4d2e] transition"
          >
            <FaMapMarkerAlt className="text-[#ff4d2e]" />
            <span>{selectedCity === 'all' ? 'All Cities' : selectedCity || 'Select City'}</span>
            <FaChevronDown className={`text-gray-400 text-xs transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showCityDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
              <button
                onClick={() => {
                  setSelectedCity('all')
                  setShowCityDropdown(false)
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
              >
                All Cities
              </button>
              {cities?.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city)
                    setShowCityDropdown(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {Object.keys(groupedShows).length} theatres • {shows.length} shows
        </div>
      </div>

      {/* Shows List */}
      {Object.keys(groupedShows).length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Shows Available</h3>
          <p className="text-gray-500">
            {selectedCity && selectedCity !== 'all' 
              ? `No shows in ${selectedCity}. Try selecting a different city.`
              : 'No shows have been added for this movie yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(groupedShows).map((group, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="bg-gray-50 px-5 py-3 border-b">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{group.theatre?.name}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <FaMapMarkerAlt className="text-xs" /> 
                      {group.theatre?.address}, {group.theatre?.city}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {group.theatre?.amenities?.slice(0, 3).map((a, i) => (
                      <span key={i} className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {group.shows.map(show => (
                    <button
                      key={show._id}
                      onClick={() => navigate(`/seat-booking/${show._id}`)}
                      className="border-2 border-[#ff4d2e] hover:bg-[#ff4d2e] hover:text-white rounded-lg py-3 px-2 transition text-center group"
                    >
                      <div className="font-bold text-base">{show.time}</div>
                      <div className="text-xs mt-1 opacity-80">{show.format}</div>
                      <div className="text-xs mt-1 flex items-center justify-center gap-1">
                        <span>🎫</span>
                        <span>{show.availableSeats} left</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MovieDetails