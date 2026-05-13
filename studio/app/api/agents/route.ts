import { NextRequest, NextResponse } from 'next/server'
import { listJobs } from '@/lib/db-store'

// Returns currently running agent jobs across all missions (or filtered by mission)
export async function GET(req: NextRequest) {
  try {
    const missionId = req.nextUrl.searchParams.get('mission_id')
    if (!missionId) return NextResponse.json({ error: 'mission_id required' }, { status: 400 })

    const jobs = listJobs(Number(missionId))
    const active = jobs.filter((j) => j.status === 'running')

    return NextResponse.json({ agents: active })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
