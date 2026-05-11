import { watch, existsSync } from 'fs'
import path from 'path'
import os from 'os'

const MISSIONS_DIR    = path.join(os.homedir(), 'Desktop', 'DevDen', 'missions', 'active')
const EVAL_INTERVAL_MS = 30 * 60 * 1000

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runSupervisorCycle, spawnAgent } = await import('./lib/supervisor')

    runSupervisorCycle()

    if (existsSync(MISSIONS_DIR)) {
      watch(MISSIONS_DIR, { recursive: true }, (event, filename) => {
        if (!filename || event !== 'rename') return
        const parts = filename.split(path.sep)

        if (parts.includes('handoffs') && filename.endsWith('.md')) {
          spawnAgent('cpe', 'CPE')
          return
        }

        if (parts[parts.length - 1] === 'TASK-REGISTRY.md') {
          runSupervisorCycle()
          return
        }
      })
    }

    setInterval(() => {
      spawnAgent('eval', 'Eval')
    }, EVAL_INTERVAL_MS)
  }
}
