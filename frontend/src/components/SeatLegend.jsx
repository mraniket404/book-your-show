import React from 'react'

const SeatLegend = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-6">
      <div className="flex items-center space-x-2"><div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded-t"></div><span className="text-sm text-gray-600">Normal (₹200)</span></div>
      <div className="flex items-center space-x-2"><div className="w-6 h-6 bg-orange-200 border border-orange-300 rounded-t"></div><span className="text-sm text-gray-600">Premium (₹350)</span></div>
      <div className="flex items-center space-x-2"><div className="w-6 h-6 bg-red-200 border border-red-300 rounded-t"></div><span className="text-sm text-gray-600">Recliner (₹500)</span></div>
      <div className="flex items-center space-x-2"><div className="w-6 h-6 bg-[#ff4d2e] rounded-t"></div><span className="text-sm text-gray-600">Selected</span></div>
      <div className="flex items-center space-x-2"><div className="w-6 h-6 bg-gray-400 rounded-t"></div><span className="text-sm text-gray-600">Booked</span></div>
      <div className="flex items-center space-x-2"><div className="w-6 h-6 bg-yellow-400 rounded-t animate-pulse"></div><span className="text-sm text-gray-600">On Hold</span></div>
    </div>
  )
}

export default SeatLegend