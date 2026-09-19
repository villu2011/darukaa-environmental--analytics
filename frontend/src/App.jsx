import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import SiteDetails from './pages/SiteDetails'
import MapPage from './pages/Map'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <div>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/projects"
            element={<ProtectedRoute><Projects /></ProtectedRoute>}
          />
          <Route
            path="/projects/:id"
            element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>}
          />
          <Route
            path="/sites/:id"
            element={<ProtectedRoute><SiteDetails /></ProtectedRoute>}
          />
          <Route
            path="/map"
            element={<ProtectedRoute><MapPage /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </div>
  )
}
