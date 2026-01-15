export default function AccountPage() {
  const pastOrders = [
    { store: 'I Want Cake Store', date: new Date(Date.now() - 1000*60*60).toISOString() },
    { store: 'I Want Cake Store', date: new Date(Date.now() - 1000*60*60*24*2).toISOString() }
  ]
  const stamps = 10
  const earned = 2

  return (
    <div className="px-4 py-4 space-y-3">
      <h1 className="text-xl font-bold">Account</h1>
      <div className="card">
        <div className="font-semibold">Your Profile</div>
        <div className="text-sm text-gray-600">Name: Guest</div>
        <div className="text-sm text-gray-600">Mobile: +63 ••• ••• ••••</div>
        <div className="text-sm text-gray-600">Email: myemail@gmail.com</div>
      </div>
      <div className="card space-y-2">
        <div className="font-semibold">Past Orders</div>
        {pastOrders.sort((a,b)=> new Date(b.date).getTime()-new Date(a.date).getTime()).map((o,i)=> (
          <div key={i} className="flex justify-between text-sm">
            <div>{o.store}</div>
            <div className="text-gray-500">{new Date(o.date).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="card space-y-2">
        <div className="font-semibold">Loyalty</div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({length: stamps}).map((_,i)=> {
            const label = i===5 ? '30%OFF' : i===9 ? '50%OFF' : ''
            return (
              <div key={i} className={`w-12 h-12 rounded-full border flex items-center justify-center text-[10px] text-center p-1 ${i<earned? 'bg-[#10B981] text-white':'bg-white'}`}>
                {i<earned ? '✓' : (label || '')}
              </div>
            )
          })}
        </div>
        <div className="text-xs text-gray-600">Rewards: 6th order = 30% off, 10th order = 50% off. Vouchers apply to your next order, not the ongoing one.</div>
      </div>
      <div className="card">
        <div className="font-semibold">Vouchers</div>
        <div className="text-sm text-gray-600">No vouchers.</div>
      </div>
      <div className="card">
        <div className="font-semibold">Settings</div>
        <div className="text-sm text-gray-600">Notifications, payment, addresses (coming soon).</div>
      </div>
    </div>
  )
}


