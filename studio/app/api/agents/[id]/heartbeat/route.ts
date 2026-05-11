import { NextRequest, NextResponse } from 'next/server'
import { getAgent, getTasksForMission, logActivity } from '@/lib/fs-store'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const agent = getAgent(id)
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  if (body.mission_id && body.event) {
    logActivity(id, body.event, body.detail, body.mission_id)
  }

  const tasks = body.mission_id
    ? getTasksForMission(body.mission_id).filter(
        t => t.assignee === id && ['todo', 'in-progress'].includes(t.status)
      )
    : []

  return NextResponse.json({ acknowledged: true, tasks })
}
