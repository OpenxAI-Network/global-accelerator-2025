'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  const submit = async () => {
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload-excel', { method: 'POST', body: form })
    const data = await res.json()
    if (data.ok) setMessage(`Uploaded ${data.count} items.`)
    else setMessage(data.error || 'Upload failed')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-4">
      <h1 className="text-2xl font-bold">Upload Store Stock (Excel)</h1>
      <p className="text-sm text-gray-600">Columns required: Store name, Store address, Food name, Qty available, Original price (Php), Discounted price (Php), Surprise Me</p>
      <input type="file" accept=".xlsx,.xls" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
      <button className="btn-primary" onClick={submit}>Upload</button>
      {message && <p className="text-sm">{message}</p>}
      <a className="text-[#0EA5E9] underline text-sm" href="/listings">Go to listings</a>
    </div>
  )
}


