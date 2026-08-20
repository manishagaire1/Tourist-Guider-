import type { LucideIcon } from 'lucide-react'

function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-neutral-200 bg-white p-5 shadow-card">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-2xl font-semibold text-neutral-900">{value}</p>
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
    </div>
  )
}

export default StatTile
