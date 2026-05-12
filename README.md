# CollabCode

> **Real-time collaborative code editor** — write code together, in real time.

![CollabCode Banner](https://placehold.co/1200x400/0d0e11/4ade80?text=CollabCode&font=mono)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [How It Works](#how-it-works)
  - [Real-time Sync (Yjs)](#real-time-sync-yjs)
  - [Code Execution (Docker)](#code-execution-docker)
  - [Authentication (JWT)](#authentication-jwt)
- [API Reference](#api-reference)
- [Deployment](#deployment)
  - [Frontend → Vercel](#frontend--vercel)
  - [Backend → Render](#backend--render)
  - [Database → MongoDB Atlas](#database--mongodb-atlas)
- [Supported Languages](#supported-languages)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

CollabCode is a browser-based code editor that lets multiple users edit the same file simultaneously in real time — like Google Docs, but for code. Changes sync instantly across all connected clients using **Yjs CRDT**, with live cursor presence and in-room chat.

Users can write code together and **execute it directly in the browser** using a sandboxed Docker container on the server. Every user in the room sees the output at the same time.

---

## Features

- **Real-time collaborative editing** — multiple users type in the same file simultaneously with zero conflicts (Yjs CRDT)
- **Live cursors** — see every user's cursor position and selection in a unique color
- **User presence** — live list of who's in the room right now
- **In-room chat** — send messages to everyone in the session
- **Code execution** — run code directly in the editor; output streams to all users
- **9 languages supported** — JavaScript, TypeScript, Python, Java, C++, Go, Rust, HTML, CSS
- **Language switcher** — change the editor language; broadcasts to all users instantly
- **Theme switcher** — Dark, Light, High Contrast
- **Share modal** — one-click copy of the room invite link
- **JWT authentication** — secure register/login flow
- **Persistent rooms** — room metadata and code snapshots saved to MongoDB
- **Responsive layout** — works on desktop and tablet

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| Monaco Editor | VS Code's editor engine |
| Yjs + y-monaco | Real-time CRDT sync |
| y-websocket | Yjs WebSocket provider |
| Socket.IO client | Room events, chat, presence |
| Axios | HTTP requests to backend |
| React Router v6 | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server and REST API |
| Socket.IO | WebSocket room events and chat |
| Yjs + y-protocols | Server-side CRDT document sync |
| ws | Raw WebSocket server for Yjs |
| Mongoose | MongoDB ODM |
| MongoDB | Persistent storage |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth tokens |
| Docker | Sandboxed code execution |

---

## Project Structure

```
collabcode/
│
├── backend/                          # Node.js server
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── middleware/
│   │   └── auth.js                   # JWT verification middleware
│   ├── models/
│   │   ├── User.js                   # Mongoose user schema
│   │   └── Room.js                   # Mongoose room schema
│   ├── routes/
│   │   ├── auth.js                   # POST /register, POST /login, GET /me
│   │   ├── rooms.js                  # CRUD room endpoints
│   │   └── execute.js                # POST /execute — Docker code runner
│   ├── server.js                     # Entry point: Express + Socket.IO + Yjs WS
│   ├── Dockerfile                    # Docker image for Render deployment
│   ├── render.yaml                   # Render service config
│   ├── .env                          # Environment variables (never commit this)
│   └── package.json
│
└── frontend/                         # React application
    ├── src/
    │   ├── api/
    │   │   └── index.js              # All Axios HTTP calls in one place
    │   ├── context/
    │   │   ├── AuthContext.jsx       # Global user + JWT state
    │   │   └── SocketContext.jsx     # Shared Socket.IO connection
    │   ├── hooks/
    │   │   └── useYjs.js             # Yjs + Monaco binding + awareness
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx    # Route guard for authenticated pages
    │   │   └── OutputPanel.jsx       # Code execution output display
    │   ├── pages/
    │   │   ├── LoginPage.jsx         # Register / login with tab toggle
    │   │   ├── Dashboard.jsx         # Room list, create room, join room
    │   │   └── EditorRoom.jsx        # Main editor with all features
    │   ├── App.jsx                   # Router + provider tree
    │   ├── main.jsx                  # React DOM entry point
    │   └── index.css                 # Tailwind directives + component classes
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

Make sure you have these installed before starting:

```bash
node --version     # v18 or higher required
npm --version      # v8 or higher
mongod --version   # MongoDB Community Edition
docker --version   # Docker Desktop
```

- **Node.js v18+** — [nodejs.org](https://nodejs.org)
- **MongoDB** — [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- **Docker Desktop** — [docs.docker.com/get-docker](https://docs.docker.com/get-docker/)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/collabcode.git
cd collabcode
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

**3. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

**4. Pull Docker language images** (for code execution)

```bash
docker pull node:18-alpine
docker pull python:3.11-alpine
docker pull openjdk:17-alpine
docker pull gcc:latest
docker pull golang:1.21-alpine
docker pull rust:alpine
```

### Environment Variables

Create a `.env` file inside the `backend/` folder:

```bash
# backend/.env

# Server
PORT=4000

# MongoDB
# Local:
MONGO_URI=mongodb://localhost:27017/collabcode
# Atlas (production):
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/collabcode

# JWT
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d

# CORS — your frontend URL
CLIENT_URL=http://localhost:3000
```

> **Never commit your `.env` file.** It's already in `.gitignore`.

To generate a secure `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Running Locally

You need **three terminals** running simultaneously:

**Terminal 1 — MongoDB**
```bash
mongod
# MongoDB starts on port 27017
```

**Terminal 2 — Backend**
```bash
cd collabcode/backend
npm run dev
```

Expected output:
```
[MongoDB] Connected → localhost

  CollabCode backend is running
  HTTP      → http://localhost:4000
  Socket.IO → ws://localhost:4000
  Yjs WS    → ws://localhost:4000/yjs
```

**Terminal 3 — Frontend**
```bash
cd collabcode/frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready

  ➜  Local:   http://localhost:3000/
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**To test real-time sync:** open the same room URL in two browser tabs, register two different accounts, and type in either tab — changes appear instantly in the other.

---

## How It Works

### Real-time Sync (Yjs)

CollabCode uses **Yjs**, a CRDT (Conflict-free Replicated Data Type) library, for real-time document synchronization. This means:

- Two users can type at the exact same position at the exact same millisecond
- Both edits are merged automatically without data loss
- No "last write wins" — both changes survive

```
User A types "hello"          User B types "world"
      ↓                              ↓
  Yjs delta                      Yjs delta
      ↓                              ↓
      └──────── WebSocket ──────────→ Server (Y.Doc)
      ←──────── broadcast ───────────┘
      ↓                              ↓
  MonacoBinding               MonacoBinding
  applies delta               applies delta
      ↓                              ↓
  Editor shows               Editor shows
  "helloworld"               "helloworld"
```

The server maintains one authoritative `Y.Doc` per room. New joiners receive the full document state on connection via the Yjs sync protocol. Cursor positions (awareness) are also broadcast through Yjs.

### Code Execution (Docker)

When a user clicks **Run**:

1. Frontend reads the current code from Monaco via `editor.getValue()`
2. `POST /api/execute` sends the code and language to the backend
3. Backend writes the code to a temporary file in `/tmp`
4. A Docker container is spawned with the appropriate language runtime:
   ```bash
   docker run --rm --memory="100m" --cpus="0.5" --network none \
     -v /tmp/collabcode-xyz:/app -w /app \
     python:3.11-alpine sh -c "python main.py"
   ```
5. stdout and stderr are captured, the container is destroyed, temp files are deleted
6. Output is returned via HTTP and broadcast to all users in the room via Socket.IO

Security measures on every execution:
- `--memory="100m"` — 100MB RAM limit
- `--cpus="0.5"` — half a CPU core
- `--network none` — no internet access
- `--read-only` — read-only container filesystem
- 10 second timeout — infinite loops are killed

### Authentication (JWT)

```
Register/Login → bcrypt hashes password → stored in MongoDB
             → server signs a JWT with JWT_SECRET
             → JWT returned to frontend
             → stored in localStorage
             → sent as Authorization: Bearer <token> on every request
             → protect middleware verifies on every protected route
```

---

## API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ username, email, password }` | Create account, returns JWT |
| POST | `/api/auth/login` | `{ email, password }` | Login, returns JWT |
| GET | `/api/auth/me` | — | Get current user (protected) |

### Rooms

All room endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/rooms` | `{ name }` | Create a new room |
| GET | `/api/rooms` | — | Get all rooms by current user |
| GET | `/api/rooms/:id` | — | Get room by ID |
| PATCH | `/api/rooms/:id/language` | `{ language }` | Update room language |

### Execution

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/execute` | `{ code, language }` | Run code in Docker sandbox |

### Socket.IO Events

**Client → Server**

| Event | Payload | Description |
|---|---|---|
| `join-room` | `{ roomId, username, color }` | Join a room session |
| `code-change` | `{ roomId, code }` | Broadcast code change (Phase 2 fallback) |
| `language-change` | `{ roomId, language }` | Change editor language for all users |
| `send-message` | `{ roomId, text }` | Send a chat message |
| `execution-started` | `{ roomId, username }` | Notify room that code is running |
| `execution-result` | `{ roomId, result }` | Broadcast execution output to room |

**Server → Client**

| Event | Payload | Description |
|---|---|---|
| `room-joined` | `{ currentCode, language, members }` | Sent to joining user |
| `user-joined` | `{ username, members }` | Sent to everyone when user joins |
| `user-left` | `{ username, members }` | Sent to everyone when user disconnects |
| `language-updated` | `{ language }` | Language changed by another user |
| `new-message` | `{ username, text, timestamp }` | New chat message |
| `execution-started` | `{ username }` | Another user started running code |
| `execution-result` | `{ stdout, stderr, exitCode, duration }` | Code execution finished |

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
# Update src/api/index.js baseURL to your Render URL
# Update src/context/SocketContext.jsx io() URL
# Update src/hooks/useYjs.js WebsocketProvider URL (use wss://)

git add .
git commit -m "production URLs"
git push
```

Then: [vercel.com](https://vercel.com) → New Project → Import repo → Deploy (Vite auto-detected)

### Backend → Render

```bash
cd backend
git add .
git commit -m "add Dockerfile and render.yaml"
git push
```

Then: [render.com](https://render.com) → New Web Service → Connect repo → Docker detected automatically

**Environment variables to set in Render dashboard:**

```
MONGO_URI       mongodb+srv://...
JWT_SECRET      your_long_secret
JWT_EXPIRES_IN  7d
PORT            4000
CLIENT_URL      https://your-app.vercel.app
NODE_ENV        production
```

### Database → MongoDB Atlas

1. Create free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Database Access → Add user with read/write permissions
3. Network Access → Add `0.0.0.0/0` (allow all IPs for Render)
4. Connect → copy the `mongodb+srv://...` connection string
5. Paste into `MONGO_URI` in both your `.env` and Render environment variables

---

## Supported Languages

| Language | Runtime | Docker Image |
|---|---|---|
| JavaScript | Node.js 18 | `node:18-alpine` |
| TypeScript | ts-node | `node:18-alpine` |
| Python | Python 3.11 | `python:3.11-alpine` |
| Java | OpenJDK 17 | `openjdk:17-alpine` |
| C++ | GCC | `gcc:latest` |
| Go | Go 1.21 | `golang:1.21-alpine` |
| Rust | Rust stable | `rust:alpine` |
| HTML | — | display only |
| CSS | — | display only |

---

## Roadmap

- [ ] Code execution with stdin support (interactive programs)
- [ ] File tree — multiple files per room
- [ ] Room history — restore previous code snapshots
- [ ] Video/audio chat integration
- [ ] GitHub import — open any repo file in CollabCode
- [ ] Custom keybindings (Vim, Emacs mode)
- [ ] Mobile support
- [ ] Room access control — public/private rooms, password protection
- [ ] Export code as file download

---

## Contributing

Pull requests are welcome.

```bash
# Fork the repo, then:
git clone https://github.com/yourusername/collabcode.git
cd collabcode

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, then:
git commit -m "add: your feature description"
git push origin feature/your-feature-name

# Open a pull request on GitHub
```

Please keep commits small and focused. One feature or fix per PR.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with Node.js, React, Yjs, and Docker</p>
  <p>
    <a href="https://collabcode.vercel.app">Live Demo</a> ·
    <a href="https://github.com/yourusername/collabcode/issues">Report Bug</a> ·
    <a href="https://github.com/yourusername/collabcode/issues">Request Feature</a>
  </p>
</div>
