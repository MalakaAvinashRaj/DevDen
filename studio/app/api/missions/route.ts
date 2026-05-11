import { NextRequest, NextResponse } from 'next/server'
import { getMissions, scaffoldMission, logActivity } from '@/lib/fs-store'
import { spawnAgent } from '@/lib/supervisor'

export async function GET() {
  return NextResponse.json(getMissions())
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.name || !body.goal || !body.brief) {
    return NextResponse.json({ error: 'name, goal, brief required' }, { status: 400 })
  }

  const mission = scaffoldMission({
    name:  body.name,
    goal:  body.goal,
    brief: body.brief,
    users: body.users,
    stack: body.stack,
  })

  logActivity('cpe', 'mission created', `${mission.id} — ${mission.name} intake started`, mission.id)

  const num  = mission.id.replace('MISSION-', '')
  const slug = mission.folder.replace(`${mission.id}-`, '')

  spawnAgent(
    'cpe',
    'CPE',
    `New mission intake required. Read .agents/cpe/CLAUDE.md for your full protocol. ` +
    `Mission: ${mission.id} — ${mission.name}. ` +
    `Client brief is at missions/intake/CLIENT-BRIEF-${num}-${slug}.md. ` +
    `Mission folder is at missions/active/${mission.folder}/. ` +
    `Your job: read the brief, write MISSION.md updates if needed, populate missions/active/${mission.folder}/TASK-REGISTRY.md with concrete tasks assigned to the right agents, update HEARTBEAT.md, then write a handoff file at missions/active/${mission.folder}/handoffs/HANDOFF-cpe-intake.md summarising what you've set up and what each agent should do next.`
  )

  return NextResponse.json(mission, { status: 201 })
}
