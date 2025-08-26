import { NextRequest, NextResponse } from 'next/server'
import { predictMetrics } from '@/lib/ml'
import { defaultParams, type PollutionParams } from '@/lib/state'

export const dynamic = 'force-dynamic'

type RequestBody = {
  params?: Partial<PollutionParams>
  year?: number
  baseYear?: number
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody
    const year = body.year ?? 2025
    const baseYear = body.baseYear ?? 2025
    const merged: PollutionParams = { ...defaultParams, ...(body.params ?? {}) }

    const prediction = predictMetrics(merged, baseYear, year)
    return NextResponse.json({ ok: true, prediction })
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}


