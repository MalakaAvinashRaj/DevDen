// Module-level singleton — one event bus for the Node.js process lifetime.
// All connected clients receive every pushed event.

export interface SSEEvent {
  type: 'activity' | 'job' | 'mission'
  mission_id?: number
  role?: string
  event?: string
  detail?: string
  payload?: unknown
}

const clients = new Set<ReadableStreamDefaultController<Uint8Array>>()
const encoder = new TextEncoder()

export function pushEvent(ev: SSEEvent): void {
  if (clients.size === 0) return
  const data = encoder.encode(`data: ${JSON.stringify(ev)}\n\n`)
  for (const ctrl of clients) {
    try {
      ctrl.enqueue(data)
    } catch {
      clients.delete(ctrl)
    }
  }
}

export function createSSEStream(): ReadableStream<Uint8Array> {
  let ctrl: ReadableStreamDefaultController<Uint8Array>

  return new ReadableStream<Uint8Array>({
    start(c) {
      ctrl = c
      clients.add(ctrl)
      // Send an initial heartbeat so the connection is confirmed open
      try {
        ctrl.enqueue(encoder.encode(': connected\n\n'))
      } catch { /* ignore */ }
    },
    cancel() {
      clients.delete(ctrl)
    },
  })
}

// Heartbeat — keeps connections alive through proxies that close idle streams
let _heartbeatTimer: ReturnType<typeof setInterval> | null = null

export function startHeartbeat(intervalMs = 20_000): void {
  if (_heartbeatTimer) return
  _heartbeatTimer = setInterval(() => {
    const ping = encoder.encode(': ping\n\n')
    for (const ctrl of clients) {
      try { ctrl.enqueue(ping) } catch { clients.delete(ctrl) }
    }
  }, intervalMs)
}
