import { NextRequest, NextResponse } from 'next/server'
import { getAgent, getMission } from '@/lib/fs-store'
import { spawnAgent } from '@/lib/supervisor'
import { AGENT_DIRS } from '@/lib/supervisor'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id }      = await params
  const body        = await req.json().catch(() => ({}))
  const missionId   = body.missionId as string | undefined

  const agent = getAgent(id)
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  if (missionId) {
    const mission = getMission(missionId)
    if (!mission) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })

    const dir        = AGENT_DIRS[id]
    const instanceId = `${id}-${missionId}`
    const prompt = (
      `Read .agents/${dir}/CLAUDE.md for your protocol. ` +
      `Mission: ${missionId} — ${mission.name}. ` +
      `Mission folder: missions/active/${mission.folder}/. ` +
      `Execute your assigned tasks from missions/active/${mission.folder}/TASK-REGISTRY.md.`
    )
    const spawned = spawnAgent(instanceId, agent.name, prompt)
    return NextResponse.json({ success: true, agent_id: instanceId, spawned })
  }

  // Fallback: global wake (eval, or agent with no specific mission)
  const spawned = spawnAgent(agent.id, agent.name)
  return NextResponse.json({ success: true, agent_id: id, spawned })
}
