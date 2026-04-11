// routes/rooms.js
// All room-related HTTP endpoints.
//
// POST   /api/rooms          → create a room (protected)
// GET    /api/rooms          → list rooms created by logged-in user (protected)
// GET    /api/rooms/:id      → get room info (protected)
// PATCH  /api/rooms/:id/language → update language (protected)

const express = require('express')
const { v4: uuidv4 } = require('uuid')
const Room    = require('../models/Room')
const protect = require('../middlewares/auth')

const router = express.Router()

// Apply protect middleware to ALL routes in this file
// (every room action requires a logged-in user)
router.use(protect)


// ─────────────────────────────────────────────────────────────
// POST /api/rooms
// Creates a new room and saves it to MongoDB.
// Body: { name }
// ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Room name is required' })
    }
    if (name.length > 100) {
      return res.status(400).json({ error: 'Room name too long (max 100 chars)' })
    }

    // Short ID for the URL — take first 8 chars of a UUID
    const roomId = uuidv4().replace(/-/g, '').slice(0, 8)

    const room = await Room.create({
      roomId,
      name:      name.trim(),
      createdBy: req.user._id,   // from the JWT via protect middleware
    })

    console.log(`[Room] Created "${room.name}" (${roomId}) by ${req.user.username}`)

    res.status(201).json({
      id:        room.roomId,
      name:      room.name,
      language:  room.language,
      createdAt: room.createdAt,
    })

  } catch (err) {
    console.error('[Create Room Error]', err.message)
    res.status(500).json({ error: 'Failed to create room' })
  }
})


// ─────────────────────────────────────────────────────────────
// GET /api/rooms
// Returns all rooms created by the currently logged-in user.
// ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const rooms = await Room
      .find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })   // newest first
      .select('-code -__v')       // exclude large code field from list view

    const formatted = rooms.map((r) => ({
      id:        r.roomId,
      name:      r.name,
      language:  r.language,
      createdAt: r.createdAt,
    }))

    res.json(formatted)

  } catch (err) {
    console.error('[Get Rooms Error]', err.message)
    res.status(500).json({ error: 'Failed to fetch rooms' })
  }
})


// ─────────────────────────────────────────────────────────────
// GET /api/rooms/:id
// Fetch a single room by its short ID.
// Any authenticated user can fetch a room (needed for joining via link).
// ─────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id })
    if (!room) {
      return res.status(404).json({ error: `Room "${req.params.id}" not found` })
    }

    res.json({
      id:        room.roomId,
      name:      room.name,
      language:  room.language,
      createdAt: room.createdAt,
    })

  } catch (err) {
    console.error('[Get Room Error]', err.message)
    res.status(500).json({ error: 'Failed to fetch room' })
  }
})
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ roomId: req.params.id })

    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    res.json({ message: 'Room deleted successfully' })

  } catch (err) {
    console.error('[Delete Room Error]', err)
    res.status(500).json({ error: 'Failed to delete room' })
  }
})

// ─────────────────────────────────────────────────────────────
// PATCH /api/rooms/:id/language
// Updates the room's programming language.
// Body: { language }
// ─────────────────────────────────────────────────────────────
router.patch('/:id/language', async (req, res) => {
  try {
    const { language } = req.body
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.id },
      { language },
      { new: true, runValidators: true }
    )
    if (!room) return res.status(404).json({ error: 'Room not found' })

    res.json({ id: room.roomId, language: room.language })

  } catch (err) {
    console.error('[Update Language Error]', err.message)
    res.status(500).json({ error: 'Failed to update language' })
  }
})


module.exports = router