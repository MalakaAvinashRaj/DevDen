'use client'

import { useEffect, useState } from 'react'
import { FactoryCanvas } from '@/components/canvas/FactoryCanvas'
import type { Mission, Job } from '@/lib/db-store'

export default function CanvasPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    fetch('/api/missions')
      .then((r) => r.json())
      .then((d) => {
        const list: Mission[] = d.missions ?? []
        setMissions(list)
        if (list.length > 0) setSelectedId(list[0].id)
      })
  }, [])

  useEffect(() => {
    if (!selectedId) return
    fetch(`/api/jobs?mission_id=${selectedId}`)
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []))

    const t = setInterval(() => {
      fetch(`/api/jobs?mission_id=${selectedId}`)
        .then((r) => r.json())
        .then((d) => setJobs(d.jobs ?? []))
    }, 3000)
    return () => clearInterval(t)
  }, [selectedId])

  const selected = missions.find((m) => m.id === selectedId)

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold text-zinc-100">Factory</h1>
        {missions.length > 0 && (
          <select
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            {missions.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        )}
      </div>

      {missions.length === 0 ? (
        <div className="text-center py-24 text-zinc-600 text-sm">No missions yet. Create one from the dashboard.</div>
      ) : (
        <FactoryCanvas jobs={jobs} missionName={selected?.name} />
      )}
    </div>
  )
}
