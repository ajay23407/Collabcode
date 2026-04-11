// src/components/OutputPanel.jsx
// ─────────────────────────────────────────────────────────────
// Shows the output of code execution at the bottom of the editor.
// Displays stdout, stderr, exit code, and execution time.
// Resizable height by dragging the top border.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react'

export default function OutputPanel({ result, running, onClose }) {
  const bottomRef = useRef(null)

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [result])

  return (
    <div className="flex flex-col bg-bg-900 border-t border-bg-500"
         style={{ height: '220px' }}>

      {/* Panel header */}
      <div className="flex items-center justify-between px-4 h-9
                      border-b border-bg-500 bg-bg-900 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] font-semibold text-txt-300 uppercase tracking-widest">
            output
          </span>

          {/* Status badge */}
          {running ? (
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-yellow-400">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              running...
            </span>
          ) : result && (
            <span className={[
              'text-[10px] font-mono px-2 py-0.5 rounded border',
              result.exitCode === 0
                ? 'text-green-400 bg-green-400/10 border-green-400/30'
                : 'text-red-400 bg-red-400/10 border-red-400/30',
            ].join(' ')}>
              {result.exitCode === 0 ? '✓ exited 0' : `✗ exited ${result.exitCode}`}
            </span>
          )}

          {/* Execution time */}
          {result?.duration && (
            <span className="text-[10px] font-mono text-txt-500">
              {result.duration}ms
            </span>
          )}
        </div>

        {/* Clear button */}
        <button
          onClick={onClose}
          className="text-txt-500 hover:text-txt-300 font-mono text-xs
                     transition-colors px-2 py-1 rounded hover:bg-bg-600"
        >
          ✕ clear
        </button>
      </div>

      {/* Output content — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
        {running ? (
          <span className="text-txt-500">executing code...</span>

        ) : !result ? (
          <span className="text-txt-500">
            Press <span className="text-accent">Run</span> to execute your code
          </span>

        ) : (
          <>
            {/* stdout — normal output */}
            {result.stdout && (
              <pre className="text-txt-100 whitespace-pre-wrap break-words mb-2">
                {result.stdout}
              </pre>
            )}

            {/* stderr — errors, warnings */}
            {result.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap break-words">
                {result.stderr}
              </pre>
            )}

            {/* Empty output */}
            {!result.stdout && !result.stderr && (
              <span className="text-txt-500">
                (no output)
              </span>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}