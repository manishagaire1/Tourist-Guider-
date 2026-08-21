import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Map as MapIcon, Search } from 'lucide-react'
import DestinationCard from '@/components/DestinationCard'
import DestinationCardSkeleton from '@/components/DestinationCardSkeleton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { fetchDestinations } from '@/services/destinationsService'
import { addRecentSearch } from '@/utils/recentSearches'
import { siteTitle } from '@/utils/seo'
import type { Destination } from '@/types'

function HomePage() {
  const { t } = useTranslation()
  useDocumentTitle(siteTitle())
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchDestinations({ ordering: '-rating' })
      .then((data) => {
        if (!cancelled) setDestinations(data)
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
  }, [])

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) addRecentSearch(trimmed)
    navigate(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : '/explore')
  }

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-primary-950">
        <img
          src="https://picsum.photos/seed/travel-hero/1600/900"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary-950 via-primary-950/70 to-primary-900/40" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-28 text-center sm:px-6 sm:py-36">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t('home.heroTitle')}</h1>
          <p className="max-w-xl text-primary-100">{t('home.heroSubtitle')}</p>

          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-xl items-center gap-2 rounded-pill bg-white p-2 shadow-card-hover"
          >
            <Search className="ml-3 size-5 shrink-0 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('home.searchPlaceholder')}
              className="w-full bg-transparent py-2 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded-pill bg-accent-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600"
            >
              {t('home.search')}
            </button>
          </form>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/explore')}
              className="rounded-pill bg-white px-6 py-3 text-sm font-medium text-neutral-900 shadow-card transition hover:shadow-card-hover"
            >
              {t('home.exploreNow')}
            </button>
            <button
              onClick={() => navigate('/map')}
              className="flex items-center gap-2 rounded-pill border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <MapIcon className="size-4" />
              {t('home.viewMap')}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">{t('home.popularDestinations')}</h2>
            <p className="mt-1 text-neutral-500">{t('home.popularDestinationsSubtitle')}</p>
          </div>
        </div>

        {error && (
          <div className="rounded-card border border-red-100 bg-red-50 px-6 py-8 text-center text-red-700">
            {error}
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => <DestinationCardSkeleton key={index} />)
              : destinations.map((destination) => (
                  <DestinationCard key={destination.id} destination={destination} />
                ))}
          </div>
        )}

        {!isLoading && !error && destinations.length === 0 && (
          <div className="rounded-card border border-neutral-200 bg-white px-6 py-12 text-center text-neutral-500">
            {t('home.noDestinations')}
          </div>
        )}
      </section>
    </main>
  )
}

export default HomePage
