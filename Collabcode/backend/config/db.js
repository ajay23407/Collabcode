// config/db.js
// Connects to MongoDB using Mongoose.
// Called once at server startup — if it fails the process exits.

const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`[MongoDB] Connected → ${conn.connection.host}`)
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB