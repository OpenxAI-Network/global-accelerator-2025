'use client'

import { useState } from 'react'

export function CheckoutInline({ item }: { item: any }) {
  const [method, setMethod] = useState<'pickup'|'delivery'>('pickup')
  const [provider, setProvider] = useState<string>('grab')
  const [result, setResult] = useState<any>(null)

  const checkout = async () => {
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [item], method, provider: method==='delivery'?provider:undefined }) })
    const data = await res.json()
    setResult(data)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 text-sm">
        <button className={`px-3 py-1 rounded border ${method==='pickup'?'bg-gray-100':''}`} onClick={()=>setMethod('pickup')}>Pickup</button>
        <button className={`px-3 py-1 rounded border ${method==='delivery'?'bg-gray-100':''}`} onClick={()=>setMethod('delivery')}>Delivery</button>
      </div>
      {method==='delivery' && (
        <select className="border rounded px-3 py-2 text-sm" value={provider} onChange={e=>setProvider(e.target.value)}>
          <option value="grab">GrabFood</option>
          <option value="foodpanda">FoodPanda</option>
          <option value="toktok">Toktok PH</option>
          <option value="joyride">JoyRide Food</option>
          <option value="angkas">Angkas Food</option>
        </select>
      )}
      <button className="btn-primary" onClick={checkout}>Place order</button>
      {result && (
        <div className="text-sm text-gray-700">
          <p>Estimated time: {result.etaMins} mins</p>
          {result.providerLink && <a className="text-[#0EA5E9] underline" href={result.providerLink} target="_blank">Open {provider}</a>}
        </div>
      )}
    </div>
  )
}


