// src/components/ProtectedRoute.jsx
// Blocks unauthenticated users from accessing protected pages.
// Redirects to /login if no user in AuthContext.

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // While checking localStorage on first load, show a minimal loader
  // This prevents a flash-redirect to /login before state is restored
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-900">
        <span className="font-mono text-sm text-txt-500">loading...</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}