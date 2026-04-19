import React, { useState } from 'react'
import { FaChair, FaCouch, FaStar, FaPlus, FaMinus, FaTrash, FaSave, FaEye, FaPaintBrush } from 'react-icons/fa'
import toast from 'react-hot-toast'

const SeatLayoutDesigner = ({ theatreId, onSave }) => {
  const [rows, setRows] = useState(8)
  const [cols, setCols] = useState(10)
  const [seatTypes, setSeatTypes] = useState({})
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const seatTypeConfig = {
    normal: { 
      label: 'Normal', 
      bgColor: 'bg-gray-200', 
      borderColor: 'border-gray-300',
      hoverColor: 'hover:bg-gray-300', 
      price: 200, 
      icon: <FaChair className="text-gray-600" /> 
    },
    premium: { 
      label: 'Premium', 
      bgColor: 'bg-orange-200', 
      borderColor: 'border-orange-300',
      hoverColor: 'hover:bg-orange-300', 
      price: 350, 
      icon: <FaStar className="text-orange-600" /> 
    },
    recliner: { 
      label: 'Recliner', 
      bgColor: 'bg-red-200', 
      borderColor: 'border-red-300',
      hoverColor: 'hover:bg-red-300', 
      price: 500, 
      icon: <FaCouch className="text-red-600" /> 
    }
  }
  
  const [selectedType, setSelectedType] = useState('normal')
  
  const getSeatId = (row, col) => {
    const rowLetter = String.fromCharCode(65 + row)
    return `${rowLetter}${col + 1}`
  }
  
  const getSeatType = (row, col) => {
    const key = `${row},${col}`
    return seatTypes[key] || 'normal'
  }
  
  const setSeatType = (row, col, type) => {
    const key = `${row},${col}`
    setSeatTypes({
      ...seatTypes,
      [key]: type
    })
  }
  
  const toggleSeatType = (row, col) => {
    const currentType = getSeatType(row, col)
    const types = ['normal', 'premium', 'recliner']
    const currentIndex = types.indexOf(currentType)
    const nextType = types[(currentIndex + 1) % types.length]
    setSeatType(row, col, nextType)
  }
  
  const applyToRow = (row, type) => {
    for (let col = 0; col < cols; col++) {
      setSeatType(row, col, type)
    }
    toast.success(`Row ${String.fromCharCode(65 + row)} set to ${seatTypeConfig[type].label}`)
  }
  
  const applyToColumn = (col, type) => {
    for (let row = 0; row < rows; row++) {
      setSeatType(row, col, type)
    }
    toast.success(`Column ${col + 1} set to ${seatTypeConfig[type].label}`)
  }
  
  const applyToLastRows = (numRows, type) => {
    for (let row = rows - numRows; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        setSeatType(row, col, type)
      }
    }
    toast.success(`Last ${numRows} rows set to ${seatTypeConfig[type].label}`)
  }
  
  const applyToAll = (type) => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        setSeatType(row, col, type)
      }
    }
    toast.success(`All seats set to ${seatTypeConfig[type].label}`)
  }
  
  const clearAll = () => {
    setSeatTypes({})
    toast.success('All seat types cleared')
  }
  
  const quickSetup = (setup) => {
    clearAll()
    if (setup === 'standard') {
      applyToLastRows(2, 'recliner')
      applyToLastRows(4, 'premium')
    } else if (setup === 'premium') {
      applyToLastRows(3, 'recliner')
      applyToLastRows(5, 'premium')
    } else if (setup === 'luxury') {
      applyToLastRows(4, 'recliner')
      applyToLastRows(6, 'premium')
    }
    toast.success(`${setup.charAt(0).toUpperCase() + setup.slice(1)} layout applied!`)
  }
  
  const saveLayout = async () => {
    setSaving(true)
    const seats = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const type = getSeatType(row, col)
        seats.push({
          seatId: getSeatId(row, col),
          row: String.fromCharCode(65 + row),
          number: col + 1,
          type: type,
          price: seatTypeConfig[type].price,
          position: { x: col * 55, y: row * 55 }
        })
      }
    }
    
    const layout = { rows, cols, totalSeats: rows * cols, seats }
    await onSave(layout)
    setSaving(false)
  }
  
  const getTotalByType = (type) => {
    let count = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (getSeatType(row, col) === type) count++
      }
    }
    return count
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-[#ff4d2e] mb-4">🎨 Seat Layout Designer</h2>
      <p className="text-gray-600 mb-6">Design your theatre seating arrangement like BookMyShow</p>
      
      {/* Quick Setup */}
      <div className="mb-6 p-4 bg-blue-50 rounded-xl">
        <h3 className="font-semibold text-blue-800 mb-3">⚡ Quick Setup (One Click)</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => quickSetup('standard')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#ff4d2e] transition">
            🎯 Standard (Normal + Premium + Recliner)
          </button>
          <button onClick={() => quickSetup('premium')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#ff4d2e] transition">
            ⭐ Premium (More Premium Seats)
          </button>
          <button onClick={() => quickSetup('luxury')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#ff4d2e] transition">
            💺 Luxury (More Recliner Seats)
          </button>
        </div>
      </div>
      
      {/* Seat Type Painter */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaPaintBrush /> Select Seat Type (Click on seat to paint)
        </h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(seatTypeConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 transition ${
                selectedType === key 
                  ? `border-[#ff4d2e] ${config.bgColor} shadow-md` 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className={`w-8 h-8 ${config.bgColor} rounded flex items-center justify-center`}>
                {config.icon}
              </div>
              <div>
                <div className="font-semibold">{config.label}</div>
                <div className="text-xs text-gray-500">₹{config.price}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="text-sm text-gray-500 font-semibold mr-2">Quick Apply:</span>
        {[...Array(Math.min(rows, 6))].map((_, i) => {
          const row = rows - 1 - i
          return (
            <button
              key={row}
              onClick={() => applyToRow(row, selectedType)}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            >
              Last {i + 1} Rows
            </button>
          )
        })}
        <button onClick={() => applyToAll(selectedType)} className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
          All Seats
        </button>
        <button onClick={clearAll} className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200">
          Clear All
        </button>
      </div>
      
      {/* Dimensions */}
      <div className="mb-6 flex flex-wrap gap-6 p-4 bg-gray-50 rounded-xl">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Rows (A to Z)</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setRows(Math.max(4, rows - 1))} className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300">-</button>
            <span className="w-12 text-center font-bold">{rows}</span>
            <button onClick={() => setRows(Math.min(15, rows + 1))} className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300">+</button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Columns (1 to {cols})</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setCols(Math.max(6, cols - 1))} className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300">-</button>
            <span className="w-12 text-center font-bold">{cols}</span>
            <button onClick={() => setCols(Math.min(20, cols + 1))} className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300">+</button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Total Seats</label>
          <div className="font-bold text-xl text-[#ff4d2e]">{rows * cols}</div>
        </div>
        <div className="ml-auto">
          <button onClick={() => setPreviewMode(!previewMode)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            {previewMode ? '✏️ Edit Mode' : '👁️ Preview Mode'}
          </button>
        </div>
      </div>
      
      {/* Statistics */}
      <div className="mb-6 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 rounded"></div><span>Normal: {getTotalByType('normal')}</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-200 rounded"></div><span>Premium: {getTotalByType('premium')}</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-200 rounded"></div><span>Recliner: {getTotalByType('recliner')}</span></div>
      </div>
      
      {/* Screen */}
      <div className="relative mb-8">
        <div className="w-full h-2 bg-gray-400 rounded-full"></div>
        <div className="text-center text-gray-500 text-sm mt-2">🎬 SCREEN</div>
      </div>
      
      {/* Seat Grid */}
      <div className="overflow-x-auto mb-6">
        <div className="min-w-max">
          {!previewMode ? (
            // Edit Mode - Click to change seat type
            <div>
              {[...Array(rows)].map((_, row) => (
                <div key={row} className="flex gap-1 mb-1">
                  <div className="w-8 text-center font-bold text-gray-500">{String.fromCharCode(65 + row)}</div>
                  {[...Array(cols)].map((_, col) => {
                    const type = getSeatType(row, col)
                    const config = seatTypeConfig[type]
                    return (
                      <button
                        key={col}
                        onClick={() => toggleSeatType(row, col)}
                        className={`w-10 h-10 ${config.bgColor} ${config.borderColor} border rounded-t-lg flex items-center justify-center transition hover:scale-105`}
                        title={`Click to change seat type`}
                      >
                        {col + 1}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : (
            // Preview Mode - Show as users will see
            <div>
              {[...Array(rows)].map((_, row) => (
                <div key={row} className="flex gap-1 mb-1">
                  <div className="w-8 text-center font-bold text-gray-500">{String.fromCharCode(65 + row)}</div>
                  {[...Array(cols)].map((_, col) => {
                    const type = getSeatType(row, col)
                    const config = seatTypeConfig[type]
                    return (
                      <div
                        key={col}
                        className={`w-10 h-10 ${config.bgColor} ${config.borderColor} border rounded-t-lg flex items-center justify-center`}
                        title={`${config.label} Seat - ₹${config.price}`}
                      >
                        {col + 1}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
        {Object.entries(seatTypeConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-6 h-6 ${config.bgColor} rounded-t`}></div>
            <span className="text-sm">{config.label} (₹{config.price})</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#ff4d2e] rounded-t"></div>
          <span className="text-sm">Selected (User will see)</span>
        </div>
      </div>
      
      {/* Save Button */}
      <button
        onClick={saveLayout}
        disabled={saving}
        className="w-full bg-[#ff4d2e] text-white py-3 rounded-xl font-semibold hover:bg-[#e63e1f] transition flex items-center justify-center gap-2"
      >
        <FaSave /> {saving ? 'Saving...' : 'Save Seat Layout'}
      </button>
    </div>
  )
}

export default SeatLayoutDesigner