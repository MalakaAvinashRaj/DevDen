'use client'

import type { Activity } from '@/lib/db-store'

const ROLE_COLOR: Record<string, string> = {
  orchestrator: 'text-violet-400',
  worker:       'text-blue-400',
  validator:    'text-amber-400',
  supervisor:   'text-emerald-400',
}

export function ActivityFeed({ items }: { items: Activity[] }) {
  if (items.length === 0) {
    return <p className="text-xs text-zinc-600 py-8 text-center">No activity yet.</p>
  }

  return (
    <div className="flex flex-col gap-0.5">
      {items.map((a) => (
        <div key={a.id} className="flex items-start gap-3 py-2 border-b border-zinc-800/50 last:border-0">
          <span className="text-[10px] text-zinc-600 shrink-0 pt-0.5 w-16">
            {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className={`text-[10px] font-semibold uppercase shrink-0 w-20 ${ROLE_COLOR[a.role] ?? 'text-zinc-400'}`}>
            {a.role}
          </span>
          <span className="text-xs text-zinc-400">{a.event}</span>
          {a.detail && <span className="text-xs text-zinc-600 truncate">{a.detail}</span>}
        </div>
      ))}
    </div>
  )
}
