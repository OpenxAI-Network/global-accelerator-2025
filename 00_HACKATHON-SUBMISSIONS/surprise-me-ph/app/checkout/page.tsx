'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CheckoutPage({ searchParams }: any) {
  const [method, setMethod] = useState<'delivery'|'pickup'>('delivery')
  const [pay, setPay] = useState<'cash'|'card'|'wallet'>('cash')
  const [wallet, setWallet] = useState<'gcash'|'maya'>('gcash')
  const [cardSaved, setCardSaved] = useState(false)
  const [walletSaved, setWalletSaved] = useState(false)
  const store = searchParams?.store || 'I Want Cake Store'
  const storeSlug = searchParams?.slug || 'i-want-cake-store'
  const items = (() => { try { return JSON.parse(decodeURIComponent(searchParams?.items || '[]')) } catch { return [] } })()
  const total = Number(searchParams?.total || 0)
  const orig = Number(searchParams?.orig || 0)
  const saved = Math.max(orig - total, 0)

  useEffect(()=>{},[])

  const place = async () => {
    alert('Order placed! (demo)')
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="text-xl font-bold">Checkout</h1>
      <div className="text-sm text-gray-600">Store: {store}</div>
      <div className="card space-y-2">
        <div className="font-semibold">Your selection</div>
        {items.length === 0 ? (
          <div className="text-sm text-gray-600">No items selected.</div>
        ) : (
          <div className="space-y-1 text-sm">
            {items.map((it:any, idx:number)=> (
              <div key={idx} className="flex justify-between">
                <div>{it.foodName}</div>
                <div className="flex items-center gap-2">
                  <span className="line-through text-gray-400">₱{Number(it.originalPricePhp).toFixed(2)}</span>
                  <span className="font-semibold">₱{Number(it.discountedPricePhp).toFixed(2)}</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t flex justify-between font-semibold">
              <div>Total</div>
              <div>₱{total.toFixed(2)}</div>
            </div>
            <div className="text-xs text-green-700">You have saved ₱{saved.toFixed(2)}</div>
          </div>
        )}
        <Link href={`/store/${storeSlug}`} className="text-sm underline">← Back to items</Link>
      </div>

      <div className="card space-y-3">
        <div className="font-semibold">Delivery method</div>
        <div className="flex gap-2">
          <button className={`px-3 py-2 rounded border ${method==='delivery'?'bg-gray-100':''}`} onClick={()=>setMethod('delivery')}>Delivery (default)</button>
          <button className={`px-3 py-2 rounded border ${method==='pickup'?'bg-gray-100':''}`} onClick={()=>setMethod('pickup')}>Pickup</button>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="font-semibold">Payment</div>
        <div className="flex gap-2">
          <button className={`px-3 py-2 rounded border ${pay==='cash'?'bg-gray-100':''}`} onClick={()=>setPay('cash')}>Cash</button>
          <button className={`px-3 py-2 rounded border ${pay==='card'?'bg-gray-100':''}`} onClick={()=>setPay('card')}>Debit/Credit Card</button>
          <button className={`px-3 py-2 rounded border ${pay==='wallet'?'bg-gray-100':''}`} onClick={()=>setPay('wallet')}>Online Wallet</button>
        </div>

        {pay==='card' && (
          <div className="grid gap-2">
            <input className="border rounded p-2" placeholder="Name on card" />
            <input className="border rounded p-2" placeholder="Card number" />
            <div className="grid grid-cols-2 gap-2">
              <input className="border rounded p-2" placeholder="MM/YY" />
              <input className="border rounded p-2" placeholder="CVC" />
            </div>
            <label className="text-sm inline-flex items-center gap-2"><input type="checkbox" checked={cardSaved} onChange={e=>setCardSaved(e.target.checked)} /> Save for future use</label>
          </div>
        )}

        {pay==='wallet' && (
          <div className="grid gap-2">
            <select className="border rounded p-2" value={wallet} onChange={e=>setWallet(e.target.value as any)}>
              <option value="gcash">GCash</option>
              <option value="maya">Maya</option>
            </select>
            <input className="border rounded p-2" placeholder="Name on account" />
            <input className="border rounded p-2" placeholder="Wallet account / mobile" />
            <label className="text-sm inline-flex items-center gap-2"><input type="checkbox" checked={walletSaved} onChange={e=>setWalletSaved(e.target.checked)} /> Save for future use</label>
          </div>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4">
        <button className="btn-primary w-full py-3" onClick={place}>Place order</button>
      </div>
    </div>
  )
}


