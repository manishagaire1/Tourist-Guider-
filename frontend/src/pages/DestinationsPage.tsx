import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import DestinationCard from '@/components/DestinationCard'
import DestinationCardSkeleton from '@/components/DestinationCardSkeleton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { fetchDestinations } from '@/services/destinationsService'
import { siteTitle } from '@/utils/seo'
import type { Destination } from '@/types'

function DestinationsPage() {
  const { t } = useTranslation()
  useDocumentTitle(siteTitle('All Destinations'))
  const [query, setQuery] = useState('')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    const timeout = setTimeout(() => {
      fetchDestinations({ search: query || undefined, ordering: '-rating' })
        .then((data) => {
          if (!cancelled) setDestinations(data)
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query])

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">{t('destinationsPage.title')}</h1>
        <p className="mt-1 text-neutral-500">{t('destinationsPage.subtitle')}</p>
      </div>

      <div className="mb-8 flex items-center gap-2 rounded-pill border border-neutral-200 bg-white px-4 py-2.5 shadow-card sm:max-w-md">
        <Search className="size-4 shrink-0 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('destinationsPage.searchPlaceholder')}
          className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => <DestinationCardSkeleton key={index} />)
          : destinations.map((destination) => <DestinationCard key={destination.id} destination={destination} />)}
      </div>

      {!isLoading && destinations.length === 0 && (
        <div className="rounded-card border border-neutral-200 bg-white px-6 py-12 text-center text-neutral-500">
          {t('destinationsPage.noResults')}
        </div>
      )}
    </main>
  )
}

export default DestinationsPage
