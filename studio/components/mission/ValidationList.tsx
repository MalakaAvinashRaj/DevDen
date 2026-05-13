'use client'

import type { Validation } from '@/lib/db-store'

const VERDICT_COLORS = {
  PASS:    { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
  PARTIAL: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  FAIL:    { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444' },
}

const BAR_COLOR = {
  PASS:    '#10b981',
  PARTIAL: '#f59e0b',
  FAIL:    '#ef4444',
}

export function ValidationList({ items }: { items: Validation[] }) {
  if (items.length === 0) {
    return <p className="text-xs py-8 text-center" style={{ color: 'var(--subtle)' }}>No validations yet.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((v) => {
        const vc = VERDICT_COLORS[v.verdict] ?? { bg: 'var(--card-alt)', text: 'var(--muted-fg)' }
        return (
          <div key={v.id} className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{v.milestone}</span>
                <span className="text-[10px]" style={{ color: 'var(--subtle)' }}>{v.mode}</span>
              </div>
              <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: vc.bg, color: vc.text }}
              >
                {v.verdict}
              </span>
            </div>
            {v.score !== null && (
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-alt)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(v.score / 5) * 100}%`, background: BAR_COLOR[v.verdict] ?? '#94a3b8' }}
                  />
                </div>
                <span className="text-[10px] tabular-nums" style={{ color: 'var(--subtle)' }}>{v.score.toFixed(1)} / 5</span>
              </div>
            )}
            <p className="text-[10px] mt-2" style={{ color: 'var(--subtle)' }}>{new Date(v.created_at).toLocaleString()}</p>
          </div>
        )
      })}
    </div>
  )
}
