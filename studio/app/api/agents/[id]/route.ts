import { NextRequest, NextResponse } from 'next/server'
import { getAgent, saveCanvasPosition } from '@/lib/fs-store'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agent = getAgent(id)
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(agent)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agent = getAgent(id)
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))

  if (typeof body.canvas_x === 'number' && typeof body.canvas_y === 'number') {
    saveCanvasPosition(id, body.canvas_x, body.canvas_y)
  }

  return NextResponse.json({ ...agent, ...('canvas_x' in body ? { canvas_x: body.canvas_x, canvas_y: body.canvas_y } : {}) })
}
