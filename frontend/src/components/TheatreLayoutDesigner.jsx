import React, { useState, useEffect } from 'react'
import { 
  FaChair, FaCouch, FaStar, FaPlus, FaMinus, FaTrash, FaSave, 
  FaEye, FaPaintBrush, FaTv, FaFilm, FaMagic, FaArrowsAlt, 
  FaGrid, FaUndo, FaRedo, FaCheckCircle, FaTimesCircle,
  FaUserFriends, FaWheelchair, FaMoneyBillWave, FaClock,
  FaCrown, FaGem, FaTicketAlt, FaBuilding, FaMapMarkerAlt
} from 'react-icons/fa'
import { GiTheaterCurtains, GiFilmProjector, GiPopcorn, GiSofa } from 'react-icons/gi'
import { Md3DRotation, Md4K, MdSound } from 'react-icons/md'
import toast from 'react-hot-toast'

const TheatreLayoutDesigner = ({ theatre, screen, onSave, onClose }) => {
  // Screen Configuration
  const [screenType, setScreenType] = useState(screen?.type || '2D')
  const [screenPosition, setScreenPosition] = useState('front')
  const [screenSize, setScreenSize] = useState('standard')
  
  // Seat Grid Configuration
  const [rows, setRows] = useState(10)
  const [cols, setCols] = useState(12)
  const [seats, setSeats] = useState([])
  const [selectedTool, setSelectedTool] = useState('select')
  const [selectedSeatType, setSelectedSeatType] = useState('normal')
  const [previewMode, setPreviewMode] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const screenTypes = [
    { id: '2D', label: '2D Screen', icon: <FaFilm className="text-blue-500" />, bg: 'bg-blue-100', border: 'border-blue-400', desc: 'Standard Digital Cinema', multiplier: 1 },
    { id: '3D', label: '3D Screen', icon: <Md3DRotation className="text-green-500" />, bg: 'bg-green-100', border: 'border-green-400', desc: 'Three Dimensional Experience', multiplier: 1.5 },
    { id: 'IMAX', label: 'IMAX', icon: <GiFilmProjector className="text-purple-500" />, bg: 'bg-purple-100', border: 'border-purple-400', desc: 'Giant Screen Experience', multiplier: 2 },
    { id: '4DX', label: '4DX', icon: <Md4K className="text-red-500" />, bg: 'bg-red-100', border: 'border-red-400', desc: 'Motion Seats + Effects', multiplier: 2.5 },
    { id: 'DOLBY', label: 'Dolby Atmos', icon: <MdSound className="text-indigo-500" />, bg: 'bg-indigo-100', border: 'border-indigo-400', desc: 'Premium Audio', multiplier: 2.2 }
  ]

  const screenPositions = [
    { id: 'front', label: 'Screen at Front', icon: <GiTheaterCurtains />, desc: 'Standard layout - Screen at front of hall' },
    { id: 'middle', label: 'Screen in Middle', icon: <FaArrowsAlt />, desc: 'Screen between two seating sections' },
    { id: 'back', label: 'Screen at Back', icon: <FaTv />, desc: 'Reverse layout - Screen at back' }
  ]

  const screenSizes = [
    { id: 'small', label: 'Small (40ft)', seats: '80-120 seats' },
    { id: 'standard', label: 'Standard (60ft)', seats: '120-200 seats' },
    { id: 'large', label: 'Large (80ft)', seats: '200-300 seats' },
    { id: 'giant', label: 'Giant (100ft)', seats: '300-500 seats' }
  ]

  const seatTypes = [
    { 
      id: 'normal', 
      label: 'Standard', 
      icon: <FaChair className="text-gray-600" />, 
      bgColor: 'bg-gray-100', 
      borderColor: 'border-gray-300',
      hoverColor: 'hover:bg-gray-200',
      textColor: 'text-gray-700',
      price: 180,
      rows: 'A-G',
      description: 'Comfortable seating with good view'
    },
    { 
      id: 'premium', 
      label: 'Premium', 
      icon: <FaStar className="text-orange-500" />, 
      bgColor: 'bg-orange-100', 
      borderColor: 'border-orange-300',
      hoverColor: 'hover:bg-orange-200',
      textColor: 'text-orange-700',
      price: 320,
      rows: 'H-J',
      description: 'Extra legroom, better view'
    },
    { 
      id: 'recliner', 
      label: 'Recliner', 
      icon: <FaCouch className="text-red-500" />, 
      bgColor: 'bg-red-100', 
      borderColor: 'border-red-300',
      hoverColor: 'hover:bg-red-200',
      textColor: 'text-red-700',
      price: 550,
      rows: 'K-M',
      description: 'Luxury recliner seats with footrest'
    },
    { 
      id: 'sofa', 
      label: 'Sofa', 
      icon: <GiSofa className="text-purple-500" />, 
      bgColor: 'bg-purple-100', 
      borderColor: 'border-purple-300',
      hoverColor: 'hover:bg-purple-200',
      textColor: 'text-purple-700',
      price: 450,
      rows: 'N-O',
      description: 'Couple sofa seats'
    },
    { 
      id: 'wheelchair', 
      label: 'Wheelchair', 
      icon: <FaWheelchair className="text-blue-500" />, 
      bgColor: 'bg-blue-100', 
      borderColor: 'border-blue-300',
      hoverColor: 'hover:bg-blue-200',
      textColor: 'text-blue-700',
      price: 180,
      rows: 'P',
      description: 'Specially designed for wheelchair users'
    }
  ]

  const tools = [
    { id: 'select', label: 'Select', icon: <FaArrowsAlt />, desc: 'Click to select seats' },
    { id: 'paint', label: 'Paint', icon: <FaPaintBrush />, desc: 'Click to change seat type' },
    { id: 'fill-row', label: 'Fill Row', icon: <FaGrid />, desc: 'Fill entire row' },
    { id: 'fill-col', label: 'Fill Column', icon: <FaGrid className="rotate-90" />, desc: 'Fill entire column' }
  ]

  // Initialize seats
  useEffect(() => {
    generateSeats()
  }, [rows, cols])

  const getSeatPrice = (type) => {
    const basePrice = seatTypes.find(t => t.id === type)?.price || 180
    const multiplier = screenTypes.find(t => t.id === screenType)?.multiplier || 1
    return Math.round(basePrice * multiplier)
  }

  const generateSeats = () => {
    const newSeats = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const rowLetter = String.fromCharCode(65 + row)
        let type = 'normal'
        
        // Intelligent seat assignment like BookMyShow
        if (row >= rows - 3) type = 'recliner'
        else if (row >= rows - 6) type = 'premium'
        else if (row >= rows - 8) type = 'sofa'
        else if (row === 0 && col % 4 === 0) type = 'wheelchair'
        
        newSeats.push({
          id: `${rowLetter}${col + 1}`,
          row: row,
          rowLetter: rowLetter,
          col: col,
          number: col + 1,
          type: type,
          price: getSeatPrice(type),
          isBooked: false,
          isSelected: false,
          isAccessible: type === 'wheelchair',
          x: col * 48,
          y: row * 48
        })
      }
    }
    setSeats(newSeats)
    saveToHistory(newSeats)
  }

  const saveToHistory = (newSeats) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newSeats)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSeats(JSON.parse(JSON.stringify(history[historyIndex - 1])))
      toast.success('Undo complete', { icon: '↩️' })
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSeats(JSON.parse(JSON.stringify(history[historyIndex + 1])))
      toast.success('Redo complete', { icon: '↪️' })
    }
  }

  const updateSeatType = (seatId, newType) => {
    const newSeats = seats.map(seat => {
      if (seat.id === seatId) {
        return { ...seat, type: newType, price: getSeatPrice(newType), isAccessible: newType === 'wheelchair' }
      }
      return seat
    })
    setSeats(newSeats)
    saveToHistory(newSeats)
  }

  const applyToRow = (row, type) => {
    const newSeats = seats.map(seat => {
      if (seat.row === row) {
        return { ...seat, type: type, price: getSeatPrice(type) }
      }
      return seat
    })
    setSeats(newSeats)
    saveToHistory(newSeats)
    toast.success(`Row ${String.fromCharCode(65 + row)} set to ${seatTypes.find(t => t.id === type)?.label}`)
  }

  const applyToColumn = (col, type) => {
    const newSeats = seats.map(seat => {
      if (seat.col === col) {
        return { ...seat, type: type, price: getSeatPrice(type) }
      }
      return seat
    })
    setSeats(newSeats)
    saveToHistory(newSeats)
    toast.success(`Column ${col + 1} set to ${seatTypes.find(t => t.id === type)?.label}`)
  }

  const applyToLastRows = (numRows, type) => {
    const newSeats = seats.map(seat => {
      if (seat.row >= rows - numRows) {
        return { ...seat, type: type, price: getSeatPrice(type) }
      }
      return seat
    })
    setSeats(newSeats)
    saveToHistory(newSeats)
    toast.success(`Last ${numRows} rows set to ${seatTypes.find(t => t.id === type)?.label}`)
  }

  const applyToAll = (type) => {
    const newSeats = seats.map(seat => ({
      ...seat,
      type: type,
      price: getSeatPrice(type)
    }))
    setSeats(newSeats)
    saveToHistory(newSeats)
    toast.success(`All seats set to ${seatTypes.find(t => t.id === type)?.label}`)
  }

  const getSeatIcon = (type) => {
    const seatType = seatTypes.find(t => t.id === type)
    return seatType?.icon || <FaChair />
  }

  const getStats = () => {
    const stats = {}
    seatTypes.forEach(type => { stats[type.id] = 0 })
    seats.forEach(seat => { stats[seat.type]++ })
    return stats
  }

  const stats = getStats()
  const totalRevenue = seats.reduce((sum, seat) => sum + seat.price, 0)

  const handleSave = () => {
    const layoutData = {
      screenId: screen._id,
      screenName: screen.name,
      screenType: screenType,
      screenPosition: screenPosition,
      screenSize: screenSize,
      rows: rows,
      cols: cols,
      totalSeats: seats.length,
      seats: seats.map(seat => ({
        seatId: seat.id,
        row: seat.rowLetter,
        number: seat.number,
        type: seat.type,
        price: seat.price,
        isAccessible: seat.isAccessible,
        position: { x: seat.x, y: seat.y }
      }))
    }
    onSave(layoutData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#ff4d2e] to-[#e63e1f] text-white p-5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <GiTheaterCurtains /> Theatre Layout Designer
            </h2>
            <p className="text-orange-100 text-sm mt-1">{theatre?.name} - {screen?.name}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={undo} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition" title="Undo">
              <FaUndo size={18} />
            </button>
            <button onClick={redo} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition" title="Redo">
              <FaRedo size={18} />
            </button>
            <button onClick={onClose} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-xl">×</button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-80px)]">
          {/* Left Panel - Tools */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto p-5">
            {/* Screen Type */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><FaTv /> Screen Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {screenTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setScreenType(type.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${screenType === type.id ? `${type.bg} ${type.border} shadow-md` : 'bg-white border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span className="font-semibold">{type.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Screen Position */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><FaArrowsAlt /> Screen Position</h3>
              <div className="space-y-2">
                {screenPositions.map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setScreenPosition(pos.id)}
                    className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${screenPosition === pos.id ? 'border-[#ff4d2e] bg-orange-50' : 'border-gray-200 bg-white'}`}
                  >
                    {pos.icon}
                    <div className="text-left">
                      <div className="font-semibold">{pos.label}</div>
                      <div className="text-xs text-gray-500">{pos.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Seat Types Palette */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><FaChair /> Seat Types</h3>
              <div className="space-y-2">
                {seatTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => { setSelectedTool('paint'); setSelectedSeatType(type.id) }}
                    className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${selectedSeatType === type.id && selectedTool === 'paint' ? 'border-[#ff4d2e] bg-orange-50' : 'border-gray-200 bg-white'}`}
                  >
                    <div className={`w-10 h-10 ${type.bgColor} rounded-lg flex items-center justify-center`}>
                      {type.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-xs text-gray-500">₹{type.price} • {type.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#ff4d2e]">{stats[type.id]}</div>
                      <div className="text-xs text-gray-400">seats</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><FaMagic /> Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => applyToLastRows(2, selectedSeatType)} className="w-full p-2 bg-white border border-gray-200 rounded-lg hover:border-[#ff4d2e] text-sm flex items-center justify-between">
                  <span>Last 2 Rows → {seatTypes.find(t => t.id === selectedSeatType)?.label}</span>
                  <FaArrowRight className="text-gray-400" />
                </button>
                <button onClick={() => applyToLastRows(4, selectedSeatType)} className="w-full p-2 bg-white border border-gray-200 rounded-lg hover:border-[#ff4d2e] text-sm flex items-center justify-between">
                  <span>Last 4 Rows → {seatTypes.find(t => t.id === selectedSeatType)?.label}</span>
                  <FaArrowRight className="text-gray-400" />
                </button>
                <button onClick={() => applyToAll(selectedSeatType)} className="w-full p-2 bg-white border border-gray-200 rounded-lg hover:border-[#ff4d2e] text-sm flex items-center justify-between">
                  <span>All Seats → {seatTypes.find(t => t.id === selectedSeatType)?.label}</span>
                  <FaArrowRight className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Dimensions */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><FaGrid /> Dimensions</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Rows (A-Z)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => setRows(Math.max(4, rows - 1))} className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300">-</button>
                    <span className="w-12 text-center font-bold">{rows}</span>
                    <button onClick={() => setRows(Math.min(20, rows + 1))} className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300">+</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Columns (1-{cols})</label>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => setCols(Math.max(6, cols - 1))} className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300">-</button>
                    <span className="w-12 text-center font-bold">{cols}</span>
                    <button onClick={() => setCols(Math.min(25, cols + 1))} className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300">+</button>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Total Seats:</span>
                  <span className="font-bold text-[#ff4d2e]">{seats.length}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Total Capacity:</span>
                  <span className="font-bold text-green-600">{seats.length} seats</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Est. Revenue per Show:</span>
                  <span className="font-bold text-green-600">₹{totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Seat Grid */}
          <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-gray-50 to-white">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                {tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${selectedTool === tool.id ? 'border-[#ff4d2e] bg-orange-50 text-[#ff4d2e]' : 'border-gray-200 bg-white text-gray-600'}`}
                  >
                    {tool.icon}
                    <span className="text-sm">{tool.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPreviewMode(!previewMode)} className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${previewMode ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 bg-white'}`}>
                  <FaEye /> {previewMode ? 'Edit Mode' : 'Preview Mode'}
                </button>
                <button onClick={() => setShowLegend(!showLegend)} className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:border-[#ff4d2e] transition-all flex items-center gap-2">
                  <FaTicketAlt /> {showLegend ? 'Hide Legend' : 'Show Legend'}
                </button>
              </div>
            </div>

            {/* Screen Display */}
            <div className="mb-8 text-center">
              <div className={`relative ${screenPosition === 'middle' ? 'mx-auto w-3/4' : 'w-full'}`}>
                <div className={`h-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 rounded-full ${screenPosition === 'front' ? '' : 'mb-4'}`}></div>
                <div className="text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                  <GiFilmProjector className="text-[#ff4d2e]" />
                  <span className="font-semibold">{screenTypes.find(t => t.id === screenType)?.label} SCREEN</span>
                  <span className="text-xs text-gray-400">| {screenSizes.find(s => s.id === screenSize)?.label}</span>
                </div>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {[...Array(rows)].map((_, row) => (
                  <div key={row} className="flex gap-1 mb-1">
                    <div className="w-8 text-center font-bold text-gray-400 text-sm flex items-center justify-center">
                      {String.fromCharCode(65 + row)}
                    </div>
                    {[...Array(cols)].map((_, col) => {
                      const seat = seats.find(s => s.row === row && s.col === col)
                      if (!seat) return null
                      const seatType = seatTypes.find(t => t.id === seat.type)
                      return (
                        <button
                          key={col}
                          onClick={() => {
                            if (selectedTool === 'paint') {
                              updateSeatType(seat.id, selectedSeatType)
                            }
                          }}
                          className={`w-10 h-10 ${seatType?.bgColor} ${seatType?.borderColor} border rounded-t-lg flex flex-col items-center justify-center transition-all hover:scale-105 ${!previewMode && 'cursor-pointer'}`}
                          title={`${seat.id} - ${seatType?.label} Seat - ₹${seat.price}`}
                        >
                          <span className="text-xs font-semibold">{seat.number}</span>
                          <span className="text-[10px]">{seatType?.icon}</span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            {showLegend && (
              <div className="mt-8 p-4 bg-white border border-gray-200 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-3">Seat Legend</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {seatTypes.map(type => (
                    <div key={type.id} className="flex items-center gap-2">
                      <div className={`w-8 h-8 ${type.bgColor} rounded-t flex items-center justify-center`}>
                        {type.icon}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{type.label}</div>
                        <div className="text-[10px] text-gray-500">₹{type.price}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#ff4d2e] rounded-t"></div>
                    <div className="text-xs font-semibold">Selected</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-400 rounded-t"></div>
                    <div className="text-xs font-semibold">Booked</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Statistics */}
          <div className="w-72 bg-gray-50 border-l border-gray-200 overflow-y-auto p-5">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><FaMoneyBillWave /> Revenue Summary</h3>
            
            <div className="space-y-3 mb-6">
              {seatTypes.map(type => (
                <div key={type.id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span className="font-semibold">{type.label}</span>
                    </div>
                    <span className="text-lg font-bold text-[#ff4d2e]">₹{type.price}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Seats: {stats[type.id]}</span>
                    <span>Revenue: ₹{(stats[type.id] * type.price).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#ff4d2e] to-[#e63e1f] text-white rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Seats</span>
                <span className="text-2xl font-bold">{seats.length}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold">Total Revenue/Show</span>
                <span className="text-xl font-bold">₹{totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-6 bg-[#ff4d2e] text-white py-3 rounded-xl font-semibold hover:bg-[#e63e1f] transition flex items-center justify-center gap-2"
            >
              <FaSave /> Save Layout & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TheatreLayoutDesigner