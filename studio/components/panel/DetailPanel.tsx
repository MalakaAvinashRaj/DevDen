'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Agent, Task, ActivityEntry as ActivityLog } from '@/lib/fs-store'

export type PanelTab = 'tasks' | 'agents' | 'feed'

interface Props {
  open: boolean
  defaultTab?: PanelTab
  missionId?: string
  onClose: () => void
}

const STATUS_BADGE: Record<string, string> = {
  idle:          'bg-neutral-200 text-neutral-600',
  assigned:      'bg-amber-100 text-amber-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  blocked:       'bg-red-100 text-red-700',
  complete:      'bg-emerald-100 text-emerald-700',
  backlog:       'bg-neutral-200 text-neutral-600',
  todo:          'bg-sky-100 text-sky-700',
  review:        'bg-purple-100 text-purple-700',
  done:          'bg-emerald-100 text-emerald-600',
  'on-hold':     'bg-orange-100 text-orange-600',
}

const PRIORITY_COLOR: Record<string, string> = {
  P0: 'text-red-600 font-bold',
  P1: 'text-orange-500 font-semibold',
  P2: 'text-neutral-500',
  P3: 'text-neutral-400',
}

function timeAgo(dt: string) {
  const diff = (Date.now() - new Date(dt + 'Z').getTime()) / 1000
  if (diff < 60)    return `${Math.floor(diff)}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Task tree ──────────────────────────────────────────────────

function buildTree(filtered: Task[], all: Task[]) {
  const filteredIds = new Set(filtered.map(t => t.id))
  const parents: Task[] = []
  filtered.forEach(t => {
    if (t.parent_id && !filteredIds.has(t.parent_id)) {
      const parent = all.find(a => a.id === t.parent_id)
      if (parent && !parents.find(p => p.id === parent.id)) parents.push(parent)
    }
  })
  const pool    = [...parents, ...filtered]
  const poolIds = new Set(pool.map(t => t.id))
  const roots   = pool.filter(t => !t.parent_id || !poolIds.has(t.parent_id))
  const childrenOf = (id: string) => pool.filter(t => t.parent_id === id)
  return { roots, childrenOf }
}

function TaskRow({ task, children, childrenOf, isContextParent = false, depth = 0 }: {
  task: Task
  children: Task[]
  childrenOf: (id: string) => Task[]
  isContextParent?: boolean
  depth?: number
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = children.length > 0
  const doneCount   = children.filter(c => c.status === 'done').length
  const isOnHold    = task.status === 'on-hold'

  return (
    <div>
      <div className={`rounded-xl border px-3.5 py-2.5 ${
        isContextParent  ? 'border-neutral-200 bg-neutral-50 opacity-70'
        : depth === 0    ? 'border-neutral-200 bg-white'
                         : 'border-neutral-200 bg-neutral-50'
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5 min-w-0">
            {hasChildren && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded text-neutral-800 hover:bg-neutral-100 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  {expanded ? <path d="M2 5l5 5 5-5" /> : <path d="M5 2l5 5-5 5" />}
                </svg>
              </button>
            )}
            {!hasChildren && depth > 0 && (
              <span className="w-5 flex-shrink-0 flex items-center justify-center">
                <span className="w-3 h-px bg-neutral-300 inline-block" />
              </span>
            )}
            <span className={`text-sm leading-snug ${depth === 0 ? 'font-medium text-neutral-800' : 'text-neutral-600'}`}>
              {task.title}
            </span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ${STATUS_BADGE[task.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
            {task.status}
          </span>
        </div>

        {isOnHold && hasChildren && (
          <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
            <span>⏸</span> waiting on subtasks · {doneCount}/{children.length} done
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-neutral-400">
          <span className={PRIORITY_COLOR[task.priority] ?? ''}>{task.priority}</span>
          <span>·</span>
          <span className="font-mono">{task.id}</span>
          {task.assignee && <><span>·</span><span className="truncate">{task.assignee}</span></>}
          {hasChildren  && <><span>·</span><span className="text-neutral-500">{doneCount}/{children.length} done</span></>}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-neutral-200 pl-3">
          {children.map(child => (
            <TaskRow key={child.id} task={child} children={childrenOf(child.id)} childrenOf={childrenOf} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main panel ─────────────────────────────────────────────────

export default function DetailPanel({ open, defaultTab = 'tasks', missionId, onClose }: Props) {
  const [tab, setTab]               = useState<PanelTab>(defaultTab)
  const [agents, setAgents]         = useState<Agent[]>([])
  const [tasks, setTasks]           = useState<Task[]>([])
  const [feed, setFeed]             = useState<(ActivityLog & { agent_name?: string })[]>([])
  const [taskFilter, setTaskFilter] = useState<string>('active')
  const [running, setRunning]       = useState<string[]>([])

  useEffect(() => { setTab(defaultTab) }, [defaultTab])

  const fetchAll = useCallback(async () => {
    const activityUrl = missionId ? `/api/activity?missionId=${missionId}` : '/api/activity'
    const [a, t, f, s] = await Promise.all([
      fetch('/api/agents').then(r => r.json()).catch(() => []),
      fetch('/api/tasks').then(r => r.json()).catch(() => []),
      fetch(activityUrl).then(r => r.json()).catch(() => []),
      fetch('/api/supervisor').then(r => r.json()).catch(() => ({ running: [] })),
    ])
    setAgents(a); setTasks(t); setFeed(f); setRunning(s.running ?? [])
  }, [missionId])

  useEffect(() => {
    if (!open) return
    fetchAll()
    const iv = setInterval(fetchAll, 3000)
    return () => clearInterval(iv)
  }, [open, fetchAll])

  // ── Mission-scoped task filters ──
  const scopedTasks  = missionId ? tasks.filter(t => t.mission_id === missionId) : tasks
  const activeTasks  = scopedTasks.filter(t => ['todo', 'in-progress', 'review', 'on-hold', 'blocked'].includes(t.status))
  const doneTasks    = scopedTasks.filter(t => t.status === 'done')
  const filtered     = taskFilter === 'active' ? activeTasks : taskFilter === 'done' ? doneTasks : scopedTasks
  const { roots, childrenOf } = buildTree(filtered, scopedTasks)

  return (
    <div
      className="bg-white"
      onWheel={e => e.stopPropagation()}
    >
      <div className="overflow-y-auto max-h-[70vh]">

        {/* ── TASKS ── */}
        {tab === 'tasks' && (
          <div className="p-4 space-y-3">
            {missionId && (
              <p className="text-xs font-mono text-blue-500 bg-blue-50 px-2.5 py-1.5 rounded-lg">{missionId}</p>
            )}
            <div className="flex gap-1.5">
              {[
                ['active', `Active ${activeTasks.length}`],
                ['done',   `Done ${doneTasks.length}`],
                ['all',    `All ${scopedTasks.length}`],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setTaskFilter(val)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${taskFilter === val ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {roots.length === 0
              ? <p className="text-sm text-neutral-400 text-center py-10">No tasks</p>
              : <div className="space-y-2">
                  {roots.map(task => {
                    const filteredIds = new Set(filtered.map(t => t.id))
                    return (
                      <TaskRow
                        key={task.id}
                        task={task}
                        children={childrenOf(task.id)}
                        childrenOf={childrenOf}
                        isContextParent={!filteredIds.has(task.id)}
                      />
                    )
                  })}
                </div>
            }
          </div>
        )}

        {/* ── AGENTS ── */}
        {tab === 'agents' && (
          <div className="p-4 space-y-3">
            {(() => {
              // When a mission is selected, only show agents that have tasks in it or are running
              const agentsWithMissionTasks = new Set(scopedTasks.map(t => t.assignee).filter(Boolean))
              const visibleAgents = missionId
                ? agents.filter(a => a.id === 'cpe' || agentsWithMissionTasks.has(a.id) || running.includes(a.id))
                : agents

              if (visibleAgents.length === 0) {
                return <p className="text-sm text-neutral-400 text-center py-10">No agents active on this mission yet</p>
              }

              return visibleAgents.map(agent => {
                const isRunning  = running.includes(agent.id)
                const agentTasks = scopedTasks.filter(t =>
                  t.assignee === agent.id && ['todo', 'in-progress', 'review'].includes(t.status)
                )
                return (
                  <div key={agent.id} className={`rounded-xl border px-3.5 py-3 space-y-2 ${isRunning ? 'border-neutral-300 bg-neutral-50' : 'border-neutral-200 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isRunning && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />}
                        <span className="text-sm font-semibold text-neutral-800">{agent.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[agent.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                        {agent.status}
                      </span>
                    </div>
                    {agentTasks.length > 0 ? (
                      <div className="space-y-1 pt-0.5">
                        {agentTasks.slice(0, 3).map(t => (
                          <div key={t.id} className="flex items-center gap-1.5 text-xs">
                            <span className={PRIORITY_COLOR[t.priority]}>{t.priority}</span>
                            <span className="text-neutral-500 truncate">{t.title}</span>
                          </div>
                        ))}
                        {agentTasks.length > 3 && <p className="text-xs text-neutral-400">+{agentTasks.length - 3} more</p>}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400">No active tasks on this mission</p>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        )}

        {/* ── LOGS ── */}
        {tab === 'feed' && (
          <div className="p-4">
            {missionId && (
              <p className="text-xs font-mono text-blue-500 bg-blue-50 px-2.5 py-1.5 rounded-lg mb-3">{missionId}</p>
            )}
            {feed.length === 0
              ? <p className="text-sm text-neutral-400 text-center py-10">No activity yet — agents will log here as they work.</p>
              : <div className="space-y-0">
                  {feed.map((entry, i) => {
                    const agentColor: Record<string, string> = {
                      cpe: 'text-violet-600 bg-violet-50',
                      'software-engineer': 'text-blue-600 bg-blue-50',
                      qa: 'text-amber-600 bg-amber-50',
                      architect: 'text-cyan-600 bg-cyan-50',
                      'ui-ux': 'text-pink-600 bg-pink-50',
                      eval: 'text-neutral-600 bg-neutral-100',
                    }
                    const pill = agentColor[entry.agent_id ?? ''] ?? 'text-neutral-600 bg-neutral-100'
                    return (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-[5px]" />
                          {i < feed.length - 1 && <div className="w-px flex-1 bg-neutral-100 min-h-[20px]" />}
                        </div>
                        <div className="pb-3 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.agent_name && (
                              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${pill}`}>
                                {entry.agent_name}
                              </span>
                            )}
                            <span className="text-xs text-neutral-700 leading-snug">{entry.event}</span>
                            <span className="text-xs text-neutral-400 ml-auto flex-shrink-0">{timeAgo(entry.created_at)}</span>
                          </div>
                          {entry.detail && (
                            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">{entry.detail}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
            }
          </div>
        )}

      </div>
    </div>
  )
}
