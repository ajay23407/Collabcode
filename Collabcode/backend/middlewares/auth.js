// middleware/auth.js
// Express middleware that verifies the JWT on protected routes.
// Add it to any route that requires a logged-in user.
//
// Usage in a route file:
//   const protect = require('../middleware/auth')
//   router.get('/me', protect, (req, res) => { ... })
//
// After this middleware runs successfully, req.user is populated
// with { id, username, email } so the route handler can use it.

const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    // 1. Extract token from the Authorization header
    //    Header format: "Authorization: Bearer eyJhbGci..."
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please log in.' })
    }

    const token = authHeader.split(' ')[1]  // grab just the token part

    // 2. Verify the token — throws if expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // decoded = { id: "...", iat: ..., exp: ... }

    // 3. Fetch user from DB (ensures user still exists + gets fresh data)
    //    .select('-password') excludes the hashed password from the result
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' })
    }

    // 4. Attach user to request — available in all subsequent middleware/routes
    req.user = user
    next()

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' })
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' })
    }
    res.status(500).json({ error: 'Server error during authentication.' })
  }
}

module.exports = protect