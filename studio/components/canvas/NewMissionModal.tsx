'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function NewMissionModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [brief, setBrief] = useState('')
  const [users, setUsers] = useState('')
  const [stack, setStack] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !goal.trim() || !brief.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: true, name: name.trim(), goal: goal.trim(), brief: brief.trim(), users: users.trim() || undefined, stack: stack.trim() || undefined }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Something went wrong')
        return
      }
      onCreated()
      onClose()
    } catch {
      setError('Network error — is the server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onMouseDown={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">New Mission</h2>
              <p className="text-sm text-neutral-500 mt-0.5">Scaffold a new project for the factory</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="Mission name" required>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Link Vault, Invoice Ninja, Habit Tracker"
              className="w-full text-sm text-neutral-900 rounded-xl border border-neutral-200 px-3.5 py-2.5 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              autoFocus
            />
          </Field>

          <Field label="Goal — what does done look like?" required>
            <input
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. A deployed app that lets users save and tag links"
              className="w-full text-sm text-neutral-900 rounded-xl border border-neutral-200 px-3.5 py-2.5 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </Field>

          <Field label="What does it do?" required>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              rows={3}
              placeholder="Explain the product as if briefing someone new. What problem does it solve? What can users do with it?"
              className="w-full text-sm text-neutral-900 rounded-xl border border-neutral-200 px-3.5 py-2.5 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Who uses it">
              <input
                type="text"
                value={users}
                onChange={e => setUsers(e.target.value)}
                placeholder="e.g. developers, freelancers"
                className="w-full text-sm text-neutral-900 rounded-xl border border-neutral-200 px-3.5 py-2.5 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </Field>
            <Field label="Tech stack">
              <input
                type="text"
                value={stack}
                onChange={e => setStack(e.target.value)}
                placeholder="e.g. Next.js + Postgres"
                className="w-full text-sm text-neutral-900 rounded-xl border border-neutral-200 px-3.5 py-2.5 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </Field>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !goal.trim() || !brief.trim()}
              className="px-4 py-2 text-sm rounded-xl bg-neutral-900 text-white font-medium hover:bg-neutral-700 transition-colors disabled:opacity-40"
            >
              {loading ? 'Creating…' : 'Create mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-neutral-600">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
