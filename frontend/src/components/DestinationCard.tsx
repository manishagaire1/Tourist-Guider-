import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import type { Destination } from '@/types'

function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link
      to={`/destinations/${destination.id}`}
      className="group flex flex-col overflow-hidden rounded-card bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={destination.image_url}
          alt={destination.name}
          loading="lazy"
          className="size-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-pill bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-sm">
          <Star className="size-3.5 fill-accent-500 text-accent-500" />
          {Number(destination.rating).toFixed(1)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-neutral-900">{destination.name}</h3>
        </div>
        <p className="flex items-center gap-1 text-sm text-neutral-500">
          <MapPin className="size-3.5" />
          {destination.country}
        </p>
        <p className="line-clamp-2 text-sm text-neutral-600">{destination.description}</p>

        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-neutral-500">
          <span>{destination.places_count} attractions</span>
          <span>Best: {destination.best_time_to_visit}</span>
        </div>

        <span className="mt-3 inline-flex items-center justify-center rounded-pill border border-neutral-200 py-2 text-sm font-medium text-neutral-800 transition group-hover:border-accent-500 group-hover:text-accent-600">
          Explore
        </span>
      </div>
    </Link>
  )
}

export default DestinationCard
