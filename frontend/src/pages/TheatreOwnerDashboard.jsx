import React, { useState, useEffect } from 'react'
import { 
  FaPlus, FaEdit, FaTrash, FaFilm, FaCalendarAlt, FaClock, FaChair, 
  FaTheaterMasks, FaTicketAlt, FaUsers, FaMapMarkerAlt, FaCheck, 
  FaArrowLeft, FaArrowRight, FaTv, FaCouch, FaStar, FaExclamationTriangle, 
  FaSave, FaEye, FaThLarge,
  FaWheelchair, FaMoneyBillWave
} from 'react-icons/fa'
import { GiTheaterCurtains, GiFilmProjector, GiSofa } from 'react-icons/gi'
import { Md3DRotation, Md4K } from 'react-icons/md'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'
import theatreService from '../services/theatreService'
import showService from '../services/showService'
import movieService from '../services/movieService'
import { useAuth } from '../hooks/useAuth'

const TheatreOwnerDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('theatre')
  const [loading, setLoading] = useState(true)
  const [theatre, setTheatre] = useState(null)
  const [shows, setShows] = useState([])
  const [movies, setMovies] = useState([])
  const [screens, setScreens] = useState([])
  const [showAddTheatre, setShowAddTheatre] = useState(false)
  const [showAddScreen, setShowAddScreen] = useState(false)
  const [showLayoutDesigner, setShowLayoutDesigner] = useState(false)
  const [selectedScreenForLayout, setSelectedScreenForLayout] = useState(null)
  
  // Simple Layout Designer States
  const [screenType, setScreenType] = useState('2D')
  const [layoutRows, setLayoutRows] = useState(8)
  const [layoutCols, setLayoutCols] = useState(10)
  
  // Wizard States
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedScreen, setSelectedScreen] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimes, setSelectedTimes] = useState([])
  
  // Prices initialization with all values
  const [prices, setPrices] = useState({ 
    normal: 180, 
    premium: 320, 
    recliner: 550, 
    sofa: 450,
    wheelchair: 180 
  })
  
  const [theatreForm, setTheatreForm] = useState({
    name: '', address: '', city: '', pincode: '', phone: '', amenities: []
  })
  
  const [screenForm, setScreenForm] = useState({ 
    name: '', capacity: 100, type: 'Normal' 
  })

  // Simple Seat Types Configuration
  const seatTypesConfig = {
    normal: { 
      label: 'Standard', icon: <FaChair className="text-gray-600" />, bgColor: 'bg-gray-100', 
      borderColor: 'border-gray-300', price: 180
    },
    premium: { 
      label: 'Premium', icon: <FaStar className="text-orange-500" />, bgColor: 'bg-orange-100', 
      borderColor: 'border-orange-300', price: 320
    },
    recliner: { 
      label: 'Recliner', icon: <FaCouch className="text-red-500" />, bgColor: 'bg-red-100', 
      borderColor: 'border-red-300', price: 550
    },
    sofa: { 
      label: 'Sofa', icon: <GiSofa className="text-purple-500" />, bgColor: 'bg-purple-100', 
      borderColor: 'border-purple-300', price: 450
    },
    wheelchair: { 
      label: 'Wheelchair', icon: <FaWheelchair className="text-blue-500" />, bgColor: 'bg-blue-100', 
      borderColor: 'border-blue-300', price: 180
    }
  }

  const screenTypes = [
    { id: '2D', label: '2D', multiplier: 1 },
    { id: '3D', label: '3D', multiplier: 1.5 },
    { id: 'IMAX', label: 'IMAX', multiplier: 2 },
    { id: '4DX', label: '4DX', multiplier: 2.5 }
  ]

  // Helper Function: Generate Time Slots with Gap Logic
  const generateTimeSlots = (durationMinutes, alreadySelectedTimes) => {
    const allTimes = []
    const durationHours = durationMinutes / 60
    const GAP_HOURS = 0.5
    
    for (let hour = 9; hour <= 23; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 23 && minute === 30) continue
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        allTimes.push(time)
      }
    }
    
    const timeToHours = (timeStr) => {
      const [hour, minute] = timeStr.split(':').map(Number)
      return hour + minute / 60
    }
    
    const isTimeConflict = (time) => {
      const currentStart = timeToHours(time)
      const currentEnd = currentStart + durationHours
      
      for (const selectedTime of alreadySelectedTimes) {
        const selectedStart = timeToHours(selectedTime)
        const selectedEnd = selectedStart + durationHours
        
        if (
          (currentStart >= selectedStart && currentStart < selectedEnd + GAP_HOURS) ||
          (currentEnd > selectedStart - GAP_HOURS && currentEnd <= selectedEnd + GAP_HOURS) ||
          (currentStart <= selectedStart && currentEnd >= selectedEnd)
        ) {
          return true
        }
      }
      return false
    }
    
    return allTimes.map(time => ({
      time,
      disabled: isTimeConflict(time)
    }))
  }

  useEffect(() => {
    loadData()
  }, [])

  const getNext7Days = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  // Simple save layout
  const handleSaveLayout = async () => {
    setLoading(true)
    try {
      const layoutData = {
        rows: layoutRows,
        cols: layoutCols,
        screenType: screenType
      }
      await theatreService.saveSeatLayout(selectedScreenForLayout._id, layoutData)
      toast.success(`Layout saved! ${layoutRows * layoutCols} seats configured.`)
      setShowLayoutDesigner(false)
      await loadData()
    } catch (error) {
      console.error('Save layout error:', error)
      toast.error(error.response?.data?.message || 'Failed to save layout')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const theatreRes = await theatreService.getMyTheatre()
      if (theatreRes.data.success && theatreRes.data.data) {
        setTheatre(theatreRes.data.data)
        setScreens(theatreRes.data.data.screens || [])
        const showsRes = await showService.getShowsByTheatre(theatreRes.data.data._id)
        if (showsRes.data.success) setShows(showsRes.data.data)
      } else {
        setShowAddTheatre(true)
      }
      const moviesRes = await movieService.getMovies()
      if (moviesRes.data.success) setMovies(moviesRes.data.data)
    } catch (error) {
      console.error('Error loading data:', error)
      if (error.response?.status === 404 || error.response?.status === 400) setShowAddTheatre(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTheatre = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await theatreService.createTheatre(theatreForm)
      if (res.data.success) {
        toast.success('Theatre created successfully!')
        setTheatre(res.data.data)
        setShowAddTheatre(false)
        await loadData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create theatre')
    } finally {
      setLoading(false)
    }
  }

  const handleAddScreen = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await theatreService.addScreen(screenForm)
      if (res.data.success) {
        toast.success('Screen added successfully!')
        setScreens([...screens, res.data.data])
        setShowAddScreen(false)
        setScreenForm({ name: '', capacity: 100, type: 'Normal' })
        await loadData()
      }
    } catch (error) {
      console.error('Add screen error:', error)
      toast.error(error.response?.data?.message || 'Failed to add screen')
    } finally {
      setLoading(false)
    }
  }

  const handlePublishShows = async () => {
    setLoading(true)
    const toastId = toast.loading(`Adding ${selectedTimes.length} shows...`)
    
    try {
      let successCount = 0
      let failCount = 0
      
      for (let i = 0; i < selectedTimes.length; i++) {
        const time = selectedTimes[i]
        
        const showData = {
          movieId: selectedMovie._id,
          theatreId: theatre._id,
          screenId: selectedScreen._id,
          date: selectedDate,
          time: time,
          prices: {
            normal: prices.normal || 180,
            premium: prices.premium || 320,
            recliner: prices.recliner || 550,
            sofa: prices.sofa || 450,
            wheelchair: prices.wheelchair || 180
          },
          format: selectedMovie.format || '2D',
          totalSeats: selectedScreen.capacity || 100
        }
        
        try {
          const response = await showService.createShow(showData)
          if (response.data.success) {
            successCount++
            toast.success(`✅ Show at ${time} added`, { id: `show-${time}` })
          }
        } catch (err) {
          failCount++
          console.error(`❌ Failed at ${time}:`, err.response?.data || err.message)
        }
      }
      
      if (successCount > 0) {
        toast.success(`🎬 ${successCount} shows added successfully!`, { id: toastId })
      }
      if (failCount > 0) {
        toast.error(`⚠️ ${failCount} shows failed to add`, { id: toastId })
      }
      
      if (successCount > 0) {
        setShowWizard(false)
        setWizardStep(1)
        setSelectedMovie(null)
        setSelectedScreen(null)
        setSelectedDate('')
        setSelectedTimes([])
        await loadData()
      }
    } catch (error) {
      console.error('❌ Batch error:', error)
      toast.error('Failed to add shows.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  if (showAddTheatre) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#ff4d2e] mb-2">Register Your Theatre</h1>
        <p className="text-gray-600 mb-8">Fill in the details to get started</p>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleCreateTheatre} className="space-y-5">
            <div><label className="block text-gray-700 mb-2 font-semibold">Theatre Name *</label><input type="text" value={theatreForm.name} onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" required /></div>
            <div><label className="block text-gray-700 mb-2 font-semibold">Address *</label><textarea value={theatreForm.address} onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" rows="3" required /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-gray-700 mb-2 font-semibold">City *</label><input type="text" value={theatreForm.city} onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" required /></div>
              <div><label className="block text-gray-700 mb-2 font-semibold">Pincode</label><input type="text" value={theatreForm.pincode} onChange={(e) => setTheatreForm({ ...theatreForm, pincode: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" /></div>
            </div>
            <div><label className="block text-gray-700 mb-2 font-semibold">Contact Phone</label><input type="tel" value={theatreForm.phone} onChange={(e) => setTheatreForm({ ...theatreForm, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" /></div>
            <div><label className="block text-gray-700 mb-2 font-semibold">Amenities (comma separated)</label><input type="text" placeholder="Parking, Food Court, Dolby Atmos" onChange={(e) => setTheatreForm({ ...theatreForm, amenities: e.target.value.split(',').map(a => a.trim()) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" /></div>
            <button type="submit" className="w-full bg-[#ff4d2e] text-white font-semibold py-3 rounded-lg hover:bg-[#e63e1f] transition">Create Theatre</button>
          </form>
        </div>
      </div>
    )
  }

  // Simple Layout Designer Modal (Real BMS Style)
  if (showLayoutDesigner && selectedScreenForLayout) {
    const totalSeats = layoutRows * layoutCols
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#ff4d2e]">Configure Layout</h2>
            <button onClick={() => setShowLayoutDesigner(false)} className="text-gray-500 text-2xl hover:text-gray-700">×</button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Screen: {selectedScreenForLayout.name}</label>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Screen Type</label>
              <select 
                value={screenType} 
                onChange={(e) => setScreenType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
              >
                {screenTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Rows (A-Z)</label>
                <input 
                  type="number" 
                  value={layoutRows} 
                  onChange={(e) => setLayoutRows(parseInt(e.target.value) || 8)}
                  min="4" 
                  max="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Columns (1-20)</label>
                <input 
                  type="number" 
                  value={layoutCols} 
                  onChange={(e) => setLayoutCols(parseInt(e.target.value) || 10)}
                  min="6" 
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                />
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-500 mb-2">SCREEN PREVIEW</div>
              <div className="w-full h-1 bg-gray-400 rounded-full mb-4"></div>
              <div className="text-sm">
                <span className="font-semibold">{layoutRows} Rows</span> × 
                <span className="font-semibold"> {layoutCols} Columns</span> = 
                <span className="font-semibold text-[#ff4d2e]"> {totalSeats} Seats</span>
              </div>
              <div className="flex justify-center gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 border rounded"></div> Standard (₹180)</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-200 border border-orange-300 rounded"></div> Premium (₹320)</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div> Recliner (₹550)</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              💡 Last 3 rows = Recliner, Middle rows = Premium, Front rows = Standard
            </div>
            
            <button 
              onClick={handleSaveLayout}
              disabled={loading}
              className="w-full bg-[#ff4d2e] text-white py-3 rounded-xl font-semibold hover:bg-[#e63e1f] transition flex items-center justify-center gap-2"
            >
              <FaSave /> {loading ? 'Saving...' : 'Save Layout'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-3xl font-bold text-[#ff4d2e] mb-2">Theatre Owner Dashboard</h1><p className="text-gray-600">Welcome back, {user?.name}!</p></div>
        <button onClick={() => { if(movies.length===0) toast.error('No movies available'); else if(screens.length===0) toast.error('Add screens first'); else setShowWizard(true) }} className="bg-[#ff4d2e] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#e63e1f] transition flex items-center gap-2"><FaPlus /> Add New Show</button>
      </div>

      {movies.length === 0 && (<div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6"><div className="flex items-start gap-3"><FaExclamationTriangle className="text-yellow-600 text-xl mt-1" /><div><h4 className="font-semibold text-yellow-800">No Movies Available</h4><p className="text-yellow-700 text-sm">Contact a distributor to add movies.</p></div></div></div>)}

      {theatre && (<div className="bg-gradient-to-r from-[#ff4d2e] to-[#e63e1f] text-white rounded-2xl p-6 mb-8"><div className="flex items-start justify-between"><div className="flex items-center gap-4"><FaTheaterMasks className="text-5xl" /><div><h2 className="text-2xl font-bold">{theatre.name}</h2><p className="flex items-center gap-2 mt-1"><FaMapMarkerAlt className="text-sm" />{theatre.address}</p><p className="text-sm opacity-90 mt-1">{theatre.city}</p></div></div><button onClick={() => setShowAddScreen(true)} className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30">+ Add Screen</button></div>{theatre.amenities?.length > 0 && (<div className="flex flex-wrap gap-2 mt-4">{theatre.amenities.map((item, idx) => (<span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-sm">{item}</span>))}</div>)}</div>)}

      {screens.length > 0 && (<div className="mb-8"><h3 className="text-xl font-bold mb-4">Your Screens</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{screens.map(screen => (<div key={screen._id} className="bg-white border border-gray-200 rounded-xl p-3"><FaTv className="text-2xl text-[#ff4d2e] mb-2" /><div className="font-bold">{screen.name}</div><div className="text-xs text-gray-500">Capacity: {screen.capacity || screen.seatLayout?.totalSeats || '-'}</div><button onClick={() => { setSelectedScreenForLayout(screen); setLayoutRows(screen.seatLayout?.rows || 8); setLayoutCols(screen.seatLayout?.cols || 10); setScreenType(screen.seatLayout?.screenType || '2D'); setShowLayoutDesigner(true); }} className="mt-2 text-xs text-[#ff4d2e] hover:underline w-full text-center">🎨 Configure Layout</button></div>))}</div></div>)}

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('shows')} className={`px-4 py-2 font-semibold ${activeTab === 'shows' ? 'text-[#ff4d2e] border-b-2 border-[#ff4d2e]' : 'text-gray-500'}`}><FaFilm className="inline mr-2" /> Shows ({shows.length})</button>
        <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 font-semibold ${activeTab === 'stats' ? 'text-[#ff4d2e] border-b-2 border-[#ff4d2e]' : 'text-gray-500'}`}><FaUsers className="inline mr-2" /> Statistics</button>
      </div>

      {activeTab === 'shows' && (<div>{shows.length === 0 ? (<div className="text-center py-12 bg-white border rounded-xl"><FaFilm className="text-6xl text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No shows added yet</p>{movies.length > 0 && screens.length > 0 && (<button onClick={() => setShowWizard(true)} className="mt-4 btn-primary">Add Your First Show</button>)}</div>) : (<div className="space-y-4">{shows.map(show => (<div key={show._id} className="bg-white border rounded-xl p-4"><div className="flex justify-between items-center"><div><h4 className="font-bold text-lg">{show.movieId?.title}</h4><div className="flex gap-4 text-sm text-gray-500 mt-1"><span><FaCalendarAlt className="inline mr-1" /> {new Date(show.date).toLocaleDateString()}</span><span><FaClock className="inline mr-1" /> {show.time}</span><span><FaChair className="inline mr-1" /> {show.availableSeats} seats left</span></div></div><div className="flex gap-2"><span className="bg-[#fff1f0] text-[#ff4d2e] px-3 py-1 rounded-lg">₹{show.price}</span><button className="text-red-500 hover:text-red-700"><FaTrash /></button></div></div></div>))}</div>)}</div>)}

      {activeTab === 'stats' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-white border rounded-2xl p-6 text-center"><FaTicketAlt className="text-4xl text-[#ff4d2e] mx-auto mb-4" /><h3 className="text-2xl font-bold">{shows.reduce((t, s) => t + (s.totalBookings || 0), 0)}</h3><p className="text-gray-600">Tickets Sold</p></div><div className="bg-white border rounded-2xl p-6 text-center"><FaFilm className="text-4xl text-[#ff4d2e] mx-auto mb-4" /><h3 className="text-2xl font-bold">{shows.length}</h3><p className="text-gray-600">Active Shows</p></div><div className="bg-white border rounded-2xl p-6 text-center"><FaUsers className="text-4xl text-[#ff4d2e] mx-auto mb-4" /><h3 className="text-2xl font-bold">₹{shows.reduce((t, s) => t + (s.totalRevenue || 0), 0).toLocaleString()}</h3><p className="text-gray-600">Total Revenue</p></div></div>)}

      {/* Add Screen Modal */}
      {showAddScreen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-6"><h2 className="text-2xl font-bold text-[#ff4d2e] mb-4">Add Screen</h2><form onSubmit={handleAddScreen} className="space-y-4"><input type="text" placeholder="Screen Name" value={screenForm.name} onChange={(e) => setScreenForm({...screenForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required /><input type="number" placeholder="Capacity" value={screenForm.capacity} onChange={(e) => setScreenForm({...screenForm, capacity: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" required /><select value={screenForm.type} onChange={(e) => setScreenForm({...screenForm, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg"><option value="Normal">Normal</option><option value="Premium">Premium</option><option value="IMAX">IMAX</option><option value="4DX">4DX</option></select><div className="flex gap-3"><button type="submit" className="flex-1 btn-primary">Add Screen</button><button type="button" onClick={() => setShowAddScreen(false)} className="flex-1 btn-outline">Cancel</button></div></form></div></div>)}

      {/* Show Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#ff4d2e]">Add New Show</h2>
                <div className="flex gap-2 mt-2">
                  {[1,2,3,4,5].map(step => (
                    <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${wizardStep >= step ? 'bg-[#ff4d2e] text-white' : 'bg-gray-200 text-gray-500'}`}>{step}</div>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowWizard(false)} className="text-gray-500 text-2xl">×</button>
            </div>
            <div className="p-6">
              {wizardStep === 1 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Select Movie</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {movies.map(movie => (
                      <div key={movie._id} onClick={() => { setSelectedMovie(movie); setWizardStep(2) }} className="cursor-pointer border-2 rounded-xl overflow-hidden hover:shadow-lg">
                        <img src={movie.poster || 'https://via.placeholder.com/300x450'} alt={movie.title} className="w-full h-40 object-cover" />
                        <div className="p-3">
                          <h4 className="font-bold">{movie.title}</h4>
                          <p className="text-sm text-gray-500">{movie.language}</p>
                          <p className="text-xs text-gray-400">⏱️ {movie.duration || 150} min</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {wizardStep === 2 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Select Screen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {screens.map(screen => (
                      <div key={screen._id} onClick={() => { setSelectedScreen(screen); setWizardStep(3) }} className="cursor-pointer border-2 rounded-xl p-4 hover:shadow-lg">
                        <FaTv className="text-3xl text-[#ff4d2e] mb-2" />
                        <h4 className="font-bold">{screen.name}</h4>
                        <p className="text-sm text-gray-500">Capacity: {screen.capacity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {wizardStep === 3 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Select Date</h3>
                  <div className="flex gap-3 overflow-x-auto">
                    {getNext7Days().map(date => (
                      <button key={date} onClick={() => { setSelectedDate(date); setWizardStep(4) }} className="flex flex-col items-center p-4 min-w-[100px] rounded-xl border-2 hover:border-[#ff4d2e]">
                        <span className="text-lg font-bold">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-2xl font-bold">{new Date(date).getDate()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {wizardStep === 4 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Select Show Times</h3>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm border border-blue-200">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="font-semibold">🎬 Movie: {selectedMovie?.title}</span>
                      <span>⏱️ Duration: <strong>{selectedMovie?.duration || 150} minutes</strong></span>
                      <span>⏰ Gap required: <strong>30 minutes</strong></span>
                    </div>
                  </div>

                  {selectedTimes.length > 0 && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm border border-green-200">
                      <span className="font-semibold">✅ Selected Shows:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTimes.map(time => (
                          <span key={time} className="bg-green-200 px-3 py-1 rounded-full text-sm">{time}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {generateTimeSlots(selectedMovie?.duration || 150, selectedTimes).map(({ time, disabled }) => (
                      <label
                        key={time}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition
                          ${disabled 
                            ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed line-through' 
                            : selectedTimes.includes(time) 
                              ? 'border-[#ff4d2e] bg-orange-50 cursor-pointer shadow-sm' 
                              : 'border-gray-200 hover:border-[#ff4d2e] cursor-pointer hover:bg-orange-50'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTimes.includes(time)}
                          disabled={disabled}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTimes([...selectedTimes, time])
                            } else {
                              setSelectedTimes(selectedTimes.filter(t => t !== time))
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="font-medium">{time}</span>
                      </label>
                    ))}
                  </div>

                  {selectedTimes.length > 0 && (
                    <button onClick={() => setWizardStep(5)} className="mt-6 btn-primary w-full py-3">
                      Continue ({selectedTimes.length} show{selectedTimes.length > 1 ? 's' : ''})
                    </button>
                  )}
                </div>
              )}
              
              {wizardStep === 5 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Set Prices</h3>
                  <div className="space-y-3">
                    {Object.entries(seatTypesConfig).map(([key, config]) => (
                      <div key={key} className="flex justify-between items-center p-4 border rounded-xl">
                        <div className="flex items-center gap-3">
                          {config.icon}
                          <div>
                            <div className="font-bold">{config.label}</div>
                          </div>
                        </div>
                        <input
                          type="number"
                          value={prices[key] || 0}
                          onChange={(e) => setPrices({ ...prices, [key]: parseInt(e.target.value) || 0 })}
                          className="w-28 px-3 py-2 border rounded-lg text-center"
                          min="50"
                          step="10"
                        />
                      </div>
                    ))}
                    <button onClick={handlePublishShows} className="mt-6 btn-primary w-full py-3" disabled={loading}>
                      {loading ? 'Publishing...' : `Publish ${selectedTimes.length} Shows`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TheatreOwnerDashboard