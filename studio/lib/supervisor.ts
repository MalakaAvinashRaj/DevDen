import { spawn } from 'child_process'
import { openSync, mkdirSync, closeSync, writeFileSync, unlinkSync, readdirSync, readFileSync } from 'fs'
import path from 'path'
import os from 'os'

const DEVDEN_ROOT = path.resolve('/Users/raj/Desktop/DevDen')
const LOGS_DIR    = path.join(DEVDEN_ROOT, '.logs', 'agents')
const PIDS_DIR    = path.join(DEVDEN_ROOT, '.logs', 'agents', 'running')
const HERMES_BIN  = path.join(os.homedir(), '.local/bin/hermes')

function pidRunning(pid: number): boolean {
  try { process.kill(pid, 0); return true } catch { return false }
}

function writePid(agentId: string, pid: number) {
  mkdirSync(PIDS_DIR, { recursive: true })
  writeFileSync(path.join(PIDS_DIR, agentId), String(pid))
}

function clearPid(agentId: string) {
  try { unlinkSync(path.join(PIDS_DIR, agentId)) } catch { /* ok */ }
}

function getRunningFromDisk(): string[] {
  try {
    return readdirSync(PIDS_DIR).filter(f => {
      const pid = parseInt(readFileSync(path.join(PIDS_DIR, f), 'utf-8'))
      if (pidRunning(pid)) return true
      clearPid(f)
      return false
    })
  } catch { return [] }
}

const AGENT_PROFILES: Record<string, string> = {
  'cpe':               'cpe',
  'architect':         'architect',
  'software-engineer': 'se',
  'qa':                'qa',
  'eval':              'eval',
  'ui-ux':             'uiux',
}

export const AGENT_DIRS: Record<string, string> = {
  'cpe':               'cpe',
  'architect':         'architect',
  'software-engineer': 'software-engineer',
  'qa':                'qa',
  'eval':              'eval',
  'ui-ux':             'ui-ux',
}

const running = new Map<string, { pid: number; kill: () => void }>()

export function isRunning(agentId: string): boolean {
  return running.has(agentId)
}

export function getRunning(): string[] {
  return [...new Set([...running.keys(), ...getRunningFromDisk()])]
}

export function killAll(): string[] {
  const stopped: string[] = []
  for (const [id, proc] of running.entries()) {
    try { proc.kill() } catch { /* already gone */ }
    clearPid(id)
    stopped.push(id)
  }
  running.clear()
  for (const id of getRunningFromDisk()) {
    const pid = parseInt(readFileSync(path.join(PIDS_DIR, id), 'utf-8'))
    try { process.kill(pid, 'SIGTERM') } catch { /* ok */ }
    clearPid(id)
    stopped.push(id)
  }
  return stopped
}

export function spawnAgent(agentId: string, agentName: string, customPrompt?: string): boolean {
  if (running.has(agentId)) return false

  const baseId  = agentId.replace(/-MISSION-\d+$/, '')
  const profile = AGENT_PROFILES[baseId]
  const dir     = AGENT_DIRS[baseId]
  if (!profile || !dir) return false

  const isEval = agentId === 'eval'
  const prompt = customPrompt ?? (isEval
    ? `Read HEARTBEAT.md then .agents/${dir}/CLAUDE.md. Run the six-level evaluation. All data sources are listed in CLAUDE.md including log files at .logs/agents/ and the Studio API at http://localhost:3000/api.`
    : `Read HEARTBEAT.md then .agents/${dir}/CLAUDE.md. Execute your assigned task.`)

  mkdirSync(LOGS_DIR, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const logPath   = path.join(LOGS_DIR, `${agentId}-${timestamp}.log`)
  const logFd     = openSync(logPath, 'w')

  const proc = spawn(HERMES_BIN, [
    '-p', profile,
    'chat', '-q', prompt,
    '--yolo',
  ], {
    cwd: DEVDEN_ROOT,
    detached: true,
    stdio: ['ignore', logFd, logFd],
    env: { ...process.env, HOME: os.homedir() },
  })

  closeSync(logFd)

  if (proc.pid) {
    writePid(agentId, proc.pid)
    running.set(agentId, {
      pid: proc.pid,
      kill: () => { try { process.kill(proc.pid!, 'SIGTERM') } catch { /* ok */ } },
    })
    proc.on('close', () => { running.delete(agentId); clearPid(agentId) })
    proc.on('error', () => { running.delete(agentId); clearPid(agentId) })
    proc.unref()
    return true
  }

  return false
}

export function runSupervisorCycle(): { checked: number; spawned: number; running: string[] } {
  const { getAllTasks, getMissions } = require('./fs-store') as typeof import('./fs-store')
  const tasks    = getAllTasks()
  const missions = getMissions()

  // Build deduplicated set of (agentType, missionId) pairs that have active work
  const seen = new Set<string>()
  const candidates: { agentId: string; missionId: string }[] = []
  for (const t of tasks) {
    if (!['todo', 'in-progress', 'review'].includes(t.status) || !t.assignee) continue
    const key = `${t.assignee}-${t.mission_id}`
    if (!seen.has(key)) {
      seen.add(key)
      candidates.push({ agentId: t.assignee, missionId: t.mission_id })
    }
  }

  let spawned = 0
  for (const { agentId, missionId } of candidates) {
    const mission = missions.find(m => m.id === missionId)
    if (!mission) continue
    const dir     = AGENT_DIRS[agentId]
    if (!dir) continue
    const instanceId = `${agentId}-${missionId}`
    const prompt = (
      `Read .agents/${dir}/CLAUDE.md for your protocol and .agents/DISCIPLINE.md for exit rules. ` +
      `Mission: ${missionId} — ${mission.name}. ` +
      `Mission folder: missions/active/${mission.folder}/. ` +
      `Execute your assigned tasks from missions/active/${mission.folder}/TASK-REGISTRY.md. ` +
      `Follow exit discipline exactly before stopping.`
    )
    if (spawnAgent(instanceId, agentId, prompt)) spawned++
  }

  return { checked: candidates.length, spawned, running: getRunning() }
}
