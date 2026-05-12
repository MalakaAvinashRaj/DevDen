import { claimNextJob, updateJobStatus, incrementJobRetry, logActivity } from './db-store'

const MAX_RETRIES = 3
const POLL_INTERVAL_MS = 5000

let _pollTimer: ReturnType<typeof setTimeout> | null = null
let _running = false

export type JobHandler = (job: {
  id: number
  role: string
  mission_id: number
  feature: string | null
}) => Promise<void>

let _handler: JobHandler | null = null

export function registerHandler(handler: JobHandler): void {
  _handler = handler
}

export function startQueue(): void {
  if (_running) return
  _running = true
  poll()
}

export function stopQueue(): void {
  _running = false
  if (_pollTimer) {
    clearTimeout(_pollTimer)
    _pollTimer = null
  }
}

async function poll(): Promise<void> {
  if (!_running) return

  try {
    const job = claimNextJob()
    if (job && _handler) {
      try {
        await _handler(job)
        updateJobStatus(job.id, 'done')
        logActivity({
          mission_id: job.mission_id,
          role: 'supervisor',
          event: 'job_done',
          detail: `job ${job.id} (${job.role}${job.feature ? ` / ${job.feature}` : ''}) completed`,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (job.retry_count < MAX_RETRIES) {
          incrementJobRetry(job.id)
          logActivity({
            mission_id: job.mission_id,
            role: 'supervisor',
            event: 'job_retry',
            detail: `job ${job.id} failed (attempt ${job.retry_count + 1}): ${msg}`,
          })
        } else {
          updateJobStatus(job.id, 'failed')
          logActivity({
            mission_id: job.mission_id,
            role: 'supervisor',
            event: 'job_failed',
            detail: `job ${job.id} exhausted retries: ${msg}`,
          })
        }
      }
    }
  } catch (err) {
    console.error('[job-queue] poll error:', err)
  }

  _pollTimer = setTimeout(poll, POLL_INTERVAL_MS)
}
