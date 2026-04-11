// models/Room.js
// A Room stores metadata + the last-saved code snapshot.
// Live real-time code state is managed by Yjs in memory.

const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
  {
    // Short URL-friendly ID (e.g. "a1b2c3d4")
    roomId: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
    },
    name: {
      type:      String,
      required:  true,
      trim:      true,
      maxlength: 100,
    },
    // Reference to the user who created the room
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
    language: {
      type:    String,
      default: 'javascript',
      enum:    ['javascript','typescript','python','java','cpp','go','rust','html','css'],
    },
    // Last-saved code snapshot — delivered to new joiners via Socket.IO
    // (Yjs manages the live in-memory state during active sessions)
    code: {
      type:    String,
      default: '',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Room', roomSchema)