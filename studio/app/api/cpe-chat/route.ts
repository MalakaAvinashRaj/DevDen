import { NextRequest } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import os from 'os'

const DEVDEN_ROOT = '/Users/raj/Desktop/DevDen'
const HERMES_BIN  = path.join(os.homedir(), '.local/bin/hermes')

// Strip ANSI escape codes and carriage returns from terminal output
function stripAnsi(s: string): string {
  return s
    .replace(/\x1B\[[0-9;]*[mGKHFABCDEF]/g, '')
    .replace(/\x1B\][^\x07]*\x07/g, '')
    .replace(/\r/g, '')
}

export async function POST(req: NextRequest) {
  const { message, missionId } = await req.json()

  const prefix      = missionId ? `[Active mission: ${missionId}]\n` : ''
  const fullMessage = `${prefix}${message}`

  const encoder = new TextEncoder()

  function send(ctrl: ReadableStreamDefaultController, payload: object) {
    ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
  }

  const stream = new ReadableStream({
    start(ctrl) {
      send(ctrl, { type: 'status', text: 'CPE is thinking…' })

      const proc = spawn(HERMES_BIN, [
        '-p', 'cpe',
        'chat', '-q', fullMessage,
        '--yolo', '-Q',
      ], {
        cwd: DEVDEN_ROOT,
        env: { ...process.env, HOME: os.homedir() },
      })

      let buf = ''

      proc.stdout.on('data', (data: Buffer) => {
        const chunk = stripAnsi(data.toString())
        buf += chunk
        send(ctrl, { type: 'chunk', text: chunk })
      })

      proc.on('close', (code) => {
        send(ctrl, { type: 'done', exitCode: code, fullText: stripAnsi(buf) })
        ctrl.close()
      })

      proc.on('error', (err) => {
        send(ctrl, { type: 'error', message: err.message })
        ctrl.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
