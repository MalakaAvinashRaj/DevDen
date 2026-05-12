import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createMission, listMissions } from '@/lib/db-store'

const MISSIONS_DIR = path.join(process.cwd(), '..', 'missions', 'active')

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function missionFolder(id: number, name: string): string {
  return `MISSION-${String(id).padStart(3, '0')}-${slugify(name)}`
}

function scaffoldMission(folder: string, data: { name: string; brief?: string; goal?: string }): void {
  const root = path.join(MISSIONS_DIR, folder)

  fs.mkdirSync(path.join(root, 'milestones'), { recursive: true })
  fs.mkdirSync(path.join(root, 'handoffs'), { recursive: true })
  fs.mkdirSync(path.join(root, 'app'), { recursive: true })

  fs.writeFileSync(path.join(root, 'MISSION.md'), `# ${data.name}

## Brief
${data.brief ?? '_To be filled by Orchestrator_'}

## Goal
${data.goal ?? '_To be filled by Orchestrator_'}

## Status
Phase: scoping
`)

  fs.writeFileSync(path.join(root, 'VALIDATION-CONTRACT.md'), `# Validation Contract — ${data.name}
<!-- Written by Orchestrator BEFORE any feature spec is created. -->
<!-- Workers never read this file. Validators judge against it. -->

## Assertions

<!-- List every observable outcome that defines "done". -->
<!-- Example: -->
<!-- - GET /api/missions returns 200 with { missions: Mission[] } -->
<!-- - Creating a mission scaffolds the folder structure on disk -->
<!-- - Validator PASS requires weighted mean ≥ 3.5 across all criteria -->

_Orchestrator: fill this before writing milestone specs._

## Out of Scope

_What this mission explicitly does NOT cover._
`)

  fs.writeFileSync(path.join(root, 'ACTIVITY.md'), `# Activity Log — ${data.name}
<!-- Orchestrator appends every decision here. One entry per action. -->
`)
}

export async function GET() {
  try {
    const missions = listMissions()
    return NextResponse.json({ missions })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, brief, goal } = body as { name: string; brief?: string; goal?: string }

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // Create DB record first to get the ID
    const mission = createMission({ name: name.trim(), folder: '__tmp__', brief, goal })

    // Now we have the ID — build the real folder name and update
    const folder = missionFolder(mission.id, name)
    const db = (await import('@/lib/db')).getDb()
    db.prepare('UPDATE missions SET folder = ? WHERE id = ?').run(folder, mission.id)

    scaffoldMission(folder, { name: name.trim(), brief, goal })

    return NextResponse.json({ mission: { ...mission, folder } }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
