import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import PlaceCard from '@/components/PlaceCard'
import PlaceCardSkeleton from '@/components/PlaceCardSkeleton'
import { fetchDestinations } from '@/services/destinationsService'
import { fetchCategories, fetchPlaces } from '@/services/placesService'
import { addRecentSearch, getRecentSearches } from '@/utils/recentSearches'
import type { Category, Destination, Place } from '@/types'

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$']
const RATINGS = [4.5, 4, 3.5, 3]
const POPULAR_SEARCHES = ['Tokyo', 'Temples', 'Museums', 'Beaches', 'Nightlife', 'Shopping']

function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const query = searchParams.get('q') ?? ''
  const categoryId = searchParams.get('category') ?? ''
  const destinationId = searchParams.get('destination') ?? ''
  const priceRange = searchParams.get('price') ?? ''
  const minRating = searchParams.get('min_rating') ?? ''

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]))
    fetchDestinations().then(setDestinations).catch(() => setDestinations([]))
    setRecentSearches(getRecentSearches())
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const timeout = setTimeout(() => {
      if (query) {
        addRecentSearch(query)
        setRecentSearches(getRecentSearches())
      }
      fetchPlaces({
        search: query || undefined,
        category: categoryId ? Number(categoryId) : undefined,
        destination: destinationId ? Number(destinationId) : undefined,
        price_range: priceRange || undefined,
        min_rating: minRating ? Number(minRating) : undefined,
        ordering: '-rating',
      })
        .then((data) => {
          if (!cancelled) setPlaces(data)
        })
        .catch(() => {
          if (!cancelled) setError('Something went wrong. Please try again.')
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query, categoryId, destinationId, priceRange, minRating])

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Explore Places</h1>
        <p className="mt-1 text-neutral-500">Search attractions, restaurants, hotels, and more.</p>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-pill border border-neutral-200 bg-white px-4 py-2.5 shadow-card">
        <Search className="size-4 shrink-0 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => updateParam('q', event.target.value)}
          placeholder="Search places, restaurants, hotels…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
        />
      </div>

      {!query && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-neutral-500">{recentSearches.length > 0 ? 'Recent searches:' : 'Popular searches:'}</span>
          {(recentSearches.length > 0 ? recentSearches : POPULAR_SEARCHES).map((term) => (
            <button
              key={term}
              onClick={() => updateParam('q', term)}
              className="rounded-pill border border-neutral-200 bg-white px-3 py-1 text-neutral-600 hover:border-accent-500 hover:text-accent-600"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-neutral-500">
          <SlidersHorizontal className="size-4" />
          Filters:
        </span>

        <select
          value={categoryId}
          onChange={(event) => updateParam('category', event.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-neutral-700"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={destinationId}
          onChange={(event) => updateParam('destination', event.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-neutral-700"
        >
          <option value="">All destinations</option>
          {destinations.map((destination) => (
            <option key={destination.id} value={destination.id}>
              {destination.name}
            </option>
          ))}
        </select>

        <select
          value={priceRange}
          onChange={(event) => updateParam('price', event.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-neutral-700"
        >
          <option value="">Any price</option>
          {PRICE_RANGES.map((price) => (
            <option key={price} value={price}>
              {price}
            </option>
          ))}
        </select>

        <select
          value={minRating}
          onChange={(event) => updateParam('min_rating', event.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-neutral-700"
        >
          <option value="">Any rating</option>
          {RATINGS.map((rating) => (
            <option key={rating} value={rating}>
              {rating}+ stars
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-card border border-red-100 bg-red-50 px-6 py-8 text-center text-red-700">
          {error}
        </div>
      )}

      {!error && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => <PlaceCardSkeleton key={index} />)
            : places.map((place) => <PlaceCard key={place.id} place={place} />)}
        </div>
      )}

      {!isLoading && !error && places.length === 0 && (
        <div className="rounded-card border border-neutral-200 bg-white px-6 py-12 text-center text-neutral-500">
          Sorry, we couldn't find any places matching your search.
        </div>
      )}
    </main>
  )
}

export default ExplorePage
