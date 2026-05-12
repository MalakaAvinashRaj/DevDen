import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getMission, updateMissionPhase, listTasks, listActivity, listValidations, type MissionPhase } from '@/lib/db-store'

const MISSIONS_DIR = path.join(process.cwd(), '..', 'missions', 'active')

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const mission = getMission(Number(id))
    if (!mission) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const tasks = listTasks(mission.id)
    const activity = listActivity(mission.id)
    const validations = listValidations(mission.id)

    return NextResponse.json({ mission, tasks, activity, validations })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const mission = getMission(Number(id))
    if (!mission) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const body = await req.json()

    if (body.phase) {
      updateMissionPhase(mission.id, body.phase as MissionPhase)
    }

    return NextResponse.json({ mission: getMission(mission.id) })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const mission = getMission(Number(id))
    if (!mission) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const db = (await import('@/lib/db')).getDb()
    db.prepare('DELETE FROM missions WHERE id = ?').run(mission.id)

    // Remove folder from disk
    const folderPath = path.join(MISSIONS_DIR, mission.folder)
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true })
    }

    return NextResponse.json({ deleted: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
