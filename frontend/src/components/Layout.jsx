import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-gray-50 text-gray-500 py-6 mt-16 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; 2024 BookYourShow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout