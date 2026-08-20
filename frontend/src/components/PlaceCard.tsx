import { MapPin, Star, Tag } from 'lucide-react'
import type { Place } from '@/types'

function PlaceCard({ place }: { place: Place }) {
  const rating = place.average_rating ?? Number(place.rating)

  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-white shadow-card transition hover:shadow-card-hover">
      <div className="relative h-40 overflow-hidden">
        <img src={place.image_url} alt={place.name} loading="lazy" className="size-full object-cover" />
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-pill bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-800">
          <Star className="size-3.5 fill-accent-500 text-accent-500" />
          {rating ? rating.toFixed(1) : 'New'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-neutral-900">{place.name}</h3>
        <p className="flex items-center gap-1 text-xs text-neutral-500">
          <Tag className="size-3.5" />
          {place.category.name}
          {place.price_range && <span className="ml-1">· {place.price_range}</span>}
        </p>
        <p className="line-clamp-2 text-sm text-neutral-600">{place.description}</p>
        {place.address && (
          <p className="mt-auto flex items-center gap-1 pt-2 text-xs text-neutral-400">
            <MapPin className="size-3.5" />
            {place.address}
          </p>
        )}
      </div>
    </div>
  )
}

export default PlaceCard
