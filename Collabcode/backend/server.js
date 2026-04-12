require('dotenv').config()

const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const cors       = require('cors')
const WebSocket  = require('ws')

// Yjs
const Y              = require('yjs')
const syncProtocol   = require('y-protocols/sync')
const awarenessProtocol = require('y-protocols/awareness')
const { encoding, decoding } = require('lib0')

const connectDB  = require('./config/db')
const Room       = require('./models/Room')
const authRoutes = require('./routes/auth')
const roomRoutes = require('./routes/Rooms')
const executeRoutes = require('./routes/execute')

const PORT = process.env.PORT || 5000

// ─────────────────────────────────────────────
// EXPRESS
// ─────────────────────────────────────────────
const app = express()

app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.CLIENT_URL
  ],
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/execute', executeRoutes)


app.get('/health', async (_req, res) => {
  const roomCount = await Room.countDocuments().catch(() => 0)
  res.json({ status: 'ok', rooms: roomCount })
})

const httpServer = http.createServer(app)

// ─────────────────────────────────────────────
// SOCKET.IO
// ─────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
})
const activeSessions = {}

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Connected: ${socket.id}`)

  socket.on('join-room', async ({ roomId, username, color }) => {
    try {
      const room = await Room.findOne({ roomId })
      if (!room) {
        socket.emit('error', { message: `Room not found` })
        return
      }

      socket.join(roomId)
      socket.roomId   = roomId
      socket.username = username || 'Anonymous'
      socket.color    = color || '#4ade80'

      // ✅ FIX: Prevent duplicate users
      if (!activeSessions[roomId]) activeSessions[roomId] = []

      activeSessions[roomId] = activeSessions[roomId].filter(
        (m) => m.socketId !== socket.id && m.username !== socket.username
      )

      activeSessions[roomId].push({
        socketId: socket.id,
        username: socket.username,
        color: socket.color,
      })

      console.log(`[Socket.IO] ${socket.username} joined room "${roomId}"`)

      socket.emit('room-joined', {
        roomId,
        username: socket.username,
        currentCode: room.code,
        language: room.language,
        members: activeSessions[roomId],
      })

      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        username: socket.username,
        color: socket.color,
        members: activeSessions[roomId],
      })

    } catch (err) {
      console.error(err)
    }
  })
  // ── execution-started ─────────────────────────────────────
// Someone clicked Run — tell everyone in the room to show the spinner
socket.on('execution-started', ({ roomId, username }) => {
  socket.to(roomId).emit('execution-started', { username })
})

// ── execution-result ──────────────────────────────────────
// Code finished running — broadcast output to everyone in the room
socket.on('execution-result', ({ roomId, result }) => {
  socket.to(roomId).emit('execution-result', result)
})

  socket.on('send-message', ({ roomId, text }) => {
    if (!text?.trim()) return

    const msg = {
      socketId: socket.id,
      username: socket.username,
      color: socket.color,
      text: text.trim(),
      timestamp: Date.now(), // ✅ unique
    }

    io.to(roomId).emit('new-message', msg)
  })

  socket.on('disconnect', () => {
    const { roomId } = socket

    if (roomId && activeSessions[roomId]) {
      activeSessions[roomId] = activeSessions[roomId].filter(
        (m) => m.socketId !== socket.id
      )

      if (activeSessions[roomId].length === 0) {
        delete activeSessions[roomId]
      }

      socket.to(roomId).emit('user-left', {
        socketId: socket.id,
        username: socket.username,
        members: activeSessions[roomId] || [],
      })
    }
  })
})

// ─────────────────────────────────────────────
// YJS WEBSOCKET
// ─────────────────────────────────────────────
const yjsDocs = new Map()

const getYDoc = (roomId) => {
  if (!yjsDocs.has(roomId)) {
    const doc = new Y.Doc()
    const awareness = new awarenessProtocol.Awareness(doc)

    yjsDocs.set(roomId, {
      doc,
      awareness,
      conns: new Map(),
    })
  }
  return yjsDocs.get(roomId)
}

const MESSAGE_SYNC = 0
const MESSAGE_AWARENESS = 1

const handleYjsMessage = (conn, docState, message) => {
  const { doc, awareness } = docState

  const encoder = encoding.createEncoder()
  const decoder = decoding.createDecoder(message)
  const type = decoding.readVarUint(decoder)

  if (type === MESSAGE_SYNC) {
    encoding.writeVarUint(encoder, MESSAGE_SYNC)
    syncProtocol.readSyncMessage(decoder, encoder, doc, null)

    if (encoding.length(encoder) > 1) {
      conn.send(encoding.toUint8Array(encoder))
    }
  }

  if (type === MESSAGE_AWARENESS) {
    awarenessProtocol.applyAwarenessUpdate(
      awareness,
      decoding.readVarUint8Array(decoder),
      conn
    )
  }
}

const wss = new WebSocket.Server({ noServer: true })

httpServer.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, `http://localhost:${PORT}`)

  if (url.pathname === '/yjs') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  }
})

wss.on('connection', (conn, request) => {
  const params = new URL(request.url, `http://localhost:${PORT}`).searchParams
  const roomId = params.get('room')

  if (!roomId) return conn.close()

  const docState = getYDoc(roomId)
  const { doc, awareness, conns } = docState

  conns.set(conn, new Set())

  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, MESSAGE_SYNC)
  syncProtocol.writeSyncStep1(encoder, doc)
  conn.send(encoding.toUint8Array(encoder))

  conn.on('message', (msg) => {
    const data = new Uint8Array(msg)
    handleYjsMessage(conn, docState, data)

    conns.forEach((_, c) => {
      if (c !== conn && c.readyState === WebSocket.OPEN) {
        c.send(data)
      }
    })
  })

  conn.on('close', () => {
    conns.delete(conn)
  })
})

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
const start = async () => {
  try {
    await connectDB()
    console.log("MongoDB connected ✅")
  } catch (err) {
    console.error("MongoDB failed ❌", err.message)
  }

  // 🔥 ALWAYS START SERVER (IMPORTANT)
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
