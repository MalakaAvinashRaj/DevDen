'use client'

import type { Validation } from '@/lib/db-store'

const VERDICT_STYLE = {
  PASS:    'bg-emerald-900 text-emerald-300',
  PARTIAL: 'bg-amber-900 text-amber-300',
  FAIL:    'bg-red-900 text-red-300',
}

export function ValidationList({ items }: { items: Validation[] }) {
  if (items.length === 0) {
    return <p className="text-xs text-zinc-600 py-8 text-center">No validations yet.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((v) => (
        <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-300 font-medium">{v.milestone}</span>
              <span className="text-[10px] text-zinc-600">{v.mode}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${VERDICT_STYLE[v.verdict] ?? 'bg-zinc-700 text-zinc-300'}`}>
              {v.verdict}
            </span>
          </div>
          {v.score !== null && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${v.verdict === 'PASS' ? 'bg-emerald-500' : v.verdict === 'PARTIAL' ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${(v.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500">{v.score.toFixed(1)} / 5</span>
            </div>
          )}
          <p className="text-[10px] text-zinc-600 mt-2">{new Date(v.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}
