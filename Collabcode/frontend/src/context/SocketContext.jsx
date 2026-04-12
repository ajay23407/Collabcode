// src/context/SocketContext.jsx
// Single shared Socket.IO connection for the whole app.
// Only connects when a user is logged in.
// Used for: chat, presence events, room join/leave, language changes.
// (Yjs uses its own separate WebSocket — see useYjs hook)

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const { user }            = useAuth()

  useEffect(() => {
    // Only create a socket when the user is logged in
    if (!user) return

    const newSocket = io(
  import.meta.env.VITE_API_URL || 'http://localhost:5000',
  {
    auth: { username: user.username, userId: user.id },
    transports: ['websocket']
  }
)

    newSocket.on('connect',       ()    => console.log('[Socket.IO] Connected:', newSocket.id))
    newSocket.on('disconnect',    (r)   => console.log('[Socket.IO] Disconnected:', r))
    newSocket.on('connect_error', (err) => console.error('[Socket.IO] Error:', err.message))

    setSocket(newSocket)

    // Disconnect and clean up when user logs out
    return () => { newSocket.disconnect() }
  }, [user])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}