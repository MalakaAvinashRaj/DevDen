'use client'

import Link from 'next/link'
import type { Mission } from '@/lib/db-store'

const PHASE_COLOR: Record<string, { bg: string; text: string }> = {
  scoping:    { bg: '#e0f2fe', text: '#0369a1' },
  building:   { bg: '#dbeafe', text: '#1d4ed8' },
  validating: { bg: '#fef9c3', text: '#a16207' },
  shipped:    { bg: '#d1fae5', text: '#065f46' },
  failed:     { bg: '#fee2e2', text: '#991b1b' },
}

const PHASE_COLOR_DARK: Record<string, string> = {
  scoping:    'dark-phase-zinc',
  building:   'dark-phase-blue',
  validating: 'dark-phase-amber',
  shipped:    'dark-phase-emerald',
  failed:     'dark-phase-red',
}

export function MissionCard({ mission }: { mission: Mission }) {
  const phase = PHASE_COLOR[mission.phase]

  return (
    <Link
      href={`/missions/${mission.id}`}
      className="block rounded-xl p-5 transition-all duration-200 group"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-alt)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold transition-colors" style={{ color: 'var(--foreground)' }}>
          {mission.name}
        </h2>
        {/* Phase badge — uses inline vars for proper light/dark */}
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 dark:!bg-opacity-20"
          style={{
            background: `color-mix(in srgb, var(--accent) 15%, var(--card-alt))`,
            color: 'var(--accent)',
          }}
        >
          {mission.phase}
        </span>
      </div>

      {mission.goal && (
        <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--muted-fg)' }}>{mission.goal}</p>
      )}

      <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--subtle)' }}>
        <span className="truncate max-w-[120px]">{mission.folder}</span>
        <span>{new Date(mission.created_at).toLocaleDateString()}</span>
      </div>
    </Link>
  )
}
