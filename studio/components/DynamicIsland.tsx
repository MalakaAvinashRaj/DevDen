'use client'

import { useEffect, useState } from 'react'

interface IslandEvent {
  id: string
  role: string
  event: string
  detail?: string
  mission?: string
}

export function DynamicIsland() {
  const [events, setEvents] = useState<IslandEvent[]>([])
  const [visible, setVisible] = useState(false)

  // Exposed globally so SSE handler can push events
  useEffect(() => {
    const handler = (e: CustomEvent<IslandEvent>) => {
      setEvents((prev) => {
        const next = [e.detail, ...prev].slice(0, 5)
        return next
      })
      setVisible(true)
    }
    window.addEventListener('devden:activity', handler as EventListener)
    return () => window.removeEventListener('devden:activity', handler as EventListener)
  }, [])

  // Auto-hide after 6s of no new events
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(t)
  }, [visible, events])

  if (!visible || events.length === 0) return null

  const latest = events[0]
  const roleColor: Record<string, string> = {
    orchestrator: 'text-violet-400',
    worker: 'text-blue-400',
    validator: 'text-amber-400',
    supervisor: 'text-emerald-400',
  }

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{ minWidth: 280 }}
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-2.5 shadow-xl shadow-black/50 backdrop-blur-sm">
        {events.length === 1 ? (
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-semibold uppercase tracking-wide ${roleColor[latest.role] ?? 'text-zinc-400'}`}>
              {latest.role}
            </span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-300">{latest.event}</span>
            {latest.detail && (
              <span className="text-zinc-500 truncate max-w-[160px]">{latest.detail}</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-semibold">{events.length} events</span>
            <span className="text-zinc-500">·</span>
            <span className={roleColor[latest.role] ?? 'text-zinc-400'}>{latest.role}</span>
            <span className="text-zinc-300">{latest.event}</span>
          </div>
        )}
      </div>
    </div>
  )
}
