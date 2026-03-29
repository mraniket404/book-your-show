import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash, FaBuilding, FaRegBuilding } from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth'

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    phoneNumber: '', 
    role: 'user',
    companyName: '',
    gstNumber: '',
    city: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    console.log('📝 Submitting registration:', formData)
    
    // Validate theatre owner specific fields
    if (formData.role === 'theatre-owner') {
      if (!formData.companyName) {
        toast.error('Please enter your theatre/company name')
        setLoading(false)
        return
      }
      if (!formData.gstNumber) {
        toast.error('Please enter GST number')
        setLoading(false)
        return
      }
    }
    
    // Validate distributor specific fields
    if (formData.role === 'distributor') {
      if (!formData.companyName) {
        toast.error('Please enter your company name')
        setLoading(false)
        return
      }
    }
    
    const res = await register(formData)
    if (res.success) {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 bg-white">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-[#ff4d2e] mb-8">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 mb-2">I am a</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
            >
              <option value="user">Movie Lover (User)</option>
              <option value="distributor">Movie Distributor</option>
              <option value="theatre-owner">Theatre Owner</option>
            </select>
          </div>

          {/* Common Fields */}
          <div>
            <label className="block text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" 
                placeholder="Enter your name" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" 
                placeholder="Enter your email" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="tel" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" 
                placeholder="10-digit mobile number" 
                required 
                pattern="[0-9]{10}"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">City</label>
            <div className="relative">
              <FaRegBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" 
                placeholder="Enter your city" 
              />
            </div>
          </div>

          {/* Company Name - for Distributor and Theatre Owner */}
          {(formData.role === 'distributor' || formData.role === 'theatre-owner') && (
            <div>
              <label className="block text-gray-700 mb-2">
                {formData.role === 'theatre-owner' ? 'Theatre Name' : 'Company Name'}
              </label>
              <div className="relative">
                <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  name="companyName" 
                  value={formData.companyName} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" 
                  placeholder={formData.role === 'theatre-owner' ? "Enter theatre name" : "Enter company name"}
                  required={formData.role === 'theatre-owner'}
                />
              </div>
            </div>
          )}

          {/* GST Number - Only for Theatre Owner */}
          {formData.role === 'theatre-owner' && (
            <div>
              <label className="block text-gray-700 mb-2">GST Number</label>
              <div className="relative">
                <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  name="gstNumber" 
                  value={formData.gstNumber} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]" 
                  placeholder="Enter GST number (e.g., 27AAPFU0939F1Z5)"
                  required
                  pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Format: 27AAPFU0939F1Z5 (15 characters)</p>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2e]"
                placeholder="Create a password (min 6 characters)"
                required
                minLength={6}
              />
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-white border-2 border-[#ff4d2e] text-[#ff4d2e] font-semibold py-3 rounded-lg hover:bg-[#ff4d2e] hover:text-white transition"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account? <Link to="/login" className="text-[#ff4d2e] hover:underline">Login</Link>
        </p>

        {(formData.role === 'distributor' || formData.role === 'theatre-owner') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              ⚠️ Your account will be reviewed by admin. You'll be notified once approved.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Register