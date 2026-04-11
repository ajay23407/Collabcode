// routes/auth.js
// Handles user registration and login.
//
// POST /api/auth/register  → create account, return JWT
// POST /api/auth/login     → verify credentials, return JWT
// GET  /api/auth/me        → return logged-in user info (protected)

const express = require('express')
const jwt     = require('jsonwebtoken')
const User    = require('../models/User')
const protect = require('../middlewares/auth')

const router = express.Router()

// ── Helper: create a signed JWT for a user ───────────────────
// Called after successful register or login.
// The token payload contains just the user ID — everything else
// is fetched from the DB via the auth middleware.
const signToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// ── Helper: send token + user data to client ─────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id)
  res.status(statusCode).json({
    token,
    user: {
      id:       user._id,
      username: user.username,
      email:    user.email,
    },
  })
}


// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { username, email, password }
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Basic presence check (Mongoose schema handles deeper validation)
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required' })
    }

    // Check for existing user — give a clear error message
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    })
    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username'
      return res.status(409).json({ error: `${field} is already taken` })
    }

    // Create user — password hashing happens in the pre-save hook in User.js
    const user = await User.create({ username, email, password })

    console.log(`[Auth] New user registered: ${username} (${email})`)
    sendTokenResponse(user, 201, res)

  } catch (err) {
    // Mongoose validation errors have a specific shape
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ error: messages[0] })
    }
    console.error('[Register Error]', err.message)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})


// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user and explicitly include the password field
    // (it's excluded by default via select: false in the schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      // Use a generic message — don't reveal whether email exists
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Compare the entered password against the stored hash
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    console.log(`[Auth] Login: ${user.username}`)
    sendTokenResponse(user, 200, res)

  } catch (err) {
    console.error('[Login Error]', err.message)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})


// ─────────────────────────────────────────────────────────────
// GET /api/auth/me   (protected — requires valid JWT)
// Returns the currently logged-in user's info.
// Useful for the frontend to verify the token is still valid.
// ─────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  // req.user is set by the protect middleware
  res.json({
    id:        req.user._id,
    username:  req.user.username,
    email:     req.user.email,
    createdAt: req.user.createdAt,
  })
})


module.exports = router