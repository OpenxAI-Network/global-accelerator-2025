'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const STORE_MAP = 'https://maps.app.goo.gl/fsoyMr7umRkh3G3a7'

export default function MobileChrome({ children }: { children: React.ReactNode }) {
  const [geoStatus, setGeoStatus] = useState<'idle'|'granted'|'denied'>('idle')

  useEffect(() => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGeoStatus('granted'),
        () => setGeoStatus('denied')
      )
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#064E3B] max-w-md mx-auto border-x">
      <header className="px-4 py-3 flex items-center justify-center border-b">
        <Link href="/browse" className="font-extrabold">SurpriseMePH</Link>
      </header>

      <main className="pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t max-w-md mx-auto">
        <div className="grid grid-cols-2">
          <Link href="/browse" className="py-3 text-center font-medium hover:bg-gray-50">Browse</Link>
          <Link href="/account" className="py-3 text-center font-medium hover:bg-gray-50">Account</Link>
        </div>
      </nav>
    </div>
  )
}


