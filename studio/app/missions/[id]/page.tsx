'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ActivityFeed } from '@/components/mission/ActivityFeed'
import { ValidationList } from '@/components/mission/ValidationList'
import { FactoryCanvas } from '@/components/canvas/FactoryCanvas'
import type { Mission, Task, Activity, Validation, Job } from '@/lib/db-store'

type Tab = 'overview' | 'activity' | 'validations'

const PHASE_COLOR: Record<string, string> = {
  scoping:    'bg-zinc-700 text-zinc-300',
  building:   'bg-blue-900 text-blue-300',
  validating: 'bg-amber-900 text-amber-300',
  shipped:    'bg-emerald-900 text-emerald-300',
  failed:     'bg-red-900 text-red-300',
}

const TASK_STATUS_COLOR: Record<string, string> = {
  pending:     'text-zinc-500',
  in_progress: 'text-blue-400',
  done:        'text-emerald-400',
  blocked:     'text-red-400',
}

export default function MissionDetailPage() {
  const params = useParams()
  const id = Number(params.id)

  const [mission, setMission] = useState<Mission | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [validations, setValidations] = useState<Validation[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)

  async function load() {
    const [detail, jobsRes] = await Promise.all([
      fetch(`/api/missions/${id}`).then((r) => r.json()),
      fetch(`/api/jobs?mission_id=${id}`).then((r) => r.json()),
    ])
    setMission(detail.mission ?? null)
    setTasks(detail.tasks ?? [])
    setActivity(detail.activity ?? [])
    setValidations(detail.validations ?? [])
    setJobs(jobsRes.jobs ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [id])

  if (loading) return <div className="text-xs text-zinc-600 text-center py-24">Loading…</div>
  if (!mission) return <div className="text-xs text-red-400 text-center py-24">Mission not found.</div>

  const doneTasks = tasks.filter((t) => t.status === 'done').length

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] text-zinc-600 mb-6">
        <Link href="/" className="hover:text-zinc-400">Missions</Link>
        <span>›</span>
        <span className="text-zinc-400">{mission.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">{mission.name}</h1>
          <p className="text-xs text-zinc-600 mt-1">{mission.folder}</p>
          {mission.goal && <p className="text-sm text-zinc-400 mt-2 max-w-xl">{mission.goal}</p>}
        </div>
        <span className={`text-[10px] font-medium px-3 py-1 rounded-full shrink-0 ${PHASE_COLOR[mission.phase] ?? 'bg-zinc-700 text-zinc-300'}`}>
          {mission.phase}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 mb-6">
        {(['overview', 'activity', 'validations'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'activity' && activity.length > 0 && (
              <span className="ml-1.5 text-[10px] text-zinc-600">{activity.length}</span>
            )}
            {t === 'validations' && validations.length > 0 && (
              <span className="ml-1.5 text-[10px] text-zinc-600">{validations.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tasks</h2>
              {tasks.length > 0 && (
                <span className="text-[10px] text-zinc-600">{doneTasks} / {tasks.length} done</span>
              )}
            </div>
            {tasks.length === 0 ? (
              <p className="text-xs text-zinc-600 py-6">No tasks yet — Orchestrator will create them.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                    <span className={`text-[10px] w-16 shrink-0 ${TASK_STATUS_COLOR[task.status] ?? 'text-zinc-500'}`}>
                      {task.status}
                    </span>
                    <span className="text-xs text-zinc-300 flex-1">{task.title}</span>
                    {task.milestone && (
                      <span className="text-[10px] text-zinc-600">{task.milestone}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Factory snapshot */}
          <div>
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Factory</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-x-auto">
              <FactoryCanvas jobs={jobs} />
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && <ActivityFeed items={activity} />}
      {tab === 'validations' && <ValidationList items={validations} />}
    </div>
  )
}
