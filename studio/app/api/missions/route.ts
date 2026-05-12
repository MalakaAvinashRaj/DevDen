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
    `cpe-${mission.id}`,
    'CPE',
    `MISSION INTAKE — skip orientation reads, go straight to action. ` +
    `Mission: ${mission.id} — ${mission.name}. ` +
    `The folder missions/active/${mission.folder}/ already exists with MISSION.md and TASK-REGISTRY.md scaffolded. ` +
    `Do these steps in order with no extra reads: ` +
    `1) Read missions/intake/CLIENT-BRIEF-${num}-${slug}.md. ` +
    `2) Write concrete tasks into missions/active/${mission.folder}/TASK-REGISTRY.md using the ### T-NNN format (assignee: architect|software-engineer|ui-ux|qa, status: todo). ` +
    `3) Write missions/active/${mission.folder}/handoffs/HANDOFF-cpe-intake.md telling Architect what to design. ` +
    `4) Append one JSON line to missions/active/${mission.folder}/ACTIVITY.md: {"agent_id":"cpe","event":"intake complete","detail":"tasks written, architect handed off","created_at":"<ISO timestamp>"}. ` +
    `Do not read SOUL.md, AGENTS.md, HEARTBEAT.md, or any template files — all context is in this prompt and the client brief.`
  )

  return NextResponse.json(mission, { status: 201 })
}
