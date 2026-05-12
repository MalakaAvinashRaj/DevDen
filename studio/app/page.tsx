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
          <h1 className="text-lg font-semibold text-zinc-100">Missions</h1>
          <p className="text-xs text-zinc-500 mt-1">Each mission is a product built by your factory.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
        >
          + New Mission
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-zinc-600 py-16 text-center">Loading…</div>
      ) : missions.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-zinc-600 text-sm mb-2">No missions yet.</p>
          <p className="text-zinc-700 text-xs">Create your first mission to start the factory.</p>
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
