'use client'

import Link from 'next/link'
import type { Mission } from '@/lib/db-store'

const PHASE_COLOR: Record<string, string> = {
  scoping:    'bg-zinc-700 text-zinc-300',
  building:   'bg-blue-900 text-blue-300',
  validating: 'bg-amber-900 text-amber-300',
  shipped:    'bg-emerald-900 text-emerald-300',
  failed:     'bg-red-900 text-red-300',
}

export function MissionCard({ mission }: { mission: Mission }) {
  return (
    <Link
      href={`/missions/${mission.id}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
          {mission.name}
        </h2>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${PHASE_COLOR[mission.phase] ?? 'bg-zinc-700 text-zinc-300'}`}>
          {mission.phase}
        </span>
      </div>

      {mission.goal && (
        <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{mission.goal}</p>
      )}

      <div className="flex items-center justify-between text-[10px] text-zinc-600">
        <span>{mission.folder}</span>
        <span>{new Date(mission.created_at).toLocaleDateString()}</span>
      </div>
    </Link>
  )
}
