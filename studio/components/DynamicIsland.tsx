'use client'

import { useEffect, useState } from 'react'

interface IslandEvent {
  type: string
  role?: string
  event?: string
  detail?: string
  mission_id?: number
}

const ROLE_COLOR: Record<string, string> = {
  orchestrator: '#a78bfa',
  worker:       '#60a5fa',
  validator:    '#fbbf24',
  supervisor:   '#34d399',
}

export function DynamicIsland() {
  const [events, setEvents] = useState<IslandEvent[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const es = new EventSource('/api/stream')
    es.onmessage = (e) => {
      try {
        const data: IslandEvent = JSON.parse(e.data)
        setEvents((prev) => [data, ...prev].slice(0, 5))
        setVisible(true)
      } catch { /* ignore malformed */ }
    }
    return () => es.close()
  }, [])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(t)
  }, [visible, events])

  if (!visible || events.length === 0) return null

  const latest = events[0]

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none" style={{ minWidth: 300 }}>
      <div
        className="rounded-2xl px-4 py-2.5 shadow-xl backdrop-blur-sm"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        {events.length === 1 ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold uppercase tracking-wide text-[10px]"
              style={{ color: ROLE_COLOR[latest.role ?? ''] ?? 'var(--muted-fg)' }}>
              {latest.role ?? 'system'}
            </span>
            <span style={{ color: 'var(--subtle)' }}>·</span>
            <span style={{ color: 'var(--muted-fg)' }}>{latest.event}</span>
            {latest.detail && (
              <span className="truncate max-w-[160px]" style={{ color: 'var(--subtle)' }}>{latest.detail}</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold" style={{ color: 'var(--accent)' }}>{events.length} events</span>
            <span style={{ color: 'var(--subtle)' }}>·</span>
            <span style={{ color: ROLE_COLOR[latest.role ?? ''] ?? 'var(--muted-fg)' }}>{latest.role}</span>
            <span style={{ color: 'var(--muted-fg)' }}>{latest.event}</span>
          </div>
        )}
      </div>
    </div>
  )
}
