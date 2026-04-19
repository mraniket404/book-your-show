import React, { useState, useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import Loader from '../components/Loader'
import movieService from '../services/movieService'
import { useCity } from '../hooks/useCity'

const Movies = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('now-showing')
  const [search, setSearch] = useState('')
  const { selectedCity } = useCity()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        let params = {}
        if (filter === 'now-showing') params.status = 'now-showing'
        if (filter === 'upcoming') params.status = 'upcoming'
        if (search) params.search = search
        
        const res = await movieService.getMovies(params)
        let moviesList = res.data.data || []
        
        // Filter movies that have shows in selected city
        if (selectedCity && selectedCity !== 'all') {
          // You can add logic to filter movies by city
        }
        
        setMovies(moviesList)
      } catch (error) { 
        console.error(error) 
      } finally { 
        setLoading(false) 
      }
    }
    load()
  }, [filter, search, selectedCity])

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#ff4d2e]">Movies</h1>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search movies..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="px-4 py-2 border border-gray-300 rounded-lg w-48 md:w-64"
          />
        </div>
      </div>
      
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        <button 
          onClick={() => setFilter('now-showing')} 
          className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition ${filter === 'now-showing' ? 'bg-[#ff4d2e] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Now Showing
        </button>
        <button 
          onClick={() => setFilter('upcoming')} 
          className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition ${filter === 'upcoming' ? 'bg-[#ff4d2e] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Upcoming
        </button>
      </div>
      
      {movies.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-500">No movies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {movies.map(m => <MovieCard key={m._id} movie={m} />)}
        </div>
      )}
    </div>
  )
}

export default Movies