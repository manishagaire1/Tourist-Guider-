import { Link } from 'react-router-dom'
import {
  HandHeart,
  Languages,
  Luggage,
  ShieldCheck,
  Siren,
  Stamp,
  TrainFront,
  Users,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { TRAVEL_TIPS } from '@/data/travelTips'

const ICONS: Record<string, LucideIcon> = {
  'shield-check': ShieldCheck,
  'train-front': TrainFront,
  users: Users,
  utensils: Utensils,
  wallet: Wallet,
  siren: Siren,
  'hand-heart': HandHeart,
  luggage: Luggage,
  stamp: Stamp,
  languages: Languages,
}

function TravelTipsPage() {
  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Travel Tips</h1>
        <p className="mt-1 text-neutral-500">Practical advice to travel safer, smarter, and more respectfully.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TRAVEL_TIPS.map((tip) => {
          const Icon = ICONS[tip.icon]
          return (
            <Link
              key={tip.slug}
              to={`/travel-tips/${tip.slug}`}
              className="group flex flex-col gap-3 rounded-card border border-neutral-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <Icon className="size-5" />
              </span>
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-accent-600">{tip.category}</span>
                <h2 className="mt-1 text-lg font-semibold text-neutral-900">{tip.title}</h2>
              </div>
              <p className="text-sm text-neutral-600">{tip.summary}</p>
              <span className="mt-auto text-sm font-medium text-accent-600 group-hover:underline">Read more</span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}

export default TravelTipsPage
