import { NextRequest, NextResponse } from 'next/server'
import { getAgent, logActivity } from '@/lib/fs-store'
import { spawnAgent } from '@/lib/supervisor'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await req.json().catch(() => ({}))

  const agent = getAgent(id)
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const spawned = spawnAgent(agent.id, agent.name)

  return NextResponse.json({ success: true, agent_id: id, spawned })
}
