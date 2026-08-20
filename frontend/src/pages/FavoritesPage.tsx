import { Heart } from 'lucide-react'
import DestinationCard from '@/components/DestinationCard'
import PlaceCard from '@/components/PlaceCard'
import { useFavorites } from '@/hooks/useFavorites'

function FavoritesPage() {
  const { favorites, isLoading } = useFavorites()

  const destinationFavorites = favorites.filter((favorite) => favorite.destination_detail)
  const placeFavorites = favorites.filter((favorite) => favorite.place_detail)

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center py-24 text-neutral-500">Loading…</div>
  }

  if (favorites.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent-50 text-accent-500">
          <Heart className="size-6" />
        </span>
        <h1 className="text-2xl font-semibold text-neutral-900">No favorites yet</h1>
        <p className="max-w-md text-neutral-500">
          Tap the heart icon on any destination or place to save it here.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold text-neutral-900">Favorites</h1>

      {destinationFavorites.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Destinations</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {destinationFavorites.map((favorite) => (
              <DestinationCard key={favorite.id} destination={favorite.destination_detail!} />
            ))}
          </div>
        </section>
      )}

      {placeFavorites.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Places</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {placeFavorites.map((favorite) => (
              <PlaceCard key={favorite.id} place={favorite.place_detail!} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default FavoritesPage
