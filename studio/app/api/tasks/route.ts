import { NextRequest, NextResponse } from 'next/server'
import { getAllTasks, getTasksForMission } from '@/lib/fs-store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mission_id = searchParams.get('mission_id')

  const tasks = mission_id ? getTasksForMission(mission_id) : getAllTasks()
  return NextResponse.json(tasks)
}
