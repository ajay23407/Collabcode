// routes/execute.js
// ─────────────────────────────────────────────────────────────
// Handles code execution inside Docker containers.
//
// POST /api/execute
// Body: { code, language, roomId }
//
// HOW IT WORKS:
//   1. Receive code + language from frontend
//   2. Write the code to a temp file on disk
//   3. Spin up a Docker container with the right language image
//   4. Mount the temp file into the container and run it
//   5. Capture stdout + stderr
//   6. Delete the temp file
//   7. Return output to frontend
//
// SECURITY:
//   - Code runs inside Docker (isolated from host OS)
//   - 10 second timeout — infinite loops get killed
//   - Memory limit: 100MB
//   - No network access inside the container
//   - Temp files are always deleted after execution
// ─────────────────────────────────────────────────────────────

const express  = require('express')
const { exec } = require('child_process')
const fs       = require('fs')
const path     = require('path')
const os       = require('os')
const protect  = require('../middlewares/auth')

const router = express.Router()

// All execute routes require login
router.use(protect)

// ── Language config ───────────────────────────────────────────
// Maps each language to:
//   image      → Docker image to use
//   filename   → what to name the source file inside the container
//   runCmd     → command to run inside the container
const LANGUAGE_CONFIG = {
  javascript: {
    image:    'node:18-alpine',
    filename: 'main.js',
    runCmd:   'node main.js',
  },
  typescript: {
    image:    'node:18-alpine',
    filename: 'main.ts',
    // Install ts-node on the fly, then run the file
    runCmd:   'npx ts-node main.ts',
  },
  python: {
    image:    'python:3.11-alpine',
    filename: 'main.py',
    runCmd:   'python main.py',
  },
  java: {
    image:    'openjdk:17-alpine',
    filename: 'Main.java',
    // Java needs compile then run
    runCmd:   'javac Main.java && java Main',
  },
  cpp: {
    image:    'gcc:latest',
    filename: 'main.cpp',
    // Compile to binary then run
    runCmd:   'g++ -o main main.cpp && ./main',
  },
  go: {
    image:    'golang:1.21-alpine',
    filename: 'main.go',
    runCmd:   'go run main.go',
  },
  rust: {
    image:    'rust:alpine',
    filename: 'main.rs',
    runCmd:   'rustc main.rs -o main && ./main',
  },
}

// ── POST /api/execute ─────────────────────────────────────────
router.post('/', async (req, res) => {
  const { code, language } = req.body

  // Validate
  if (!code || !code.trim()) {
    return res.status(400).json({ error: 'No code provided' })
  }
  if (!language || !LANGUAGE_CONFIG[language]) {
    return res.status(400).json({
      error: `Language "${language}" is not supported`,
      supported: Object.keys(LANGUAGE_CONFIG),
    })
  }

  const config   = LANGUAGE_CONFIG[language]
  // Create a unique temp directory for this execution
  // os.tmpdir() = /tmp on Linux/Mac, C:\Users\...\AppData\Local\Temp on Windows
  const tempDir  = fs.mkdtempSync(path.join(os.tmpdir(), 'collabcode-'))
  const filePath = path.join(tempDir, config.filename)

  try {
    // 1. Write the user's code to a temp file
    fs.writeFileSync(filePath, code, 'utf8')

    // 2. Build the Docker command
    //
    // Breaking it down:
    //   docker run          → create and start a new container
    //   --rm                → auto-delete container when it exits
    //   --memory="100m"     → limit RAM to 100MB
    //   --cpus="0.5"        → limit to half a CPU core
    //   --network none      → no internet access
    //   --read-only         → container filesystem is read-only
    //   --tmpfs /tmp        → BUT allow writes to /tmp (needed for compilation)
    //   -v tempDir:/app     → mount our temp dir as /app inside container
    //   -w /app             → set working directory to /app
    //   image               → the Docker image
    //   sh -c "runCmd"      → run the command inside the container
    const dockerCmd = [
      'docker run',
      '--rm',
      '--memory="100m"',
      '--cpus="0.5"',
      '--network none',
      '--read-only',
      '--tmpfs /tmp:exec',
      `-v "${tempDir}:/app"`,
      '-w /app',
      config.image,
      `sh -c "${config.runCmd}"`,
    ].join(' ')

    console.log(`[Execute] Running ${language} code for ${req.user.username}`)

    // 3. Execute the Docker command with a timeout
    //    exec() spawns a child process and captures stdout + stderr
    const output = await runWithTimeout(dockerCmd, 10000) // 10 second timeout

    res.json({
      stdout:   output.stdout,
      stderr:   output.stderr,
      exitCode: output.exitCode,
    })

  } catch (err) {
    if (err.message === 'TIMEOUT') {
      return res.status(408).json({
        stdout:   '',
        stderr:   'Execution timed out (10 second limit)',
        exitCode: 1,
      })
    }
    console.error('[Execute Error]', err.message)
    res.status(500).json({
      stdout:   '',
      stderr:   err.message,
      exitCode: 1,
    })
  } finally {
    // 4. Always clean up the temp directory
    //    Even if execution failed or timed out
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    } catch (_) {}
  }
})


// ── Helper: run a shell command with a timeout ────────────────
// Returns { stdout, stderr, exitCode }
// Throws { message: 'TIMEOUT' } if time limit exceeded
function runWithTimeout(command, timeoutMs) {
  return new Promise((resolve, reject) => {
    const process = exec(
      command,
      { timeout: timeoutMs },
      (error, stdout, stderr) => {
        if (error) {
          // Check if it was killed due to timeout
          if (error.killed || error.signal === 'SIGTERM') {
            return reject(new Error('TIMEOUT'))
          }
          // Non-zero exit code (e.g. compilation error, runtime error)
          // This is NOT a server error — it's the user's code failing
          return resolve({
            stdout,
            stderr:   stderr || error.message,
            exitCode: error.code || 1,
          })
        }
        // Success
        resolve({ stdout, stderr, exitCode: 0 })
      }
    )
  })
}

module.exports = router