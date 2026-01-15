import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'items.json')
    const content = await readFile(filePath, 'utf8')
    const items = JSON.parse(content)
    return NextResponse.json({ items })
  } catch {
    const storeName = 'I Want Cake Store'
    const storeAddressUrl = 'https://maps.app.goo.gl/fsoyMr7umRkh3G3a7'
    const items = [
      ['Mini Signature Black Forest',5,925,450],
      ['Carrot Cheesecake',4,1150,700],
      ['Salted Caramel Crunch',7,800,300],
      ['Mini Strawberry Shortcake',15,955,500],
      ['Classic Ube Cake',20,1255,800],
      ['Red Velvet',10,1400,900],
      ['Mango Bravo',17,500,200],
      ['Triple Chocolate Roll',14,400,250],
      ['Mango Peach Tiramisu',15,1280,900],
      ['Mango Magnifico',9,1230,700],
    ].map(([foodName, qty, orig, disc]) => ({
      storeName,
      storeAddressUrl,
      foodName: foodName as string,
      qty: qty as number,
      originalPricePhp: orig as number,
      discountedPricePhp: disc as number,
      surpriseGroup: null,
    }))
    return NextResponse.json({ items })
  }
}


