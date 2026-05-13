import { getDb } from './db'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MissionPhase = 'scoping' | 'building' | 'validating' | 'shipped' | 'failed'
export type JobStatus = 'queued' | 'running' | 'done' | 'failed'
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'blocked'
export type ValidationVerdict = 'PASS' | 'PARTIAL' | 'FAIL'

export interface Mission {
  id: number
  name: string
  folder: string
  phase: MissionPhase
  version: number
  brief: string | null
  goal: string | null
  created_at: string
  shipped_at: string | null
}

export interface Task {
  id: number
  mission_id: number
  title: string
  assignee: string
  status: TaskStatus
  priority: number
  milestone: string | null
}

export interface Job {
  id: number
  role: string
  mission_id: number
  feature: string | null
  status: JobStatus
  pid: number | null
  retry_count: number
  created_at: string
}

export interface Activity {
  id: number
  mission_id: number
  role: string
  event: string
  detail: string | null
  created_at: string
}

export interface Validation {
  id: number
  mission_id: number
  milestone: string
  mode: string
  verdict: ValidationVerdict
  score: number | null
  ndjson_path: string | null
  created_at: string
}

// ─── Missions ─────────────────────────────────────────────────────────────────

export function listMissions(): Mission[] {
  return getDb().prepare('SELECT * FROM missions ORDER BY created_at DESC').all() as Mission[]
}

export function getMission(id: number): Mission | null {
  return getDb().prepare('SELECT * FROM missions WHERE id = ?').get(id) as Mission | null
}

export function createMission(data: { name: string; folder: string; brief?: string; goal?: string }): Mission {
  const db = getDb()
  const result = db.prepare(
    'INSERT INTO missions (name, folder, brief, goal) VALUES (?, ?, ?, ?)'
  ).run(data.name, data.folder, data.brief ?? null, data.goal ?? null)
  return getMission(result.lastInsertRowid as number)!
}

export function updateMissionPhase(id: number, phase: MissionPhase): void {
  const update = phase === 'shipped'
    ? "UPDATE missions SET phase = ?, shipped_at = datetime('now') WHERE id = ?"
    : 'UPDATE missions SET phase = ? WHERE id = ?'
  getDb().prepare(update).run(phase, id)
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function listTasks(missionId: number): Task[] {
  return getDb().prepare('SELECT * FROM tasks WHERE mission_id = ? ORDER BY priority DESC, id ASC').all(missionId) as Task[]
}

export function createTask(data: { mission_id: number; title: string; assignee?: string; milestone?: string; priority?: number }): Task {
  const db = getDb()
  const result = db.prepare(
    'INSERT INTO tasks (mission_id, title, assignee, milestone, priority) VALUES (?, ?, ?, ?, ?)'
  ).run(data.mission_id, data.title, data.assignee ?? 'worker', data.milestone ?? null, data.priority ?? 0)
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) as Task
}

export function updateTaskStatus(id: number, status: TaskStatus): void {
  getDb().prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id)
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export function listJobs(missionId: number): Job[] {
  return getDb().prepare('SELECT * FROM jobs WHERE mission_id = ? ORDER BY id DESC').all(missionId) as Job[]
}

export function createJob(data: { role: string; mission_id: number; feature?: string }): Job {
  const db = getDb()
  const result = db.prepare(
    'INSERT INTO jobs (role, mission_id, feature) VALUES (?, ?, ?)'
  ).run(data.role, data.mission_id, data.feature ?? null)
  return db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid) as Job
}

export function claimNextJob(): Job | null {
  const db = getDb()
  return db.transaction(() => {
    const job = db.prepare(
      "SELECT * FROM jobs WHERE status = 'queued' ORDER BY id ASC LIMIT 1"
    ).get() as Job | null
    if (!job) return null
    db.prepare("UPDATE jobs SET status = 'running' WHERE id = ?").run(job.id)
    return { ...job, status: 'running' as JobStatus }
  })()
}

export function updateJobStatus(id: number, status: JobStatus, pid?: number): void {
  getDb().prepare('UPDATE jobs SET status = ?, pid = COALESCE(?, pid) WHERE id = ?').run(status, pid ?? null, id)
}

export function incrementJobRetry(id: number): void {
  getDb().prepare('UPDATE jobs SET retry_count = retry_count + 1, status = ? WHERE id = ?').run('queued', id)
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export function listActivity(missionId: number, limit = 100): Activity[] {
  return getDb().prepare(
    'SELECT * FROM activity WHERE mission_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(missionId, limit) as Activity[]
}

export function logActivity(data: { mission_id: number; role: string; event: string; detail?: string }): void {
  getDb().prepare(
    'INSERT INTO activity (mission_id, role, event, detail) VALUES (?, ?, ?, ?)'
  ).run(data.mission_id, data.role, data.event, data.detail ?? null)
}

// ─── Validations ──────────────────────────────────────────────────────────────

export function listValidations(missionId: number): Validation[] {
  return getDb().prepare('SELECT * FROM validations WHERE mission_id = ? ORDER BY created_at DESC').all(missionId) as Validation[]
}

export function createValidation(data: {
  mission_id: number
  milestone: string
  mode: string
  verdict: ValidationVerdict
  score?: number
  ndjson_path?: string
}): Validation {
  const db = getDb()
  const result = db.prepare(
    'INSERT INTO validations (mission_id, milestone, mode, verdict, score, ndjson_path) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(data.mission_id, data.milestone, data.mode, data.verdict, data.score ?? null, data.ndjson_path ?? null)
  return db.prepare('SELECT * FROM validations WHERE id = ?').get(result.lastInsertRowid) as Validation
}
