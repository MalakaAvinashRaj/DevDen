'use client'

import { useEffect, useState } from 'react'
import { MissionCard } from '@/components/dashboard/MissionCard'
import { NewMissionModal } from '@/components/dashboard/NewMissionModal'
import type { Mission } from '@/lib/db-store'

export default function DashboardPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/missions')
      const data = await res.json()
      setMissions(data.missions ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleCreated(mission: Mission) {
    setMissions((prev) => [mission, ...prev])
    setShowModal(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Missions</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-fg)' }}>Each mission is a product built by your factory.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-white text-xs font-medium rounded-lg transition-colors"
          style={{ background: 'var(--accent)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        >
          + New Mission
        </button>
      </div>

      {loading ? (
        <div className="text-xs py-16 text-center" style={{ color: 'var(--subtle)' }}>Loading…</div>
      ) : missions.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm mb-2" style={{ color: 'var(--muted-fg)' }}>No missions yet.</p>
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>Create your first mission to start the factory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {missions.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </div>
      )}

      {showModal && (
        <NewMissionModal onCreated={handleCreated} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
