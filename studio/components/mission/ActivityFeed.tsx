'use client'

import type { Activity } from '@/lib/db-store'

const ROLE_COLOR: Record<string, string> = {
  orchestrator: '#a78bfa',
  worker:       '#60a5fa',
  validator:    '#fbbf24',
  supervisor:   '#34d399',
}

export function ActivityFeed({ items }: { items: Activity[] }) {
  if (items.length === 0) {
    return <p className="text-xs py-8 text-center" style={{ color: 'var(--subtle)' }}>No activity yet.</p>
  }

  return (
    <div className="flex flex-col">
      {items.map((a, i) => (
        <div
          key={a.id}
          className="flex items-start gap-3 py-2.5"
          style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}
        >
          <span className="text-[10px] shrink-0 pt-0.5 w-14 tabular-nums" style={{ color: 'var(--subtle)' }}>
            {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span
            className="text-[10px] font-bold uppercase shrink-0 w-20 tracking-wide"
            style={{ color: ROLE_COLOR[a.role] ?? 'var(--muted-fg)' }}
          >
            {a.role}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted-fg)' }}>{a.event}</span>
          {a.detail && (
            <span className="text-xs truncate" style={{ color: 'var(--subtle)' }}>{a.detail}</span>
          )}
        </div>
      ))}
    </div>
  )
}
