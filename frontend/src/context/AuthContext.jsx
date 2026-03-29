import React, { createContext, useState, useEffect } from 'react'
import authService from '../services/authService'
import toast from 'react-hot-toast'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const res = await authService.getMe()
      setUser(res.data.data)
    } catch (error) {
      console.error('Load user error:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password)
      const { token, ...userData } = res.data.data
      localStorage.setItem('token', token)
      setUser(userData)
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (data) => {
    try {
      console.log('Registering with data:', data)
      const res = await authService.register(data)
      const { token, ...userData } = res.data.data
      localStorage.setItem('token', token)
      setUser(userData)
      toast.success(res.data.message || 'Registration successful!')
      return { success: true }
    } catch (error) {
      console.error('Register error:', error)
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully')
    window.location.href = '/login'
  }

  const updateProfile = async (data) => {
    try {
      const res = await authService.updateProfile(data)
      setUser(res.data.data)
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error(error.response?.data?.message || 'Update failed')
      return { success: false }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}