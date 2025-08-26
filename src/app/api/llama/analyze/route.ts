import { NextRequest, NextResponse } from 'next/server'
import { defaultParams, type PollutionParams } from '@/lib/state'
import { predictMetrics } from '@/lib/ml'

export const dynamic = 'force-dynamic'

type RequestBody = {
  text?: string
  params?: Partial<PollutionParams>
  year?: number
  baseYear?: number
}

// Placeholder Llama3 integration: checks for environment to call external LLM; otherwise uses rule-based parser
async function callLlama3(prompt: string): Promise<Partial<PollutionParams>> {
  const endpoint = process.env.LLAMA3_ENDPOINT
  const apiKey = process.env.LLAMA3_API_KEY
  if (!endpoint || !apiKey) {
    const lower = prompt.toLowerCase()
    const patch: Partial<PollutionParams> = {}
    if (lower.includes('factory')) patch.industrialGrowth = 5
    if (lower.includes('deforest')) patch.deforestation = 1
    if (lower.includes('coal') || lower.includes('emission')) patch.co2Emissions = 45
    if (lower.includes('renewable') || lower.includes('solar') || lower.includes('wind')) patch.co2Emissions = 20
    if (lower.includes('population')) patch.populationGrowth = 1.5
    return patch
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'llama3', messages: [{ role: 'user', content: prompt }] }),
    })
    const data = await res.json()
    const text: string = data?.choices?.[0]?.message?.content ?? ''
    // Very basic JSON extraction
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch {}
  return {}
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody
    const baseYear = body.baseYear ?? 2025
    const year = body.year ?? 2025
    const baseParams = { ...defaultParams, ...(body.params ?? {}) }
    let patch: Partial<PollutionParams> = {}
    if (body.text) patch = await callLlama3(body.text)
    const merged = { ...baseParams, ...patch }
    const prediction = predictMetrics(merged, baseYear, year)
    return NextResponse.json({ ok: true, params: merged, prediction })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}


