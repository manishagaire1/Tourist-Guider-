import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Star, Tag } from 'lucide-react'
import FavoriteButton from '@/components/FavoriteButton'
import { getLocalizedDescription, getLocalizedName } from '@/utils/localization'
import type { Place } from '@/types'

function PlaceCard({ place }: { place: Place }) {
  const { t, i18n } = useTranslation()
  const rating = place.average_rating ?? Number(place.rating)

  return (
    <Link
      to={`/places/${place.id}`}
      className="flex flex-col overflow-hidden rounded-card bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={place.image_url}
          alt={getLocalizedName(place, i18n.language)}
          loading="lazy"
          className="size-full object-cover"
        />
        <FavoriteButton type="place" id={place.id} className="absolute left-3 top-3" />
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-pill bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-800">
          <Star className="size-3.5 fill-accent-500 text-accent-500" />
          {rating ? rating.toFixed(1) : t('placeDetail.new')}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-neutral-900">{getLocalizedName(place, i18n.language)}</h3>
        <p className="flex items-center gap-1 text-xs text-neutral-500">
          <Tag className="size-3.5" />
          {getLocalizedName(place.category, i18n.language)}
          {place.price_range && <span className="ml-1">· {place.price_range}</span>}
        </p>
        <p className="line-clamp-2 text-sm text-neutral-600">{getLocalizedDescription(place, i18n.language)}</p>
        {place.address && (
          <p className="mt-auto flex items-center gap-1 pt-2 text-xs text-neutral-400">
            <MapPin className="size-3.5" />
            {place.address}
          </p>
        )}
      </div>
    </Link>
  )
}

export default PlaceCard
