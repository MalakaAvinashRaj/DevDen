import { NextResponse } from 'next/server'
import { getAgents } from '@/lib/fs-store'
import { getRunning } from '@/lib/supervisor'

export async function GET() {
  const running = getRunning()
  const agents = getAgents().map(a => ({
    ...a,
    status: running.some(r => r === a.id || r.startsWith(`${a.id}-MISSION-`)) ? 'in-progress' : a.status,
  }))
  return NextResponse.json(agents)
}
