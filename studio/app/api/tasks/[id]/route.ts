import { NextRequest, NextResponse } from 'next/server'
import { getAllTasks } from '@/lib/fs-store'

// Tasks are owned by TASK-REGISTRY.md files — agents write to those directly.
// The Studio reads tasks from disk; individual task edits via the UI are not supported
// (agents are the source of truth for task state).

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const task = getAllTasks().find(t => t.id === id)
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(task)
}
