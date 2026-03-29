import React, { useState, useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import Loader from '../components/Loader'
import movieService from '../services/movieService'
import { useCity } from '../hooks/useCity'

const Movies = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { selectedCity } = useCity()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        let params = { city: selectedCity }
        if (filter === 'now-showing') params.status = 'now-showing'
        if (filter === 'upcoming') params.status = 'upcoming'
        if (search) params.search = search
        const res = await movieService.getMovies(params)
        setMovies(res.data.data)
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    load()
  }, [filter, selectedCity, search])

  if (loading) return <Loader />

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#ff4d2e] mb-8">Movies in {selectedCity}</h1>
      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-[#ff4d2e] text-white' : 'bg-gray-200 text-gray-700'}`}>All Movies</button>
        <button onClick={() => setFilter('now-showing')} className={`px-4 py-2 rounded-lg ${filter === 'now-showing' ? 'bg-[#ff4d2e] text-white' : 'bg-gray-200 text-gray-700'}`}>Now Showing</button>
        <button onClick={() => setFilter('upcoming')} className={`px-4 py-2 rounded-lg ${filter === 'upcoming' ? 'bg-[#ff4d2e] text-white' : 'bg-gray-200 text-gray-700'}`}>Upcoming</button>
        <div className="flex-1 flex gap-2"><input type="text" placeholder="Search movies..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field flex-1" /><button onClick={() => setSearch(search)} className="btn-outline">Search</button></div>
      </div>
      {movies.length === 0 ? <div className="text-center py-12"><p className="text-gray-500">No movies found</p></div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">{movies.map(m => <MovieCard key={m._id} movie={m} />)}</div>}
    </div>
  )
}

export default Movies