'use client'

import { useEffect, useRef, useState } from 'react'
import type { Agent } from '@/lib/fs-store'

const STATUS_COLORS: Record<string, string> = {
  idle:         'bg-neutral-200 text-neutral-600 border-neutral-300',
  assigned:     'bg-amber-100 text-amber-700 border-amber-300',
  'in-progress':'bg-blue-100 text-blue-700 border-blue-300',
  blocked:      'bg-red-100 text-red-700 border-red-300',
  complete:     'bg-emerald-100 text-emerald-700 border-emerald-300',
}

const STATUS_DOT: Record<string, string> = {
  idle:         'bg-neutral-400',
  assigned:     'bg-amber-400',
  'in-progress':'bg-blue-500 animate-pulse',
  blocked:      'bg-red-500',
  complete:     'bg-emerald-500',
}

const LAYER_BORDER: Record<string, string> = {
  Orchestration: 'border-violet-300',
  Constraint:    'border-blue-300',
  Instruction:   'border-cyan-300',
  Feedback:      'border-amber-300',
  Memory:        'border-emerald-300',
  Design:        'border-pink-300',
}

interface Props {
  agent: Agent
  tasks: { id: string; title: string; status: string; priority: string }[]
  onWake: (id: string) => void
  onDragEnd: (id: string, x: number, y: number) => void
  onDragMove: (id: string, x: number, y: number) => void
  pos: { x: number; y: number } | undefined
  scale: number
  running?: boolean
}

export default function AgentNode({ agent, tasks, onWake, onDragEnd, onDragMove, pos: posProp, scale, running = false }: Props) {
  const [waking, setWaking] = useState(false)
  const pos = posProp ?? { x: agent.canvas_x ?? 100, y: agent.canvas_y ?? 100 }
  const dragRef = useRef<{
    startMouseX: number; startMouseY: number
    startX: number; startY: number; scale: number
  } | null>(null)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragRef.current) return
      const dx = (e.clientX - dragRef.current.startMouseX) / dragRef.current.scale
      const dy = (e.clientY - dragRef.current.startMouseY) / dragRef.current.scale
      onDragMove(agent.id, dragRef.current.startX + dx, dragRef.current.startY + dy)
    }
    function onMouseUp(e: MouseEvent) {
      if (!dragRef.current) return
      const dx = (e.clientX - dragRef.current.startMouseX) / dragRef.current.scale
      const dy = (e.clientY - dragRef.current.startMouseY) / dragRef.current.scale
      const finalX = dragRef.current.startX + dx
      const finalY = dragRef.current.startY + dy
      dragRef.current = null
      onDragEnd(agent.id, finalX, finalY)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [agent.id, onDragEnd, onDragMove])

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    dragRef.current = { startMouseX: e.clientX, startMouseY: e.clientY, startX: pos.x, startY: pos.y, scale }
  }

  async function handleWake() {
    setWaking(true)
    await onWake(agent.id)
    setTimeout(() => setWaking(false), 1500)
  }

  const activeTasks = tasks.filter(t => ['todo', 'in-progress', 'review'].includes(t.status))
  const layerBorder = running ? (LAYER_BORDER[agent.layer] ?? 'border-neutral-200') : 'border-neutral-200'
  const statusClass = STATUS_COLORS[agent.status] ?? STATUS_COLORS.idle
  const dotClass = STATUS_DOT[agent.status] ?? STATUS_DOT.idle

  return (
    <div
      className="absolute select-none cursor-grab active:cursor-grabbing"
      style={{ left: pos.x, top: pos.y }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`relative w-56 rounded-2xl border-2 bg-white shadow-md ${layerBorder}`}
      >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-neutral-800">{agent.name}</span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${statusClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            {agent.status}
          </span>
        </div>
        <p className="text-sm text-neutral-600">{agent.layer} · {agent.role}</p>
      </div>

      {/* Active tasks */}
      {activeTasks.length > 0 && (
        <div className="mx-3 mb-2 space-y-1">
          {activeTasks.slice(0, 3).map(t => (
            <div key={t.id} className="flex items-center gap-2 bg-neutral-100 rounded-lg px-2.5 py-1.5">
              <span className="text-xs font-mono font-semibold text-neutral-500">{t.priority}</span>
              <span className="text-sm text-neutral-700 truncate">{t.title}</span>
            </div>
          ))}
          {activeTasks.length > 3 && (
            <p className="text-sm text-neutral-500 text-center">+{activeTasks.length - 3} more</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-neutral-200 px-3 py-2.5 flex items-center justify-between">
        <span className="text-sm text-neutral-500">
          {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={handleWake}
          disabled={running || waking}
          className={`text-sm px-3 py-1 rounded-lg transition-colors disabled:opacity-50 ${
            running
              ? 'bg-emerald-100 text-emerald-700 cursor-default'
              : 'bg-neutral-200 hover:bg-violet-100 hover:text-violet-700 text-neutral-700'
          }`}
        >
          {running ? 'running…' : waking ? 'waking…' : 'wake ↑'}
        </button>
      </div>
      </div>
    </div>
  )
}
