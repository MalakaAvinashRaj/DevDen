/**
 * Filesystem-only store. No database. Each mission is a self-contained folder.
 * Studio reads everything fresh from disk on every request — no caching, no shared state.
 */

import {
  existsSync, readdirSync, readFileSync, writeFileSync,
  mkdirSync, appendFileSync,
} from 'fs'
import path from 'path'
import os from 'os'

export const DEVDEN_ROOT  = path.join(os.homedir(), 'Desktop', 'DevDen')
export const MISSIONS_DIR = path.join(DEVDEN_ROOT, 'missions', 'active')
const CANVAS_FILE         = path.join(DEVDEN_ROOT, 'studio', 'canvas.json')

// ── Types ──────────────────────────────────────────────────────────────────

export type AgentStatus   = 'idle' | 'assigned' | 'in-progress' | 'blocked' | 'complete'
export type TaskStatus    = 'backlog' | 'todo' | 'in-progress' | 'on-hold' | 'review' | 'done'
export type TaskPriority  = 'P0' | 'P1' | 'P2' | 'P3'

export interface Agent {
  id: string
  name: string
  role: string
  layer: string
  status: AgentStatus
  canvas_x: number
  canvas_y: number
}

export interface Mission {
  id: string
  name: string
  folder: string
  phase: string
  created_at: string
}

export interface Task {
  id: string
  mission_id: string
  title: string
  description: string | null
  assignee: string | null
  status: TaskStatus
  parent_id: string | null
  priority: TaskPriority
  updated_at: string
}

export interface ActivityEntry {
  id: string
  agent_id: string | null
  agent_name: string | null
  event: string
  detail: string | null
  created_at: string
}

// ── Static agent definitions ───────────────────────────────────────────────

const AGENT_DEFS: Omit<Agent, 'canvas_x' | 'canvas_y' | 'status'>[] = [
  { id: 'cpe',               name: 'CPE',               role: 'Chief Product Engineer', layer: 'Orchestration' },
  { id: 'architect',         name: 'Architect',          role: 'System Planner',         layer: 'Constraint'    },
  { id: 'software-engineer', name: 'Software Engineer',  role: 'Implementation',         layer: 'Instruction'   },
  { id: 'ui-ux',             name: 'UI/UX Engineer',     role: 'Design',                 layer: 'Design'        },
  { id: 'qa',                name: 'QA Engineer',        role: 'Quality Gate',           layer: 'Feedback'      },
  { id: 'eval',              name: 'Eval',               role: 'Performance Monitor',    layer: 'Memory'        },
]

const AGENT_NAMES: Record<string, string> = Object.fromEntries(AGENT_DEFS.map(a => [a.id, a.name]))

// ── Canvas positions (pure UI state) ──────────────────────────────────────

interface CanvasData {
  positions: Record<string, { x: number; y: number }>
}

const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  'cpe':               { x: 500, y: 60  },
  'software-engineer': { x: 200, y: 360 },
  'qa':                { x: 760, y: 360 },
  'architect':         { x: 480, y: 240 },
  'ui-ux':             { x: 900, y: 200 },
  'eval':              { x: 500, y: 500 },
}

function readCanvas(): CanvasData {
  try {
    if (existsSync(CANVAS_FILE)) return JSON.parse(readFileSync(CANVAS_FILE, 'utf-8'))
  } catch { /* fall through */ }
  return { positions: { ...DEFAULT_POSITIONS } }
}

export function saveCanvasPosition(agentId: string, x: number, y: number) {
  const data = readCanvas()
  data.positions[agentId] = { x, y }
  writeFileSync(CANVAS_FILE, JSON.stringify(data, null, 2))
}

// ── Agents ─────────────────────────────────────────────────────────────────

export function getAgents(): Agent[] {
  const { positions } = readCanvas()
  return AGENT_DEFS.map(def => ({
    ...def,
    status: 'idle' as AgentStatus,
    canvas_x: positions[def.id]?.x ?? DEFAULT_POSITIONS[def.id]?.x ?? 100,
    canvas_y: positions[def.id]?.y ?? DEFAULT_POSITIONS[def.id]?.y ?? 100,
  }))
}

export function getAgent(id: string): Agent | undefined {
  return getAgents().find(a => a.id === id)
}

// ── Missions ───────────────────────────────────────────────────────────────

export function getMissions(): Mission[] {
  if (!existsSync(MISSIONS_DIR)) return []
  try {
    return readdirSync(MISSIONS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .filter(name => /^MISSION-\d+/.test(name))
      .map(folder => missionFromFolder(folder))
      .filter(Boolean) as Mission[]
  } catch { return [] }
}

export function getMission(id: string): Mission | undefined {
  return getMissions().find(m => m.id === id)
}

function missionFromFolder(folder: string): Mission | null {
  const match = folder.match(/^(MISSION-(\d+))(?:-(.+))?$/)
  if (!match) return null
  const id = match[1]
  const missionPath = path.join(MISSIONS_DIR, folder, 'MISSION.md')
  let name = match[3] ? match[3].replace(/-/g, ' ') : id
  let phase = 'intake'
  let created_at = new Date().toISOString()

  try {
    const content = readFileSync(missionPath, 'utf-8')
    const titleMatch = content.match(/^# MISSION-\d+ — (.+)$/m)
    if (titleMatch) name = titleMatch[1].trim()
    const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)$/m)
    if (statusMatch) phase = statusMatch[1].trim().toLowerCase()
    const startedMatch = content.match(/\*\*Started:\*\*\s*(.+)$/m)
    if (startedMatch) created_at = new Date(startedMatch[1].trim()).toISOString()
  } catch { /* use defaults */ }

  return { id, name, folder, phase, created_at }
}

// ── Tasks (parsed from TASK-REGISTRY.md) ──────────────────────────────────

export function getTasksForMission(missionId: string): Task[] {
  const mission = getMission(missionId)
  if (!mission) return []
  const registryPath = path.join(MISSIONS_DIR, mission.folder, 'TASK-REGISTRY.md')
  if (!existsSync(registryPath)) return []
  try {
    const content = readFileSync(registryPath, 'utf-8')
    return parseTaskRegistry(content, missionId)
  } catch { return [] }
}

export function getAllTasks(): Task[] {
  return getMissions().flatMap(m => getTasksForMission(m.id))
}

function parseTaskRegistry(markdown: string, missionId: string): Task[] {
  const tasks: Task[] = []
  const lines = markdown.split('\n')

  interface ParsedTask {
    id?: string
    title: string
    description?: string
    assignee?: string
    status: string
    priority?: string
    parent_id?: string
    subtasks?: { id?: string; title: string; status: string; assignee?: string }[]
  }

  let current: ParsedTask | null = null
  let inSubtaskTable = false

  const flush = () => {
    if (!current) return
    const id = current.id ?? `T-${missionId}-${tasks.length + 1}`
    tasks.push({
      id,
      mission_id: missionId,
      title: current.title,
      description: current.description ?? null,
      assignee: current.assignee ?? null,
      status: current.status as TaskStatus,
      parent_id: current.parent_id ?? null,
      priority: (current.priority as TaskPriority) ?? 'P2',
      updated_at: new Date().toISOString(),
    })
    if (current.subtasks) {
      for (const sub of current.subtasks) {
        tasks.push({
          id: sub.id ?? `${id}-${tasks.length}`,
          mission_id: missionId,
          title: sub.title,
          description: null,
          assignee: sub.assignee ?? current.assignee ?? null,
          status: sub.status as TaskStatus,
          parent_id: id,
          priority: 'P2',
          updated_at: new Date().toISOString(),
        })
      }
    }
    current = null
  }

  for (const line of lines) {
    // New task block: ```task-block or ### T-NNN
    if (line.includes('```task-block') || /^### T-\d+/.test(line)) {
      flush()
      inSubtaskTable = false
      const idMatch = line.match(/T-\d+[\w-]*/)
      current = {
        id: idMatch?.[0],
        title: line.replace(/^#+ T-[\w-]+\s*[–—-]\s*/, '').replace(/```task-block/, '').trim() || 'Untitled',
        status: 'backlog',
        subtasks: [],
      }
      continue
    }

    if (!current) continue

    if (line.includes('**Subtasks:**')) { inSubtaskTable = true; continue }
    if (inSubtaskTable && line.includes('|-')) continue

    if (inSubtaskTable && line.startsWith('|') && line.includes('T-')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length >= 3) {
        current.subtasks!.push({
          id: cells[0],
          title: cells[1],
          assignee: cells[2] !== '-' ? cells[2] : undefined,
          status: cells[3] ?? 'backlog',
        })
      }
      continue
    }

    if (inSubtaskTable && !line.startsWith('|') && line.trim()) inSubtaskTable = false

    if (line.includes('```') && !line.includes('task-block')) { flush(); continue }

    if (line.includes(':') && !inSubtaskTable) {
      const [rawKey, ...rest] = line.split(':')
      const val = rest.join(':').trim().replace(/^\*+\s*/, '').replace(/\s*\*+$/, '').trim()
      const key = rawKey.toLowerCase().replace(/[\*\-\s]/g, '')
      if (key === 'title' || key === 'name') current.title = val
      if (key === 'description') current.description = val
      if (key === 'assignee' || key === 'assigned_to') current.assignee = val
      if (key === 'status') current.status = val
      if (key === 'priority') current.priority = val
    }
  }

  flush()
  return tasks
}

// ── Activity log (per-mission ACTIVITY.md) ────────────────────────────────

function activityPath(missionId: string): string | null {
  const mission = getMission(missionId)
  if (!mission) return null
  return path.join(MISSIONS_DIR, mission.folder, 'ACTIVITY.md')
}

export function logActivity(
  agentId: string | null,
  event: string,
  detail?: string,
  missionId?: string | null,
) {
  if (!missionId) return
  const filePath = activityPath(missionId)
  if (!filePath) return

  const ts  = new Date().toISOString()
  const id  = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const line = JSON.stringify({ id, agent_id: agentId, event, detail: detail ?? null, created_at: ts }) + '\n'
  try { appendFileSync(filePath, line) } catch { /* non-fatal */ }
}

export function getActivity(missionId: string, limit = 200): ActivityEntry[] {
  const filePath = activityPath(missionId)
  if (!filePath || !existsSync(filePath)) return []
  try {
    const lines = readFileSync(filePath, 'utf-8').trim().split('\n').filter(Boolean)
    return lines
      .slice(-limit)
      .reverse()
      .map(line => {
        try {
          const e = JSON.parse(line)
          return { ...e, agent_name: e.agent_id ? (AGENT_NAMES[e.agent_id] ?? e.agent_id) : null }
        } catch { return null }
      })
      .filter(Boolean) as ActivityEntry[]
  } catch { return [] }
}

// ── Mission scaffold ───────────────────────────────────────────────────────

export function scaffoldMission(params: {
  name: string; goal: string; brief: string; users?: string; stack?: string
}): Mission {
  const { name, goal, brief, users = 'TBD', stack = 'TBD — Architect will define' } = params

  if (!existsSync(MISSIONS_DIR)) mkdirSync(MISSIONS_DIR, { recursive: true })

  const existing = readdirSync(MISSIONS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name.match(/^MISSION-(\d+)/)?.[1])
    .filter(Boolean).map(Number)
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1
  const num  = String(next).padStart(3, '0')
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const missionId = `MISSION-${num}`
  const folder    = `${missionId}-${slug}`
  const missionDir = path.join(MISSIONS_DIR, folder)
  const today = new Date().toISOString().slice(0, 10)

  mkdirSync(missionDir, { recursive: true })
  mkdirSync(path.join(missionDir, 'handoffs'), { recursive: true })
  for (const a of ['cpe', 'architect', 'ui-ux', 'se', 'qa', 'eval']) {
    mkdirSync(path.join(missionDir, '.agents', a), { recursive: true })
    writeFileSync(path.join(missionDir, '.agents', a, 'MEMORY.md'), `# ${a.toUpperCase()} Memory — ${missionId}\n`)
  }

  writeFileSync(path.join(missionDir, 'MISSION.md'), `# ${missionId} — ${name}
**Status:** Intake
**Started:** ${today}
**Target ship:** TBD

---

## The Brief

${brief}

---

## The Goal

${goal}

---

## Client / Context

**Client:** Internal
**Who uses it:** ${users}
**Constraints:** TBD

---

## Success Criteria

- [ ] User can complete the core flow end-to-end
- [ ] QA has approved all features
- [ ] No open P0 or P1 bugs
- [ ] CPE has signed off on release

---

## Tech Stack

${stack}
`)

  writeFileSync(path.join(missionDir, 'TASK-REGISTRY.md'), `# Task Registry — ${missionId}
**Owner:** CPE
**Last updated:** ${today}
**Mission:** ${name}

---

## Backlog

_(CPE and Architect will populate this during intake.)_
`)

  writeFileSync(path.join(missionDir, 'PROGRESS.md'), `# Progress — ${missionId}
**Last updated:** ${today}

## Status
Intake — waiting for Architect plan and CPE kick-off.
`)

  // ACTIVITY.md starts empty (append target)
  writeFileSync(path.join(missionDir, 'ACTIVITY.md'), '')

  const intakeDir = path.join(DEVDEN_ROOT, 'missions', 'intake')
  mkdirSync(intakeDir, { recursive: true })
  writeFileSync(path.join(intakeDir, `CLIENT-BRIEF-${num}-${slug}.md`), `# ${missionId} — ${name}

**Goal:** ${goal}

**What it does:** ${brief}

**Who uses it:** ${users}

**Tech stack preference:** ${stack}

*Created via DevDen Studio on ${today}. Route to CPE for intake.*
`)

  return { id: missionId, name, folder, phase: 'intake', created_at: new Date().toISOString() }
}
