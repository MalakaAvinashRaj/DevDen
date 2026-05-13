import chokidar from 'chokidar'
import fs from 'fs'
import path from 'path'
import { pushEvent } from './sse'
import {
  logActivity,
  updateTaskStatus,
  createJob,
  createValidation,
  updateMissionPhase,
  listMissions,
  type ValidationVerdict,
} from './db-store'

const MISSIONS_DIR = path.join(process.cwd(), '..', 'missions', 'active')

let _watcher: ReturnType<typeof chokidar.watch> | null = null

function emit(data: { mission_id: number; role: string; event: string; detail?: string }): void {
  logActivity(data)
  pushEvent({ type: 'activity', ...data })
}

// Called by supervisor after a SPAWN file is processed so we don't re-queue it
const _processedSpawns = new Set<string>()
export function markSpawnProcessed(filePath: string): void {
  _processedSpawns.add(filePath)
}

export type SpawnPayload = {
  filePath: string
  mission: string
  role: 'orchestrator' | 'worker' | 'validator'
  feature?: string
  spec?: string
  milestone?: string
  mode?: 'scrutiny' | 'user-testing'
  contract?: string
  missionId: number
}

export type SpawnCallback = (payload: SpawnPayload) => void

let _onSpawn: SpawnCallback | null = null

export function onSpawn(cb: SpawnCallback): void {
  _onSpawn = cb
}

export function startFsSync(): void {
  if (_watcher) return

  fs.mkdirSync(MISSIONS_DIR, { recursive: true })

  _watcher = chokidar.watch(MISSIONS_DIR, {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  })

  _watcher.on('add', (filePath) => handleNewFile(filePath))
}

export function stopFsSync(): void {
  _watcher?.close()
  _watcher = null
}

function missionIdFromFolder(folder: string): number | null {
  const missions = listMissions()
  const match = missions.find((m) => m.folder === folder)
  return match?.id ?? null
}

function parseMissionFolder(filePath: string): string | null {
  // missions/active/MISSION-001-name/handoffs/...
  const rel = path.relative(MISSIONS_DIR, filePath)
  const parts = rel.split(path.sep)
  return parts[0] ?? null
}

function parseSpawnFile(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim().toLowerCase()
    const value = line.slice(idx + 1).trim()
    if (key && value) result[key] = value
  }
  return result
}

function handleNewFile(filePath: string): void {
  const basename = path.basename(filePath)
  const missionFolder = parseMissionFolder(filePath)
  if (!missionFolder) return

  // Only handle files inside handoffs/
  const rel = path.relative(MISSIONS_DIR, filePath)
  const parts = rel.split(path.sep)
  if (parts[1] !== 'handoffs') return

  const missionId = missionIdFromFolder(missionFolder)

  // ── SPAWN handoff → create job ────────────────────────────────────────────
  if (basename.startsWith('SPAWN-') && !_processedSpawns.has(filePath)) {
    if (!missionId) return
    const content = fs.readFileSync(filePath, 'utf-8')
    const parsed = parseSpawnFile(content)
    const role = (parsed['role'] ?? 'worker') as 'orchestrator' | 'worker' | 'validator'

    createJob({ role, mission_id: missionId, feature: parsed['feature'] ?? parsed['milestone'] })
    emit({
      mission_id: missionId,
      role: 'supervisor',
      event: 'spawn_detected',
      detail: `${basename} → queued ${role} job`,
    })

    _onSpawn?.({
      filePath,
      mission: missionFolder,
      role,
      feature: parsed['feature'],
      spec: parsed['spec'],
      milestone: parsed['milestone'],
      mode: parsed['mode'] as 'scrutiny' | 'user-testing' | undefined,
      contract: parsed['contract'],
      missionId,
    })
    return
  }

  // ── WORKER done handoff → log activity + update tasks ────────────────────
  if (basename.startsWith('WORKER-') && basename.endsWith('-done.md')) {
    if (!missionId) return
    const content = fs.readFileSync(filePath, 'utf-8')
    const featureMatch = basename.match(/^WORKER-(.+)-done\.md$/)
    const feature = featureMatch?.[1] ?? basename

    emit({ mission_id: missionId, role: 'worker', event: 'handoff_received', detail: `feature: ${feature}` })

    const followedSpec = /## 5\. Did It Follow the Spec\s+Yes/i.test(content)
    if (followedSpec) {
      emit({ mission_id: missionId, role: 'supervisor', event: 'task_complete', detail: feature })
    }
    return
  }

  // ── VALIDATOR verdict handoff → create validation record ─────────────────
  if (basename.startsWith('VALIDATOR-') && basename.endsWith('-verdict.md')) {
    if (!missionId) return
    const content = fs.readFileSync(filePath, 'utf-8')

    const verdictMatch = content.match(/^Verdict:\s*(PASS|PARTIAL|FAIL)/m)
    const scoreMatch = content.match(/^Score:\s*([\d.]+)/m)
    const milestoneMatch = content.match(/^# Validator Verdict — (.+?) —/m)
    const modeMatch = content.match(/^Mode:\s*(scrutiny|user-testing)/m)
    const ndjsonMatch = content.match(/^NDJSON:\s*(.+)/m)

    const verdict = (verdictMatch?.[1] ?? 'FAIL') as ValidationVerdict
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null
    const milestone = milestoneMatch?.[1]?.trim() ?? 'unknown'
    const mode = modeMatch?.[1] ?? 'scrutiny'
    const ndjsonPath = ndjsonMatch?.[1]?.trim() ?? null

    createValidation({ mission_id: missionId, milestone, mode, verdict, score: score ?? undefined, ndjson_path: ndjsonPath ?? undefined })

    emit({
      mission_id: missionId,
      role: 'validator',
      event: 'verdict',
      detail: `${milestone} ${mode}: ${verdict} (${score ?? '?'})`,
    })

    if (verdict === 'PASS') {
      updateMissionPhase(missionId, 'validating')
    }
    return
  }
}
