'use client'

import type { Job } from '@/lib/db-store'

interface AgentNodeProps {
  role: 'orchestrator' | 'worker' | 'validator'
  jobs: Job[]
}

const ROLE_COLOR = {
  orchestrator: { ring: 'border-violet-600', dot: 'bg-violet-400', label: 'text-violet-400', glow: 'shadow-violet-900' },
  worker:       { ring: 'border-blue-600',   dot: 'bg-blue-400',   label: 'text-blue-400',   glow: 'shadow-blue-900' },
  validator:    { ring: 'border-amber-600',  dot: 'bg-amber-400',  label: 'text-amber-400',  glow: 'shadow-amber-900' },
}

function AgentNode({ role, jobs }: AgentNodeProps) {
  const active = jobs.filter((j) => j.role === role && j.status === 'running')
  const done   = jobs.filter((j) => j.role === role && j.status === 'done')
  const failed = jobs.filter((j) => j.role === role && j.status === 'failed')
  const isLive = active.length > 0
  const c = ROLE_COLOR[role]

  return (
    <div className={`relative flex flex-col items-center gap-3 bg-zinc-900 border-2 ${c.ring} rounded-2xl px-8 py-6 w-48 shadow-lg ${isLive ? c.glow : ''} transition-shadow`}>
      {/* Live pulse */}
      {isLive && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
        </span>
      )}

      <span className={`text-[10px] font-bold uppercase tracking-widest ${c.label}`}>{role}</span>

      <div className="text-center">
        {isLive ? (
          <>
            <div className="text-xs text-zinc-200 font-medium">Running</div>
            {active[0]?.feature && (
              <div className="text-[10px] text-zinc-500 mt-1 max-w-[120px] truncate">{active[0].feature}</div>
            )}
          </>
        ) : (
          <div className="text-xs text-zinc-600">Idle</div>
        )}
      </div>

      <div className="flex gap-3 text-[10px] text-zinc-600">
        <span className="text-emerald-500">{done.length} done</span>
        {failed.length > 0 && <span className="text-red-400">{failed.length} failed</span>}
      </div>
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex items-center gap-1 text-zinc-700 text-lg select-none">
      <div className="w-8 h-px bg-zinc-700" />
      <span>›</span>
    </div>
  )
}

interface Props {
  jobs: Job[]
  missionName?: string
}

export function FactoryCanvas({ jobs, missionName }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      {missionName && (
        <p className="text-xs text-zinc-500 uppercase tracking-widest">{missionName}</p>
      )}
      <div className="flex items-center gap-2">
        <AgentNode role="orchestrator" jobs={jobs} />
        <Arrow />
        <AgentNode role="worker" jobs={jobs} />
        <Arrow />
        <AgentNode role="validator" jobs={jobs} />
      </div>
      <p className="text-[10px] text-zinc-700">Serial execution · one worker at a time</p>
    </div>
  )
}
