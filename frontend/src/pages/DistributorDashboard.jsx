import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaFilm, FaUpload, FaChartLine, FaDollarSign, FaCalendarAlt, FaClock, FaStar, FaLanguage } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'
import movieService from '../services/movieService'
import { useAuth } from '../hooks/useAuth'

const DistributorDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [movies, setMovies] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    duration: '',
    language: '',
    genre: '',
    releaseDate: '',
    poster: '',
    trailer: '',
    status: 'upcoming'
  })

  useEffect(() => {
    loadMovies()
  }, [])

  const loadMovies = async () => {
    setLoading(true)
    try {
      const res = await movieService.getMovies()
      console.log('Movies loaded:', res.data)
      if (res.data.success) {
        setMovies(res.data.data)
      }
    } catch (error) {
      console.error('Error loading movies:', error)
      toast.error('Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMovieForm({ ...movieForm, [name]: value })
  }

  const handleAddMovie = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Prepare data for API
    const movieData = {
      title: movieForm.title,
      description: movieForm.description,
      duration: parseInt(movieForm.duration),
      language: movieForm.language,
      genre: movieForm.genre.split(',').map(g => g.trim()),
      releaseDate: movieForm.releaseDate,
      poster: movieForm.poster || 'https://via.placeholder.com/300x450?text=No+Poster',
      trailer: movieForm.trailer || '',
      status: movieForm.status
    }
    
    console.log('Submitting movie:', movieData)
    
    try {
      const res = await movieService.createMovie(movieData)
      console.log('Response:', res.data)
      
      if (res.data.success) {
        toast.success('Movie added successfully!')
        setMovieForm({
          title: '',
          description: '',
          duration: '',
          language: '',
          genre: '',
          releaseDate: '',
          poster: '',
          trailer: '',
          status: 'upcoming'
        })
        setShowAddForm(false)
        await loadMovies()
      } else {
        toast.error(res.data.message || 'Failed to add movie')
      }
    } catch (error) {
      console.error('Add movie error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add movie'
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await movieService.deleteMovie(movieId)
        toast.success('Movie deleted successfully')
        await loadMovies()
      } catch (error) {
        console.error('Delete movie error:', error)
        toast.error('Failed to delete movie')
      }
    }
  }

  const getStatusColor = (status) => {
    if (status === 'now-showing') return 'bg-green-100 text-green-600'
    if (status === 'upcoming') return 'bg-yellow-100 text-yellow-600'
    return 'bg-gray-100 text-gray-600'
  }

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#ff4d2e]">Distributor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
          <p className="text-sm text-gray-500 mt-1">Add movies that theatre owners can use to create shows</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#ff4d2e] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#e63e1f] transition flex items-center gap-2"
        >
          <FaPlus /> Add New Movie
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaFilm className="text-blue-600 text-xl mt-1" />
          <div>
            <h4 className="font-semibold text-blue-800">Your Role as a Distributor</h4>
            <p className="text-blue-700 text-sm">
              You add movies to the platform. Theatre owners will then add shows for your movies.
            </p>
            <p className="text-blue-700 text-sm mt-1">
              <strong>Important:</strong> Theatre owners cannot add shows until you add movies!
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Movies</p>
              <p className="text-3xl font-bold text-[#ff4d2e]">{movies.length}</p>
            </div>
            <FaFilm className="text-4xl text-gray-300" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Now Showing</p>
              <p className="text-3xl font-bold text-green-600">{movies.filter(m => m.status === 'now-showing').length}</p>
            </div>
            <FaChartLine className="text-4xl text-gray-300" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Upcoming</p>
              <p className="text-3xl font-bold text-yellow-600">{movies.filter(m => m.status === 'upcoming').length}</p>
            </div>
            <FaDollarSign className="text-4xl text-gray-300" />
          </div>
        </div>
      </div>

      {/* Add Movie Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#ff4d2e]">Add New Movie</h2>
          <form onSubmit={handleAddMovie} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Movie Title *</label>
                <input
                  type="text"
                  name="title"
                  value={movieForm.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                  placeholder="e.g., Pathaan, Jawan, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Duration (minutes) *</label>
                <input
                  type="number"
                  name="duration"
                  value={movieForm.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                  placeholder="150"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Language *</label>
                <input
                  type="text"
                  name="language"
                  value={movieForm.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                  placeholder="Hindi, Tamil, Telugu, English"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Genre *</label>
                <input
                  type="text"
                  name="genre"
                  value={movieForm.genre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                  placeholder="Action, Drama, Comedy (comma separated)"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Release Date *</label>
                <input
                  type="date"
                  name="releaseDate"
                  value={movieForm.releaseDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Status *</label>
                <select
                  name="status"
                  value={movieForm.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                  required
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="now-showing">Now Showing</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-semibold">Description *</label>
                <textarea
                  name="description"
                  value={movieForm.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                  rows="4"
                  placeholder="Movie description, story, cast, etc."
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-semibold">Poster URL</label>
                <input
                  type="url"
                  name="poster"
                  value={movieForm.poster}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                  placeholder="https://example.com/poster.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for default poster</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-semibold">Trailer URL (YouTube)</label>
                <input
                  type="url"
                  name="trailer"
                  value={movieForm.trailer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                className="bg-[#ff4d2e] text-white px-6 py-2 rounded-lg hover:bg-[#e63e1f] transition flex items-center gap-2"
                disabled={submitting}
              >
                <FaUpload /> {submitting ? 'Adding...' : 'Add Movie'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Movies List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Movies</h2>
        {movies.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <FaFilm className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No movies added yet</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="mt-4 btn-primary inline-flex items-center gap-2"
            >
              <FaPlus /> Add Your First Movie
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map(movie => (
              <div key={movie._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                <img
                  src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{movie.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(movie.status)}`}>
                      {movie.status === 'now-showing' ? 'Now Showing' : 'Upcoming'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1"><FaClock /> {movie.duration} mins</span>
                    <span className="flex items-center gap-1"><FaLanguage /> {movie.language}</span>
                    <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(movie.releaseDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{movie.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {movie.genre?.map((g, i) => ( 
                      <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{g}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Added: {new Date(movie.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDeleteMovie(movie._id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DistributorDashboard