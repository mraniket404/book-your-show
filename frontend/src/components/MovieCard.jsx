import React from 'react'
import { Link } from 'react-router-dom'
import { FaStar, FaClock } from 'react-icons/fa'

const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movies/${movie._id}`} className="card group">
      <div className="relative overflow-hidden">
        <img src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} alt={movie.title} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 px-2 py-1 rounded-lg flex items-center text-sm"><FaStar className="mr-1" />{movie.rating || 'N/A'}</div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate text-gray-800">{movie.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{movie.language}</p>
        <div className="flex items-center text-gray-500 text-sm"><FaClock className="mr-1" />{movie.duration} mins</div>
        {movie.status === 'now-showing' && <span className="inline-block mt-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Now Showing</span>}
      </div>
    </Link>
  )
}

export default MovieCard