'use client'

import { useState } from 'react'
import type { Mission, Task } from '@/lib/fs-store'

interface Props {
  mission: Mission
  tasks: Task[]
  onClose: () => void
  onShipped: () => void
}

export default function ShipMissionModal({ mission, tasks, onClose, onShipped }: Props) {
  const [notes, setNotes]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const done    = tasks.filter(t => t.status === 'done').length
  const total   = tasks.length
  const open    = tasks.filter(t => ['todo', 'in-progress', 'review', 'blocked'].includes(t.status))
  const hasOpen = open.length > 0

  async function handleShip() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/missions/${mission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', deliveryNotes: notes.trim() }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Something went wrong')
        return
      }
      onShipped()
      onClose()
    } catch {
      setError('Network error — is the server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" onMouseDown={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-neutral-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono text-neutral-400">{mission.id}</span>
              </div>
              <h2 className="text-base font-semibold text-neutral-900">Ship mission</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{mission.name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Task completion summary */}
          <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Task completion</span>
              <span className={`text-sm font-semibold ${done === total && total > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {done} / {total} done
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
              />
            </div>

            {/* Open tasks warning */}
            {hasOpen && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
                <p className="text-xs font-medium text-amber-700 mb-1.5">
                  {open.length} task{open.length !== 1 ? 's' : ''} still open
                </p>
                <div className="space-y-1">
                  {open.slice(0, 4).map(t => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-amber-600">
                      <span className="font-mono">{t.id}</span>
                      <span className="truncate">{t.title}</span>
                      <span className="ml-auto flex-shrink-0 opacity-70">{t.status}</span>
                    </div>
                  ))}
                  {open.length > 4 && (
                    <p className="text-xs text-amber-500">+{open.length - 4} more</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delivery notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600">
              Delivery notes <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="What shipped? Any caveats, known issues, or next steps for this product?"
              className="w-full text-sm text-neutral-900 rounded-xl border border-neutral-200 px-3.5 py-2.5 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between gap-3">
          <p className="text-xs text-neutral-400">
            Mission folder moves to <span className="font-mono">missions/completed/</span>
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShip}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {loading ? 'Shipping…' : (
                <>
                  Ship
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 11L11 1M11 1H4M11 1V8" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
