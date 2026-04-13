// src/hooks/useYjs.js
// ─────────────────────────────────────────────────────────────
// Phase 3: Yjs real-time sync hook.
//
// This hook sets up the complete Yjs ↔ Monaco binding for a room.
// Call it inside EditorRoom once the Monaco editor is mounted.
//
// WHAT IT DOES:
//   1. Creates a Y.Doc (shared document) for the room
//   2. Connects it to the backend Yjs WebSocket server at /yjs
//   3. Binds the Y.Doc to the Monaco editor model via MonacoBinding
//   4. Sets up Awareness for colored cursors (presence)
//   5. Returns connection status for the UI
//
// AWARENESS = Yjs's name for real-time presence data:
//   cursor position, selection, username, color.
//   Every client broadcasts their awareness state and receives others'.
//
// HOW THE BINDING WORKS:
//   Y.Doc (server truth) ←→ MonacoBinding ←→ Monaco Editor (local view)
//   Any edit in Monaco is captured by MonacoBinding, turned into a
//   Yjs update, sent to the server, and broadcast to all other clients.
//   Incoming updates are applied to Monaco automatically.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import * as Y                  from 'yjs'
import { WebsocketProvider }   from 'y-websocket'
import { MonacoBinding }       from 'y-monaco'

// Generate a consistent color from a username string
// Same username always = same color (deterministic)
const usernameToColor = (name = '') => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${Math.abs(hash) % 360}, 70%, 65%)`
}

export function useYjs({ roomId, username, editor, monaco }) {
  // Whether the Yjs WebSocket is connected to the server
  const [synced, setSynced]       = useState(false)
  const [connected, setConnected] = useState(false)

  // Refs to hold Yjs objects so they survive re-renders
  const ydocRef    = useRef(null)
  const providerRef = useRef(null)
  const bindingRef  = useRef(null)

  useEffect(() => {
    // Wait until the Monaco editor instance is ready
    // editor = the Monaco editor object (from onMount callback)
    // monaco = the Monaco API object (languages, etc.)
    if (!editor || !monaco || !roomId) return

    // ── 1. Create the shared Y.Doc ──────────────────────────
    // Y.Doc is the root of everything in Yjs.
    // Each doc has named "types" — we use getText('monaco')
    // which is a Y.Text (a collaborative string).
    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    // ── 2. Create the WebSocket provider ───────────────────
    // This connects to our backend Yjs server at ws://localhost:4000/yjs
    // The 'room' param tells the server which Y.Doc to sync with.
    //
    // The provider automatically:
    //   - Sends our local changes to the server
    //   - Receives and applies remote changes
    //   - Reconnects if the connection drops
  const provider = new WebsocketProvider(
  `wss://collabcodee.onrender.com/yjs?room=${roomId}`,
  roomId,
  ydoc
)     
    providerRef.current = provider

    // ── 3. Set up Awareness (presence / cursors) ────────────
    // awareness.localState = what WE broadcast to others
    // awareness.getStates() = what everyone (including us) broadcasts
    const awareness = provider.awareness
    const myColor   = usernameToColor(username)

    // Set our identity — this gets broadcast to all other clients
    awareness.setLocalStateField('user', {
      name:  username,
      color: myColor,
    })

    // ── 4. Connection status listeners ──────────────────────
    provider.on('status', ({ status }) => {
      setConnected(status === 'connected')
      if (status === 'connected') console.log('[Yjs] Connected to room:', roomId)
    })

    provider.on('sync', (isSynced) => {
      setSynced(isSynced)
      if (isSynced) console.log('[Yjs] Synced with server')
    })

    // ── 5. Bind Y.Doc to Monaco Editor ─────────────────────
    // MonacoBinding links the Y.Text to the Monaco editor model.
    // From this point on, you NEVER set editor content manually —
    // Yjs owns the source of truth.
    //
    // Arguments:
    //   ytext        → the Y.Text shared type (named 'monaco')
    //   model        → the Monaco editor's text model
    //   editors      → Set of Monaco editor instances (for cursor rendering)
    //   awareness    → Yjs awareness for showing remote cursors
    const ytext   = ydoc.getText('monaco')
    const binding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      awareness
    )
    bindingRef.current = binding

    // ── 6. Style remote cursors ─────────────────────────────
    // y-monaco renders remote cursors as DOM elements with a
    // data-username attribute. We inject CSS to color them.
    // Each user gets their deterministic color from usernameToColor().
    const styleEl = document.createElement('style')
    styleEl.id    = `yjs-cursor-styles-${roomId}`
    styleEl.textContent = `
      .yRemoteSelection {
        opacity: 0.3;
      }
      .yRemoteSelectionHead {
        position: absolute;
        border-left: 2px solid;
        border-top: 2px solid;
        border-color: inherit;
        height: 100%;
        box-sizing: border-box;
      }
      .yRemoteSelectionHead::after {
        content: attr(data-username);
        position: absolute;
        top: -1.4em;
        left: -2px;
        padding: 1px 5px;
        font-size: 11px;
        font-family: 'JetBrains Mono', monospace;
        border-radius: 3px;
        background: inherit;
        color: #0d0e11;
        white-space: nowrap;
        pointer-events: none;
      }
    `
    document.head.appendChild(styleEl)

    // ── Cleanup when component unmounts ─────────────────────
    return () => {
      binding.destroy()
      provider.disconnect()
      provider.destroy()
      ydoc.destroy()
      styleEl.remove()
      bindingRef.current  = null
      providerRef.current = null
      ydocRef.current     = null
      setSynced(false)
      setConnected(false)
    }
  }, [editor, monaco, roomId, username])

  return { synced, connected }
}
