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

const STORE_COORD = { lat: 7.0907, lng: 125.6125 } // approx Gaisano Mall Davao

function haversineKm(a:{lat:number,lng:number}, b:{lat:number,lng:number}) {
  const R=6371, dLat=(b.lat-a.lat)*Math.PI/180, dLng=(b.lng-a.lng)*Math.PI/180
  const s=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2
  return 2*R*Math.asin(Math.sqrt(s))
}

export default function BrowsePage() {
  const [items, setItems] = useState<Item[]>([])
  const [sortBy, setSortBy] = useState<'distance'|'price'|'rating'>('distance')
  const [mode, setMode] = useState<'list'|'map'>('list')
  const [userLoc, setUserLoc] = useState<{lat:number,lng:number}|null>(null)

  useEffect(() => {
    fetch('/api/items').then(r=>r.json()).then(d=> setItems(d.items||[]))
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLoc({lat: pos.coords.latitude, lng: pos.coords.longitude})
      })
    }
  }, [])

  // Group by store
  const stores = useMemo(() => {
    const byStore: Record<string, { storeName:string; storeAddressUrl:string; items: Item[]; rating:number; distanceKm:number }> = {}
    items.forEach(it => {
      const key = it.storeName
      if (!byStore[key]) {
        byStore[key] = {
          storeName: it.storeName,
          storeAddressUrl: it.storeAddressUrl,
          items: [],
          rating: 4.4,
          distanceKm: userLoc ? haversineKm(userLoc, STORE_COORD) : 0.5
        }
      }
      byStore[key].items.push(it)
    })
    let arr = Object.values(byStore)
    if (sortBy==='price') {
      arr = arr.sort((a,b)=> {
        const minA = Math.min(...a.items.map(x=>x.discountedPricePhp))
        const minB = Math.min(...b.items.map(x=>x.discountedPricePhp))
        return minA - minB
      })
    } else if (sortBy==='rating') {
      arr = arr.sort((a,b)=> b.rating - a.rating)
    } else {
      arr = arr.sort((a,b)=> a.distanceKm - b.distanceKm)
    }
    return arr
  }, [items, sortBy, userLoc])

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 grid grid-cols-2 bg-gray-100 rounded-lg overflow-hidden">
          <button className={`py-2 text-center ${mode==='list'?'bg-white font-semibold':''}`} onClick={()=>setMode('list')}>List</button>
          <button className={`py-2 text-center ${mode==='map'?'bg-white font-semibold':''}`} onClick={()=>setMode('map')}>Map</button>
        </div>
        {mode==='list' && (
          <select className="ml-3 border rounded px-2 py-2" value={sortBy} onChange={e=>setSortBy(e.target.value as any)}>
            <option value="distance">Closest</option>
            <option value="price">Lowest price</option>
            <option value="rating">Highest rating</option>
          </select>
        )}
      </div>

      {mode==='map' ? (
        <div className="rounded overflow-hidden">
          <iframe title="map" className="w-full aspect-square" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=Gaisano%20Mall%20of%20Davao&output=embed`}></iframe>
        </div>
      ) : (
        <div className="grid gap-3">
          {stores.map((s, idx) => (
            <Link key={idx} href={`/store/${encodeURIComponent(s.storeName.toLowerCase().replaceAll(' ','-'))}`}> 
              <div className="card p-4">
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded bg-gray-100 flex items-center justify-center text-xs">{s.storeName}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{s.storeName}</div>
                    <div className="text-xs text-gray-600">Pickup: Today 5:00-8:00 PM · {s.distanceKm.toFixed(1)} km · ★ {s.rating.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


