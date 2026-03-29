import React, { useState } from 'react'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave } from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: user?.name || '', phoneNumber: user?.phoneNumber || '', city: user?.city || '' })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await updateProfile(formData)
    if (res.success) setIsEditing(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-[#ff4d2e] p-6 text-white"><div className="flex justify-between"><div><h1 className="text-2xl font-bold">My Profile</h1><p className="text-orange-100">Manage your account</p></div><button onClick={() => setIsEditing(!isEditing)} className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 flex items-center gap-2">{isEditing ? <FaSave /> : <FaEdit />}{isEditing ? 'Save' : 'Edit'}</button></div></div>
        <div className="p-6"><form onSubmit={handleSubmit}><div className="space-y-6"><div><label className="block text-gray-700 mb-2">Full Name</label><div className="relative"><FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className={`input-field pl-10 ${!isEditing && 'bg-gray-50'}`} /></div></div><div><label className="block text-gray-700 mb-2">Email</label><div className="relative"><FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="email" value={user?.email || ''} disabled className="input-field pl-10 bg-gray-50" /></div><p className="text-xs text-gray-500 mt-1">Email cannot be changed</p></div><div><label className="block text-gray-700 mb-2">Phone Number</label><div className="relative"><FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} disabled={!isEditing} className={`input-field pl-10 ${!isEditing && 'bg-gray-50'}`} /></div></div><div><label className="block text-gray-700 mb-2">City</label><div className="relative"><FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="city" value={formData.city} onChange={handleChange} disabled={!isEditing} className={`input-field pl-10 ${!isEditing && 'bg-gray-50'}`} /></div></div>{isEditing && <button type="submit" className="w-full btn-primary">Update Profile</button>}</div></form><div className="mt-8 pt-6 border-t"><h3 className="font-semibold text-gray-700 mb-4">Account Information</h3><div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-gray-500">Member Since</p><p className="font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p></div><div><p className="text-gray-500">Account Type</p><p className="font-semibold capitalize">{user?.role || 'User'}</p></div></div></div></div>
      </div>
    </div>
  )
}

export default Profile