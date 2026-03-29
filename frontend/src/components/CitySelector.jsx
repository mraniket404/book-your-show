import React, { useState } from 'react'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { useCity } from '../hooks/useCity'

const CitySelector = () => {
  const { selectedCity, setSelectedCity, cities } = useCity()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className="relative">
      <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-2 border border-[#ff4d2e] text-[#ff4d2e] px-3 py-1.5 rounded-lg hover:bg-[#fff1f0]">
        <FaMapMarkerAlt /><span>{selectedCity}</span>
      </button>
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {cities.map(city => (
            <button key={city} onClick={() => { setSelectedCity(city); setShowDropdown(false) }} className={`block w-full text-left px-4 py-2 hover:bg-[#fff1f0] ${selectedCity === city ? 'text-[#ff4d2e] bg-[#fff1f0]' : ''}`}>
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CitySelector