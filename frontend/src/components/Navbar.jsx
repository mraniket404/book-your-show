import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaFilm, FaUser, FaTicketAlt, FaSignOutAlt, FaBars, FaTimes, FaMapMarkerAlt } from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth'
import { useCity } from '../hooks/useCity'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { selectedCity, setSelectedCity, cities } = useCity()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  
  const userDropdownRef = useRef(null)
  const cityDropdownRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setShowUserDropdown(false)
    setIsMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
            <FaFilm className="text-[#ff4d2e]" />
            <span className="hidden sm:inline text-[#ff4d2e]">BookYourShow</span>
            <span className="sm:hidden text-[#ff4d2e]">BYS</span>
          </Link>

          {/* City Selector */}
          <div className="relative" ref={cityDropdownRef}>
            <button 
              onClick={() => setShowCityDropdown(!showCityDropdown)} 
              className="flex items-center space-x-2 border border-[#ff4d2e] text-[#ff4d2e] px-3 py-1.5 rounded-lg hover:bg-[#fff1f0] transition"
            >
              <FaMapMarkerAlt className="text-[#ff4d2e]" />
              <span className="text-sm">{selectedCity}</span>
            </button>
            
            {showCityDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {cities.map(city => (
                  <button 
                    key={city} 
                    onClick={() => { 
                      setSelectedCity(city); 
                      setShowCityDropdown(false);
                      // Optional: reload movies for new city
                      window.location.reload();
                    }} 
                    className={`block w-full text-left px-4 py-2 hover:bg-[#fff1f0] transition ${
                      selectedCity === city ? 'text-[#ff4d2e] bg-[#fff1f0] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/movies" className="text-gray-700 hover:text-[#ff4d2e] transition">
              Movies
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/my-bookings" className="flex items-center space-x-1 text-gray-700 hover:text-[#ff4d2e] transition">
                  <FaTicketAlt />
                  <span>Bookings</span>
                </Link>
                
                {/* User Dropdown - Fixed */}
                <div className="relative" ref={userDropdownRef}>
                  <button 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-[#ff4d2e] transition px-2 py-1 rounded-lg"
                  >
                    <FaUser />
                    <span>{user?.name?.split(' ')[0] || 'User'}</span>
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          <p className="text-xs text-[#ff4d2e] mt-1 capitalize">{user?.role}</p>
                        </div>
                        
                        <Link 
                          to="/profile" 
                          onClick={() => setShowUserDropdown(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-[#fff1f0] hover:text-[#ff4d2e] transition"
                        >
                          Profile Settings
                        </Link>
                        
                        {user?.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            onClick={() => setShowUserDropdown(false)}
                            className="block px-4 py-2 text-gray-700 hover:bg-[#fff1f0] hover:text-[#ff4d2e] transition"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        
                        {user?.role === 'distributor' && (
                          <Link 
                            to="/distributor" 
                            onClick={() => setShowUserDropdown(false)}
                            className="block px-4 py-2 text-gray-700 hover:bg-[#fff1f0] hover:text-[#ff4d2e] transition"
                          >
                            Distributor Dashboard
                          </Link>
                        )}
                        
                        {user?.role === 'theatre-owner' && (
                          <Link 
                            to="/theatre-owner" 
                            onClick={() => setShowUserDropdown(false)}
                            className="block px-4 py-2 text-gray-700 hover:bg-[#fff1f0] hover:text-[#ff4d2e] transition"
                          >
                            Theatre Dashboard
                          </Link>
                        )}
                        
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition border-t border-gray-100 mt-1"
                        >
                          <FaSignOutAlt className="mr-2" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 border-2 border-[#ff4d2e] text-[#ff4d2e] rounded-lg hover:bg-[#ff4d2e] hover:text-white transition"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-[#ff4d2e] text-white rounded-lg hover:bg-[#e63e1f] transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link 
              to="/movies" 
              className="block py-2 text-gray-700 hover:text-[#ff4d2e]" 
              onClick={() => setIsMenuOpen(false)}
            >
              Movies
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/my-bookings" 
                  className="block py-2 text-gray-700 hover:text-[#ff4d2e]" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <Link 
                  to="/profile" 
                  className="block py-2 text-gray-700 hover:text-[#ff4d2e]" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="block py-2 text-gray-700 hover:text-[#ff4d2e]" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user?.role === 'distributor' && (
                  <Link 
                    to="/distributor" 
                    className="block py-2 text-gray-700 hover:text-[#ff4d2e]" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Distributor Dashboard
                  </Link>
                )}
                {user?.role === 'theatre-owner' && (
                  <Link 
                    to="/theatre-owner" 
                    className="block py-2 text-gray-700 hover:text-[#ff4d2e]" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Theatre Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left py-2 text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block py-2 text-[#ff4d2e]" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block py-2 text-[#ff4d2e]" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar