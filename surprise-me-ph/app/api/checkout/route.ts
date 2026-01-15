import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { items, method, provider } = await request.json()
  if (!Array.isArray(items) || !items.length) return NextResponse.json({ ok: false, error: 'No items' }, { status: 400 })
  if (!['pickup','delivery'].includes(method)) return NextResponse.json({ ok: false, error: 'Invalid method' }, { status: 400 })

  // Stub: return deep link suggestions for PH delivery services
  const links: Record<string,string> = {
    grab: 'https://food.grab.com/ph/en',
    foodpanda: 'https://www.foodpanda.ph/',
    toktok: 'https://www.toktok.ph/',
    joyride: 'https://www.joyride.com.ph/',
    angkas: 'https://www.angkas.com/'
  }
  const link = provider ? links[provider] : null
  return NextResponse.json({ ok: true, etaMins: method === 'pickup' ? 15 : 35, providerLink: link })
}


