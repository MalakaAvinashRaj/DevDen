export const runtime = 'nodejs'

const SUPERVISOR_TICK  = 60 * 1000
const EVAL_INTERVAL_MS = 30 * 60 * 1000

function resolveHandoff(basename: string): string | null {
  const b = basename.toLowerCase()
  if (b.includes('-to-architect'))                                    return 'architect'
  if (b.includes('-to-cpe'))                                         return 'cpe'
  if (b.includes('-to-se') || b.includes('-to-software-engineer'))   return 'software-engineer'
  if (b.includes('-to-qa'))                                          return 'qa'
  if (b.includes('-to-uiux') || b.includes('-to-ui-ux'))             return 'ui-ux'
  return null
}

function agentLabel(agentId: string): string {
  const labels: Record<string, string> = {
    'cpe':               'CPE',
    'architect':         'Architect',
    'software-engineer': 'Software Engineer',
    'qa':                'QA Engineer',
    'ui-ux':             'UI/UX Engineer',
  }
  return labels[agentId] ?? agentId
}

function buildPrompt(agentId: string, missionId: string, missionName: string, missionFolder: string, handoffFile?: string): string {
  const dir = ({ 'cpe': 'cpe', 'architect': 'architect', 'software-engineer': 'software-engineer', 'qa': 'qa', 'ui-ux': 'ui-ux' } as Record<string, string>)[agentId] ?? agentId
  const handoffNote = handoffFile ? `A handoff has arrived: missions/active/${missionFolder}/handoffs/${handoffFile}. Read it first. ` : ''
  return (
    `${handoffNote}` +
    `Read .agents/${dir}/CLAUDE.md for your protocol and .agents/DISCIPLINE.md for exit rules. ` +
    `Mission: ${missionId} — ${missionName}. ` +
    `Mission folder: missions/active/${missionFolder}/. ` +
    `Execute your assigned work then follow the exit discipline exactly before stopping.`
  )
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // All Node.js imports deferred so Turbopack doesn't warn about edge-incompatible modules
  const { watch, existsSync, statSync, readdirSync } = await import('fs')
  const { default: path } = await import('path')
  const { default: os }   = await import('os')

  const MISSIONS_DIR = path.join(os.homedir(), 'Desktop', 'DevDen', 'missions', 'active')

  const { runSupervisorCycle, spawnAgent } = await import('./lib/supervisor')
  const { getMission }                     = await import('./lib/fs-store')

  type SpawnFn   = typeof spawnAgent
  type MissionFn = typeof getMission

  // Scan all mission handoff folders for unprocessed handoffs and spawn the recipient.
  // Runs on boot + every 60s to catch events the file watcher missed (e.g. after a hot-reload).
  function scanPendingHandoffs(spawn: SpawnFn, getM: MissionFn) {
    if (!existsSync(MISSIONS_DIR)) return
    try {
      const folders = readdirSync(MISSIONS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory() && /^MISSION-\d+/.test(d.name))
        .map(d => d.name)

      for (const folder of folders) {
        const m = folder.match(/^(MISSION-\d+)/)
        if (!m) continue
        const missionId   = m[1]
        const handoffsDir = path.join(MISSIONS_DIR, folder, 'handoffs')
        if (!existsSync(handoffsDir)) continue

        const files = readdirSync(handoffsDir).filter(f => f.endsWith('.md'))

        for (const file of files) {
          const nextAgent = resolveHandoff(file)
          if (!nextAgent) continue

          // Skip if this agent already has a response handoff (they already ran)
          const responsePrefix = `handoff-${nextAgent === 'software-engineer' ? 'se' : nextAgent}-to-`
          if (files.some(f => f.toLowerCase().startsWith(responsePrefix))) continue

          const mission = getM(missionId)
          if (!mission) continue

          spawn(
            `${nextAgent}-${missionId}`,
            agentLabel(nextAgent),
            buildPrompt(nextAgent, missionId, mission.name, mission.folder, file),
          )
        }
      }
    } catch { /* non-fatal */ }
  }

  // On boot: process anything in-flight before the restart
  runSupervisorCycle()
  scanPendingHandoffs(spawnAgent, getMission)

  // File watcher: instant chain trigger when a handoff lands
  if (existsSync(MISSIONS_DIR)) {
    watch(MISSIONS_DIR, { recursive: true }, (event, filename) => {
      if (!filename || event !== 'rename') return

      const parts         = filename.split(path.sep)
      const missionFolder = parts[0]
      const missionMatch  = missionFolder.match(/^(MISSION-\d+)/)
      const missionId     = missionMatch?.[1]
      if (!missionId) return

      const fullPath   = path.join(MISSIONS_DIR, filename)
      const fileExists = existsSync(fullPath)
      const fileSize   = fileExists ? statSync(fullPath).size : 0

      if (parts.includes('handoffs') && filename.endsWith('.md') && fileExists && fileSize > 0) {
        const basename  = parts[parts.length - 1]
        const nextAgent = resolveHandoff(basename)
        if (!nextAgent) return
        const mission = getMission(missionId)
        if (!mission) return
        spawnAgent(
          `${nextAgent}-${missionId}`,
          agentLabel(nextAgent),
          buildPrompt(nextAgent, missionId, mission.name, mission.folder, basename),
        )
        return
      }

      if (parts[parts.length - 1] === 'TASK-REGISTRY.md' && fileExists) {
        runSupervisorCycle()
      }
    })
  }

  // 60s safety net: catches tasks/handoffs the watcher missed (pure file reads, zero tokens)
  setInterval(() => {
    runSupervisorCycle()
    scanPendingHandoffs(spawnAgent, getMission)
  }, SUPERVISOR_TICK)

  // Eval monitor every 30 min
  setInterval(() => {
    spawnAgent('eval', 'Eval')
  }, EVAL_INTERVAL_MS)
}
