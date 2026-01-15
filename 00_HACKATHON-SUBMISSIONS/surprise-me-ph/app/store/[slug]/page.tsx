'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Item = {
  storeName: string
  storeAddressUrl: string
  foodName: string
  qty: number
  originalPricePhp: number
  discountedPricePhp: number
  surpriseGroup: string | null
}

export default function StorePage({ params }: { params: { slug: string } }) {
  const [items, setItems] = useState<Item[]>([])
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetch('/api/items').then(r=>r.json()).then(d=> setItems(d.items||[]))
  }, [])

  // Load saved selections from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && params.slug) {
      const saved = localStorage.getItem(`store-selections-${params.slug}`)
      if (saved) {
        try {
          setChecked(JSON.parse(saved))
        } catch {}
      }
    }
  }, [params.slug])

  // Save selections to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && params.slug && Object.keys(checked).length >= 0) {
      localStorage.setItem(`store-selections-${params.slug}`, JSON.stringify(checked))
    }
  }, [checked, params.slug])

  // Update checkbox handler to save to localStorage
  const handleCheckChange = (idx: number, value: boolean) => {
    const newChecked = { ...checked, [idx]: value }
    setChecked(newChecked)
    if (typeof window !== 'undefined' && params.slug) {
      localStorage.setItem(`store-selections-${params.slug}`, JSON.stringify(newChecked))
    }
  }

  const store = useMemo(() => {
    const name = params.slug.replaceAll('-', ' ')
    const group = items.filter(i=> i.storeName.toLowerCase() === name)
    if (!group.length) return null
    return {
      storeName: group[0].storeName,
      storeAddressUrl: group[0].storeAddressUrl,
      rating: 4.4,
      items: group
    }
  }, [items, params.slug])

  if (!store) return <div className="p-4">Loading...</div>

  const selected = store.items.filter((_, idx) => checked[idx])
  const totalDisc = selected.reduce((s,i)=> s + i.discountedPricePhp, 0)
  const totalOrig = selected.reduce((s,i)=> s + i.originalPricePhp, 0)

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex gap-3 items-center">
        <Link href="/browse" className="text-sm underline">← Back</Link>
        <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xs">{store.storeName}</div>
        <div>
          <div className="font-bold text-lg">{store.storeName}</div>
          <div className="text-xs text-gray-600">★ {store.rating.toFixed(1)} · <a className="underline" href={store.storeAddressUrl} target="_blank">View address</a></div>
        </div>
      </div>

      <div className="grid gap-3">
        {store.items.map((it, idx) => (
          <div key={idx} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" checked={!!checked[idx]} onChange={e=> handleCheckChange(idx, e.target.checked)} />
                <div>
                  <div className="font-semibold">{it.foodName}</div>
                  <div className="text-xs text-gray-600">Qty: {it.qty}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="line-through text-gray-400">₱{it.originalPricePhp.toFixed(2)}</span>
                <span className="font-bold text-[#10B981]">₱{it.discountedPricePhp.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link href={`/checkout?store=${encodeURIComponent(store.storeName)}&slug=${encodeURIComponent(params.slug)}&items=${encodeURIComponent(JSON.stringify(selected))}&total=${totalDisc}&orig=${totalOrig}`} className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4">
        <div className="btn-primary text-center py-3">Finalize order (Php {totalDisc.toFixed(2)})</div>
      </Link>
    </div>
  )
}


