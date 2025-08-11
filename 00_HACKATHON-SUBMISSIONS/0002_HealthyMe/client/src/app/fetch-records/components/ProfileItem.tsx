export function ProfileItem({ label, value }:any) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  )
}

