import { NextRequest, NextResponse } from 'next/server'
import { getActivity } from '@/lib/fs-store'

export async function GET(req: NextRequest) {
  const missionId = req.nextUrl.searchParams.get('missionId')
  if (!missionId) return NextResponse.json([])
  return NextResponse.json(getActivity(missionId))
}
