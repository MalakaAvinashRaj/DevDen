'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useCanvasControls } from '@/lib/useCanvasControls'
import AgentNode from './AgentNode'
import CanvasControls from './CanvasControls'
import DetailPanel from '@/components/panel/DetailPanel'
import NewMissionModal from './NewMissionModal'
import ShipMissionModal from './ShipMissionModal'
import type { PanelTab } from '@/components/panel/DetailPanel'
import type { Agent, Task, Mission } from '@/lib/fs-store'

interface CanvasData {
  agents: Agent[]
  tasks: Task[]
  missions: Mission[]
}

export default function Canvas() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const { transform, actions } = useCanvasControls({ x: 0, y: 0, zoom: 0.85 })
  const [data, setData] = useState<CanvasData>({ agents: [], tasks: [], missions: [] })
  const [loading, setLoading] = useState(true)
  const [runningAgents, setRunningAgents] = useState<string[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelTab, setPanelTab] = useState<PanelTab>('tasks')
  const [newMissionOpen, setNewMissionOpen] = useState(false)
  const [shipMissionOpen, setShipMissionOpen] = useState(false)
  // Mission board state
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const isPanning = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  async function fetchAll() {
    const [agents, tasks, missions, supervisor] = await Promise.all([
      fetch('/api/agents').then(r => r.json()),
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/missions').then(r => r.json()),
      fetch('/api/supervisor').then(r => r.json()).catch(() => ({ running: [] })),
    ])
    setData({ agents, tasks, missions })
    setRunningAgents(supervisor.running ?? [])
    setLoading(false)
  }

  function openPanel(tab: PanelTab) {
    setPanelTab(tab)
    setPanelOpen(true)
  }

  // Default to first mission when data loads
  useEffect(() => {
    if (data.missions.length > 0 && selectedMissionId === null) {
      setSelectedMissionId(data.missions[0].id)
    }
  }, [data.missions, selectedMissionId])

  useEffect(() => {
    fetchAll()
    const iv = setInterval(fetchAll, 5000)
    return () => clearInterval(iv)
  }, [])

  // ── Kill all running Hermes agents ──
  async function killAllAgents() {
    await fetch('/api/supervisor', { method: 'DELETE' })
    setRunningAgents([])
  }

  // ── Pan controls ──
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      isPanning.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
      e.preventDefault()
    }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }
    actions.pan(dx, dy)
  }, [actions])

  const onMouseUp = useCallback(() => { isPanning.current = false }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    // Only handle pinch-to-zoom (ctrlKey=true on macOS trackpad pinch)
    // Regular 2-finger scroll is ignored so it doesn't zoom
    if (!e.ctrlKey) return
    e.preventDefault()
    const delta = -e.deltaY * 0.01
    actions.setTransform(t => ({
      ...t,
      zoom: Math.max(0.2, Math.min(3, t.zoom + delta)),
    }))
  }, [actions])

  async function wakeAgent(id: string) {
    await fetch(`/api/agents/${id}/wake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
  }

  async function moveAgent(id: string, x: number, y: number) {
    await fetch(`/api/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canvas_x: x, canvas_y: y }),
    })
    setData(d => ({ ...d, agents: d.agents.map(a => a.id === id ? { ...a, canvas_x: x, canvas_y: y } : a) }))
  }

  function fitToView() {
    actions.setTransform({ x: 80, y: 60, zoom: 0.9 })
  }

  function tidyLayout() {
    const ORDER = ['software-engineer', 'qa']
    const NODE_W = 224, GAP = 24, ROW_Y = 360, startX = 60
    const rowTotal = ORDER.length * NODE_W + (ORDER.length - 1) * GAP
    const cpex = startX + rowTotal / 2 - NODE_W / 2
    const updates = [
      { id: 'cpe', x: cpex, y: 60 },
      ...ORDER.map((id, i) => ({ id, x: startX + i * (NODE_W + GAP), y: ROW_Y })),
    ]
    updates.forEach(u => moveAgent(u.id, u.x, u.y))
  }

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const isDragging = useRef<string | null>(null)

  useEffect(() => {
    setPositions(prev => {
      const next = { ...prev }
      data.agents.forEach(a => {
        if (isDragging.current !== a.id) {
          next[a.id] = { x: a.canvas_x ?? 100, y: a.canvas_y ?? 100 }
        }
      })
      return next
    })
  }, [data.agents])

  function handleDragMove(id: string, x: number, y: number) {
    isDragging.current = id
    setPositions(prev => ({ ...prev, [id]: { x, y } }))
  }

  async function handleDragEnd(id: string, x: number, y: number) {
    isDragging.current = null
    await moveAgent(id, x, y)
  }

  // ── Mission-scoped task view ──
  // Only show tasks belonging to the selected mission on agent cards + panels
  const missionTasks = selectedMissionId
    ? data.tasks.filter(t => t.mission_id === selectedMissionId)
    : data.tasks

  const tasksByAgent = missionTasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (t.assignee) acc[t.assignee] = [...(acc[t.assignee] ?? []), t]
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
        Loading DevDen factory…
      </div>
    )
  }

  const selectedMission = data.missions.find(m => m.id === selectedMissionId)

  return (
    <div
      ref={viewportRef}
      className="flex-1 overflow-hidden relative bg-neutral-50"
      style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      {/* Dot-grid background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.4 }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"
            patternTransform={`translate(${transform.x % 24} ${transform.y % 24})`}>
            <circle cx="1" cy="1" r="1" fill="#d4d4d8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Canvas layer */}
      <div
        className="absolute origin-top-left"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})` }}
      >
        {/* Mission cluster — highlight selected */}
        {data.missions.map(m => {
          const active = m.id === selectedMissionId
          return (
            <div
              key={m.id}
              className={`absolute rounded-2xl border border-dashed pointer-events-none transition-all duration-300 ${
                active
                  ? 'border-blue-300 bg-blue-50/20'
                  : 'border-neutral-200 bg-neutral-50/30 opacity-20'
              }`}
              style={{ left: 20, top: 20, width: 1360, height: 580 }}
            >
              <span className={`absolute top-3 left-4 text-sm font-mono transition-colors ${active ? 'text-blue-500 font-semibold' : 'text-neutral-400'}`}>
                {m.id} · {m.phase}
              </span>
            </div>
          )
        })}

        {/* Org tree connector lines */}
        <OrgLines agents={data.agents} positions={positions} />

        {/* Agent nodes — background agents (eval, architect, ui-ux) are excluded */}
        {data.agents.filter(a => !['eval', 'architect', 'ui-ux'].includes(a.id)).map(agent => (
          <AgentNode
            key={agent.id}
            agent={agent}
            tasks={tasksByAgent[agent.id] ?? []}
            onWake={wakeAgent}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            pos={positions[agent.id]}
            scale={transform.zoom}
            running={runningAgents.includes(agent.id)}
          />
        ))}
      </div>

      {/* Canvas controls (bottom-right) */}
      <div className="absolute bottom-6 right-6 z-10" onMouseDown={e => e.stopPropagation()}>
        <CanvasControls
          zoom={transform.zoom}
          actions={actions}
          onFitToView={fitToView}
          onTidy={tidyLayout}
        />
      </div>

      {/* ── Active Missions panel (bottom-left) ── */}
      <div className="absolute bottom-6 left-6 z-10 bg-white border border-neutral-200 rounded-2xl shadow-sm min-w-[240px]" onMouseDown={e => e.stopPropagation()}>

        {/* Header row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Active Missions</p>
          <button
            onClick={() => setNewMissionOpen(true)}
            className="w-6 h-6 flex items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 hover:border-neutral-500 hover:text-neutral-900 transition-colors"
            title="New mission"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5 1v8M1 5h8" />
            </svg>
          </button>
        </div>

        {/* Switch board button */}
        <div className="px-3 pb-2 relative">
          <button
            onClick={() => setSwitcherOpen(o => !o)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              switcherOpen
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-700'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 3h10M1 6h7M1 9h4" />
              <path d="M10 7l2 2-2 2" />
            </svg>
            <span>Switch board</span>
            {selectedMission && (
              <span className={`ml-auto font-mono truncate max-w-[90px] ${switcherOpen ? 'text-neutral-300' : 'text-blue-500'}`}>
                {selectedMission.id}
              </span>
            )}
          </button>

          {/* Mission picker dropdown */}
          {switcherOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSwitcherOpen(false)} />
              <div className="absolute left-3 right-3 bottom-full mb-2 bg-white border border-neutral-200 rounded-xl shadow-xl py-1.5 z-50 overflow-hidden">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-3 pt-1 pb-1.5">
                  Choose mission board
                </p>
                {data.missions.length === 0 ? (
                  <p className="text-xs text-neutral-400 px-3 py-2">No active missions</p>
                ) : (
                  data.missions.map(m => {
                    const isCurrent = m.id === selectedMissionId
                    const activeTasks = data.tasks.filter(t => t.mission_id === m.id && ['todo', 'in-progress', 'review'].includes(t.status))
                    return (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedMissionId(m.id); setSwitcherOpen(false) }}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors hover:bg-neutral-50 ${isCurrent ? 'bg-blue-50' : ''}`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isCurrent ? 'bg-blue-500' : 'bg-neutral-300'}`} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${isCurrent ? 'text-blue-700' : 'text-neutral-700'}`}>{m.id}</p>
                          <p className="text-xs text-neutral-400 truncate">{m.phase} · {activeTasks.length} active tasks</p>
                        </div>
                        {isCurrent && (
                          <svg className="flex-shrink-0 text-blue-500" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1.5 6l3 3 6-6" />
                          </svg>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-neutral-100 px-4 py-2 space-y-1">
          {/* Ship mission */}
          {selectedMission && (
            <button
              onClick={() => setShipMissionOpen(true)}
              className="w-full flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-800 transition-colors py-1 font-medium"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 11L11 1M11 1H4M11 1V8" />
              </svg>
              Ship {selectedMission.id}
            </button>
          )}
          {/* Stop running agents */}
          {runningAgents.length > 0 && (
            <button
              onClick={killAllAgents}
              className="w-full flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition-colors py-1"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l8 8M9 1L1 9" />
              </svg>
              Stop {runningAgents.length} running agent{runningAgents.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Click-outside overlay to close panel */}
      {panelOpen && (
        <div className="absolute inset-0 z-10" onClick={() => setPanelOpen(false)} />
      )}

      {/* Studio panel — anchored top-right */}
      <div className="absolute top-4 right-6 z-20 w-[380px] rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-white px-4 py-1.5 flex items-center justify-between gap-4">
          <span className="text-base font-bold text-neutral-700 whitespace-nowrap select-none">DevDen Studio</span>
          <div className="flex items-center bg-neutral-100 rounded-xl">
            {([
              { tab: 'agents' as PanelTab, label: 'Agents', dot: null },
              { tab: 'tasks'  as PanelTab, label: 'Tasks',  dot: null },
              { tab: 'feed'   as PanelTab, label: 'Logs',   dot: null },
            ] as { tab: PanelTab; label: string; dot: string | null }[]).map(({ tab, label, dot }) => {
              const active = panelOpen && panelTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => active ? setPanelOpen(false) : openPanel(tab)}
                  className={`flex items-center gap-1.5 text-base font-medium rounded-xl px-4 py-2.5 transition-all ${
                    active
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />}
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Panel content */}
        {panelOpen && (
          <DetailPanel
            open={panelOpen}
            defaultTab={panelTab}
            missionId={selectedMissionId ?? undefined}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>

      {/* New Mission modal */}
      {newMissionOpen && (
        <NewMissionModal
          onClose={() => setNewMissionOpen(false)}
          onCreated={fetchAll}
        />
      )}

      {/* Ship Mission modal */}
      {shipMissionOpen && selectedMission && (
        <ShipMissionModal
          mission={selectedMission}
          tasks={missionTasks}
          onClose={() => setShipMissionOpen(false)}
          onShipped={fetchAll}
        />
      )}
    </div>
  )
}

// ── Org tree connector lines ───────────────────────────────────
const NODE_W = 224
const NODE_H = 130

function OrgLines({ agents, positions }: { agents: Agent[]; positions: Record<string, { x: number; y: number }> }) {
  const cpe = agents.find(a => a.id === 'cpe')
  if (!cpe) return null

  const CANVAS_AGENTS = ['cpe', 'software-engineer', 'qa']
  const cpePos  = positions['cpe'] ?? { x: cpe.canvas_x ?? 100, y: cpe.canvas_y ?? 100 }
  const others  = agents.filter(a => CANVAS_AGENTS.includes(a.id) && a.id !== 'cpe')
  const cpeCx   = cpePos.x + NODE_W / 2
  const cpeBottom = cpePos.y + NODE_H

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: 0, top: 0, width: 2400, height: 1600, overflow: 'visible' }}
    >
      {others.map(agent => {
        const p    = positions[agent.id] ?? { x: agent.canvas_x ?? 100, y: agent.canvas_y ?? 100 }
        const ax   = p.x + NODE_W / 2
        const ay   = p.y
        const midY = (cpeBottom + ay) / 2
        return (
          <path
            key={agent.id}
            d={`M ${cpeCx} ${cpeBottom} C ${cpeCx} ${midY}, ${ax} ${midY}, ${ax} ${ay}`}
            fill="none"
            stroke="#c4c4cc"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
        )
      })}
    </svg>
  )
}
