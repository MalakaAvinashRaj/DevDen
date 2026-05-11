import { NextResponse } from 'next/server'
import { runSupervisorCycle, getRunning, killAll } from '@/lib/supervisor'

export async function GET() {
  return NextResponse.json({ running: getRunning() })
}

export async function POST() {
  const result = runSupervisorCycle()
  return NextResponse.json(result)
}

// Kill all running Hermes agent processes
export async function DELETE() {
  const stopped = killAll()
  return NextResponse.json({ stopped })
}
