'use client'

import { useEffect, useState } from 'react'
import { CheckoutInline } from './checkout'

interface Item {
  storeName: string
  storeAddressUrl: string
  foodName: string
  qty: number
  originalPricePhp: number
  discountedPricePhp: number
  surpriseGroup: string | null
}

export default function ListingsPage() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    fetch('/api/items').then(r=>r.json()).then(d=> setItems(d.items || []))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Available Surprise Bags and Items</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((it, idx) => (
          <div key={idx} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{it.foodName}</div>
                <a className="text-sm text-[#0EA5E9] underline" href={it.storeAddressUrl} target="_blank">{it.storeName}</a>
              </div>
              {it.surpriseGroup ? (
                <span className="text-xs px-2 py-1 rounded bg-[#F59E0B]/10 text-[#B45309]">Surprise Bag</span>
              ) : (
                <span className="text-xs px-2 py-1 rounded bg-[#0EA5E9]/10 text-[#0369A1]">Single Item</span>
              )}
            </div>
            <div className="mt-3 text-sm text-gray-600">Qty: {it.qty}</div>
            <div className="mt-3 flex items-center gap-2">
              <span className="line-through text-gray-400">₱{it.originalPricePhp.toFixed(2)}</span>
              <span className="font-bold text-[#16A34A]">₱{it.discountedPricePhp.toFixed(2)}</span>
            </div>
            <div className="mt-4">
              <CheckoutInline item={it} />
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-sm text-gray-600">No items yet. Upload via <a className="underline text-[#0EA5E9]" href="/upload">Excel</a>.</p>
      )}
    </div>
  )
}
