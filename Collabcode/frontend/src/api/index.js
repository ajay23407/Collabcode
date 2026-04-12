// src/api/index.js
// All HTTP calls to the backend live here.
// Axios instance auto-injects the JWT on every request.

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from localStorage to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})




// ── Auth ──────────────────────────────────────────────────────
export const registerUser = (data) => api.post('/api/auth/register', data)
export const loginUser    = (data) => api.post('/api/auth/login', data)
export const getMe        = ()     => api.get('/api/auth/me')

// ── Rooms ─────────────────────────────────────────────────────
export const createRoom         = (data) => api.post('/api/rooms', data)
export const getMyRooms         = ()     => api.get('/api/rooms')
export const getRoom            = (id)   => api.get(`/api/rooms/${id}`)
export const updateRoomLanguage = (id, language) =>
  api.patch(`/api/rooms/${id}/language`, { language })
export const deleteRoom = (id) =>
  api.delete(`/api/rooms/${id}`)

export default api