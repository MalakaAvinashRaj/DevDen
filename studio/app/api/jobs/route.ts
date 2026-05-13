import { NextRequest, NextResponse } from 'next/server'
import { listJobs, createJob } from '@/lib/db-store'

export async function GET(req: NextRequest) {
  try {
    const missionId = req.nextUrl.searchParams.get('mission_id')
    if (!missionId) return NextResponse.json({ error: 'mission_id required' }, { status: 400 })
    const jobs = listJobs(Number(missionId))
    return NextResponse.json({ jobs })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { role, mission_id, feature } = body as { role: string; mission_id: number; feature?: string }
    if (!role || !mission_id) return NextResponse.json({ error: 'role and mission_id required' }, { status: 400 })
    const job = createJob({ role, mission_id, feature })
    return NextResponse.json({ job }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
