import { spawn } from 'child_process'
import { openSync, mkdirSync, closeSync } from 'fs'
import path from 'path'
import os from 'os'

const DEVDEN_ROOT = path.resolve('/Users/raj/Desktop/DevDen')
const LOGS_DIR    = path.join(DEVDEN_ROOT, '.logs', 'agents')
const HERMES_BIN  = path.join(os.homedir(), '.local/bin/hermes')

const AGENT_PROFILES: Record<string, string> = {
  'cpe':               'cpe',
  'architect':         'architect',
  'software-engineer': 'se',
  'qa':                'qa',
  'eval':              'eval',
  'ui-ux':             'uiux',
}

const AGENT_DIRS: Record<string, string> = {
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
  return [...running.keys()]
}

export function killAll(): string[] {
  const stopped: string[] = []
  for (const [id, proc] of running.entries()) {
    try { proc.kill() } catch { /* already gone */ }
    stopped.push(id)
  }
  running.clear()
  return stopped
}

export function spawnAgent(agentId: string, agentName: string, customPrompt?: string): boolean {
  if (running.has(agentId)) return false

  const profile = AGENT_PROFILES[agentId]
  const dir     = AGENT_DIRS[agentId]
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
    running.set(agentId, {
      pid: proc.pid,
      kill: () => { try { process.kill(proc.pid!, 'SIGTERM') } catch { /* ok */ } },
    })
    proc.on('close', () => running.delete(agentId))
    proc.on('error', () => running.delete(agentId))
    proc.unref()
    return true
  }

  return false
}

export function runSupervisorCycle(): { checked: number; spawned: number; running: string[] } {
  // Read active agents from filesystem — no DB
  const { getAllTasks, getAgents } = require('./fs-store') as typeof import('./fs-store')
  const tasks = getAllTasks()
  const agents = getAgents()

  const agentsWithWork = new Set(
    tasks
      .filter(t => ['todo', 'in-progress', 'review'].includes(t.status) && t.assignee)
      .map(t => t.assignee!)
  )

  const candidates = agents.filter(a => agentsWithWork.has(a.id))

  let spawned = 0
  for (const agent of candidates) {
    if (spawnAgent(agent.id, agent.name)) spawned++
  }

  return { checked: candidates.length, spawned, running: getRunning() }
}
