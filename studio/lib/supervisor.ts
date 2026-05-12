import { spawn } from 'child_process'
import path from 'path'
import { registerHandler, startQueue, stopQueue } from './job-queue'
import { startFsSync, stopFsSync, onSpawn, markSpawnProcessed, type SpawnPayload } from './fs-sync'
import { updateJobStatus, logActivity, claimNextJob } from './db-store'

const MISSIONS_DIR = path.join(process.cwd(), '..', 'missions', 'active')
const AGENTS_DIR = path.join(process.cwd(), '..', '.agents')

// Pending spawn payloads keyed by job ID — set by fs-sync, consumed by job handler
const _pendingSpawns = new Map<number, SpawnPayload>()

function buildPrompt(payload: SpawnPayload): string {
  const protocolsPath = path.join(AGENTS_DIR, payload.role, 'CLAUDE.md')

  if (payload.role === 'worker') {
    return [
      `You are a Worker agent in the DevDen factory.`,
      `Feature: ${payload.feature}`,
      `Spec file: ${payload.spec}`,
      `Operating protocols: ${protocolsPath}`,
      `Read your spec and protocols, then execute the build sequence exactly as described.`,
    ].join('\n')
  }

  if (payload.role === 'validator') {
    return [
      `You are a Validator agent in the DevDen factory.`,
      `Milestone: ${payload.milestone}`,
      `Mode: ${payload.mode}`,
      `Contract: ${payload.contract}`,
      `Operating protocols: ${protocolsPath}`,
      `Execute the ${payload.mode} validation sequence exactly as described in your protocols.`,
    ].join('\n')
  }

  return `You are a ${payload.role} agent. Read ${protocolsPath} and execute your sequence.`
}

function spawnHermes(payload: SpawnPayload, jobId: number): void {
  const prompt = buildPrompt(payload)
  const cwd = path.join(MISSIONS_DIR, payload.mission)

  const child = spawn(
    'hermes',
    ['-p', payload.role, 'chat', '-q', prompt, '--yolo'],
    { cwd, stdio: 'inherit', detached: false }
  )

  updateJobStatus(jobId, 'running', child.pid)
  logActivity({
    mission_id: payload.missionId,
    role: 'supervisor',
    event: 'agent_spawned',
    detail: `${payload.role} PID ${child.pid} — ${payload.feature ?? payload.milestone ?? ''}`,
  })

  markSpawnProcessed(payload.filePath)

  child.on('exit', (code) => {
    const status = code === 0 ? 'done' : 'failed'
    updateJobStatus(jobId, status)
    logActivity({
      mission_id: payload.missionId,
      role: 'supervisor',
      event: 'agent_exit',
      detail: `${payload.role} PID ${child.pid} exited with code ${code}`,
    })
  })

  child.on('error', (err) => {
    logActivity({
      mission_id: payload.missionId,
      role: 'supervisor',
      event: 'agent_error',
      detail: `${payload.role}: ${err.message}`,
    })
  })
}

export function startSupervisor(): void {
  // Wire fs-sync → job queue: when a SPAWN file is detected, store its payload
  // so the job handler can pick it up when the job is claimed
  onSpawn((payload) => {
    // The job was just created by fs-sync; claim it immediately
    const job = claimNextJob()
    if (!job) return
    _pendingSpawns.set(job.id, payload)
  })

  registerHandler(async (job) => {
    const payload = _pendingSpawns.get(job.id)
    if (!payload) {
      logActivity({
        mission_id: job.mission_id,
        role: 'supervisor',
        event: 'job_skipped',
        detail: `job ${job.id}: no spawn payload found`,
      })
      return
    }
    _pendingSpawns.delete(job.id)
    spawnHermes(payload, job.id)
  })

  startFsSync()
  startQueue()
}

export function stopSupervisor(): void {
  stopQueue()
  stopFsSync()
}
