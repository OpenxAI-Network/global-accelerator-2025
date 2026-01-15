import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'

type Row = {
  'Store name': string
  'Store address': string
  'Food name': string
  'Qty available': number
  'Original price (Php)': number
  'Discounted price (Php)': number
  'Surprise Me'?: string
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ ok: false, error: 'Missing file' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const wb = XLSX.read(arrayBuffer)
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  const json = XLSX.utils.sheet_to_json<Row>(ws)

  const items = json.map((r) => ({
    storeName: r['Store name']?.toString() || '',
    storeAddressUrl: r['Store address']?.toString() || '',
    foodName: r['Food name']?.toString() || '',
    qty: Number(r['Qty available'] || 0),
    originalPricePhp: Number(r['Original price (Php)'] || 0),
    discountedPricePhp: Number(r['Discounted price (Php)'] || 0),
    surpriseGroup: r['Surprise Me']?.toString() || null,
  })).filter(i => i.storeName && i.foodName)

  const dataDir = join(process.cwd(), 'data')
  const filePath = join(dataDir, 'items.json')
  await mkdir(dataDir, { recursive: true })

  let existing: any[] = []
  try {
    const prev = await readFile(filePath, 'utf8')
    existing = JSON.parse(prev)
  } catch {}

  const merged = [...existing, ...items]
  await writeFile(filePath, JSON.stringify(merged, null, 2), 'utf8')

  return NextResponse.json({ ok: true, count: items.length })
}


