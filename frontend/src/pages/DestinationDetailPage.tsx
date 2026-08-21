import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarRange, MapPin, Star } from 'lucide-react'
import FavoriteButton from '@/components/FavoriteButton'
import PlaceCard from '@/components/PlaceCard'
import WeatherCard from '@/components/WeatherCard'
import { fetchDestination } from '@/services/destinationsService'
import { fetchPlaces } from '@/services/placesService'
import { getLocalizedDescription, getLocalizedName } from '@/utils/localization'
import type { Destination, Place } from '@/types'

function DestinationDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setIsLoading(true)
    setError(null)

    Promise.all([fetchDestination(id), fetchPlaces({ destination: Number(id) })])
      .then(([destinationData, placesData]) => {
        if (cancelled) return
        setDestination(destinationData)
        setPlaces(placesData)
      })
      .catch(() => {
        if (!cancelled) setError(t('common.somethingWentWrong'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center py-24 text-neutral-500">{t('common.loading')}</div>
  }

  if (error || !destination) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-center text-red-600">
        {error ?? t('common.somethingWentWrong')}
      </div>
    )
  }

  const name = getLocalizedName(destination, i18n.language)

  return (
    <main className="flex-1">
      <div className="relative h-72 overflow-hidden sm:h-96">
        <img src={destination.image_url} alt={name} className="size-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />
        <FavoriteButton type="destination" id={destination.id} className="absolute right-4 top-4" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">{name}</h1>
          <p className="mt-1 flex items-center gap-1 text-primary-100">
            <MapPin className="size-4" />
            {destination.country}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-6 border-b border-neutral-200 pb-6 text-sm text-neutral-600">
          <span className="flex items-center gap-1.5 font-medium text-neutral-900">
            <Star className="size-4 fill-accent-500 text-accent-500" />
            {Number(destination.rating).toFixed(1)} {t('common.rating')}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarRange className="size-4" />
            {t('destinationDetail.bestTimeToVisit', { date: destination.best_time_to_visit })}
          </span>
          <span>{t('destinationDetail.placesToExplore', { count: destination.places_count })}</span>
        </div>

        <p className="max-w-3xl py-6 text-neutral-700">{getLocalizedDescription(destination, i18n.language)}</p>

        <div className="mb-10 max-w-lg">
          <WeatherCard destinationName={destination.name} displayName={name} />
        </div>

        <h2 className="mb-4 text-xl font-semibold text-neutral-900">
          {t('destinationDetail.thingsToDo', { name })}
        </h2>
        {places.length === 0 ? (
          <p className="text-neutral-500">{t('destinationDetail.noPlaces')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default DestinationDetailPage
