import React, { useState, useEffect } from 'react'
import { FaUsers, FaTheaterMasks, FaFilm, FaCheckCircle, FaTimesCircle, FaEye, FaShieldAlt, FaUserCheck } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'
import adminService from '../services/adminService'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [pendingUsers, setPendingUsers] = useState([])
  const [stats, setStats] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminService.getPendingUsers(),
        adminService.getStats()
      ])
      setPendingUsers(usersRes.data.data)
      setStats(statsRes.data.data)
      console.log('📊 Loaded data:', { pendingUsers: usersRes.data.data, stats: statsRes.data.data })
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveUser = async (userId, approve) => {
    if (processing) return
    
    setProcessing(true)
    console.log(`🔄 ${approve ? 'Approving' : 'Rejecting'} user:`, userId)
    
    try {
      const response = await adminService.approveUser(userId, approve)
      console.log('✅ Success:', response.data)
      
      if (response.data.success) {
        toast.success(`User ${approve ? 'approved' : 'rejected'} successfully!`)
        // Reload data to refresh the list
        await loadData()
      }
    } catch (error) {
      console.error('❌ Error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update user'
      toast.error(errorMessage)
    } finally {
      setProcessing(false)
      setShowModal(false)
      setSelectedUser(null)
    }
  }

  const viewUserDetails = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FaShieldAlt className="text-3xl text-[#ff4d2e]" />
        <h1 className="text-3xl font-bold text-[#ff4d2e]">Admin Dashboard</h1>
      </div>
      <p className="text-gray-600 mb-8">Manage user approvals and monitor platform activity</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm capitalize">
                  {stat._id === 'user' && '👥 Regular Users'}
                  {stat._id === 'distributor' && '🎬 Distributors'}
                  {stat._id === 'theatre-owner' && '🎭 Theatre Owners'}
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.count}</p>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-green-600">✓ Verified: {stat.verified}</span>
                  <span className="text-yellow-600">⏳ Pending: {stat.pending}</span>
                </div>
              </div>
              {stat._id === 'user' && <FaUsers className="text-4xl text-gray-300" />}
              {stat._id === 'theatre-owner' && <FaTheaterMasks className="text-4xl text-gray-300" />}
              {stat._id === 'distributor' && <FaFilm className="text-4xl text-gray-300" />}
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Pending Approvals</h2>
          {pendingUsers.length > 0 && (
            <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-semibold">
              {pendingUsers.length} pending
            </span>
          )}
        </div>
        
        {pendingUsers.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <FaUserCheck className="text-6xl text-green-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No pending approvals</p>
            <p className="text-gray-400 text-sm">All users are verified</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map(user => (
              <div key={user._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'theatre-owner' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {user.role === 'theatre-owner' ? '🎭 Theatre Owner' : '🎬 Distributor'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Email:</span> {user.email}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Phone:</span> {user.phoneNumber}
                      </p>
                      {user.city && (
                        <p className="text-gray-600">
                          <span className="font-medium">City:</span> {user.city}
                        </p>
                      )}
                      {user.companyName && (
                        <p className="text-gray-600">
                          <span className="font-medium">Company:</span> {user.companyName}
                        </p>
                      )}
                      {user.gstNumber && (
                        <p className="text-gray-600">
                          <span className="font-medium">GST:</span> {user.gstNumber}
                        </p>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2"> 
                    <button
                      onClick={() => viewUserDetails(user)}
                      className="border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition"
                      disabled={processing}
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={() => handleApproveUser(user._id, true)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2 transition disabled:opacity-50"
                      disabled={processing}
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      onClick={() => handleApproveUser(user._id, false)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2 transition disabled:opacity-50"
                      disabled={processing}
                    >
                      <FaTimesCircle /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#ff4d2e]">User Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-500 text-sm">Full Name</label>
                  <p className="font-semibold text-lg">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">Email</label>
                  <p className="font-semibold">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">Phone Number</label>
                  <p className="font-semibold">{selectedUser.phoneNumber}</p>
                </div>
                {selectedUser.city && (
                  <div>
                    <label className="text-gray-500 text-sm">City</label>
                    <p className="font-semibold">{selectedUser.city}</p>
                  </div>
                )}
                {selectedUser.companyName && (
                  <div>
                    <label className="text-gray-500 text-sm">Company/Theatre Name</label>
                    <p className="font-semibold">{selectedUser.companyName}</p>
                  </div>
                )}
                {selectedUser.gstNumber && (
                  <div>
                    <label className="text-gray-500 text-sm">GST Number</label>
                    <p className="font-semibold">{selectedUser.gstNumber}</p>
                  </div>
                )}
                <div>
                  <label className="text-gray-500 text-sm">Role</label>
                  <p className="font-semibold capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">Registration Date</label>
                  <p className="font-semibold">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 p-6 flex gap-3 justify-end">
              <button
                onClick={() => handleApproveUser(selectedUser._id, true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                disabled={processing}
              >
                Approve User
              </button>
              <button
                onClick={() => handleApproveUser(selectedUser._id, false)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                disabled={processing}
              >
                Reject User
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard