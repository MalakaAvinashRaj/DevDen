import { NextRequest, NextResponse } from 'next/server'
import { getMission, getAllTasks, DEVDEN_ROOT, MISSIONS_DIR } from '@/lib/fs-store'
import { existsSync, mkdirSync, renameSync, writeFileSync } from 'fs'
import path from 'path'

const COMPLETED_DIR = path.join(DEVDEN_ROOT, 'missions', 'completed')

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { action, deliveryNotes } = await req.json()

  if (action !== 'complete') {
    return NextResponse.json({ error: 'unknown action' }, { status: 400 })
  }

  const mission = getMission(id)
  if (!mission) return NextResponse.json({ error: 'mission not found' }, { status: 404 })

  const srcDir = path.join(MISSIONS_DIR, mission.folder)
  if (!existsSync(srcDir)) return NextResponse.json({ error: 'mission folder not found on disk' }, { status: 404 })

  const today = new Date().toISOString().slice(0, 10)
  const tasks = getAllTasks().filter(t => t.mission_id === id)
  const byStatus = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1
    return acc
  }, {})
  const taskSummary = Object.entries(byStatus).map(([s, n]) => `- ${s}: ${n}`).join('\n')

  writeFileSync(path.join(srcDir, 'DELIVERY.md'), `# Delivery — ${mission.id}
**Shipped:** ${today}
**Mission:** ${mission.name}

## Delivery Notes

${deliveryNotes || '_(no notes provided)_'}

## Task Summary

${taskSummary || '_(no tasks recorded)_'}

## Status
Shipped and archived. See \`missions/completed/${mission.folder}/\` for all work products.
`)

  mkdirSync(COMPLETED_DIR, { recursive: true })
  renameSync(srcDir, path.join(COMPLETED_DIR, mission.folder))

  return NextResponse.json({ ok: true })
}
