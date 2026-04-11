// src/App.jsx
// Root component — sets up providers and routing.
// Provider order matters:
//   BrowserRouter → gives us useNavigate()
//   AuthProvider  → reads/writes user state
//   SocketProvider → depends on user from Auth

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }   from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute     from './components/ProtectedRoute'
import LoginPage          from './pages/LoginPage'
import Dashboard          from './pages/Dashboard'
import EditorRoom         from './pages/EditorRoom'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/"             element={<Navigate to="/dashboard" replace />} />
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/room/:roomId" element={<ProtectedRoute><EditorRoom /></ProtectedRoute>} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}