import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import * as favoritesService from '@/services/favoritesService'
import type { Favorite } from '@/types'

interface FavoritesContextValue {
  favorites: Favorite[]
  isLoading: boolean
  isDestinationFavorited: (destinationId: number) => boolean
  isPlaceFavorited: (placeId: number) => boolean
  toggleDestinationFavorite: (destinationId: number) => Promise<void>
  togglePlaceFavorite: (placeId: number) => Promise<void>
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(() => {
    if (!user) {
      setFavorites([])
      return
    }
    setIsLoading(true)
    favoritesService
      .fetchFavorites()
      .then(setFavorites)
      .finally(() => setIsLoading(false))
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  function isDestinationFavorited(destinationId: number) {
    return favorites.some((favorite) => favorite.destination === destinationId)
  }

  function isPlaceFavorited(placeId: number) {
    return favorites.some((favorite) => favorite.place === placeId)
  }

  async function toggleDestinationFavorite(destinationId: number) {
    const existing = favorites.find((favorite) => favorite.destination === destinationId)
    if (existing) {
      setFavorites((prev) => prev.filter((favorite) => favorite.id !== existing.id))
      await favoritesService.removeFavorite(existing.id)
    } else {
      const created = await favoritesService.addDestinationFavorite(destinationId)
      setFavorites((prev) => [created, ...prev])
    }
  }

  async function togglePlaceFavorite(placeId: number) {
    const existing = favorites.find((favorite) => favorite.place === placeId)
    if (existing) {
      setFavorites((prev) => prev.filter((favorite) => favorite.id !== existing.id))
      await favoritesService.removeFavorite(existing.id)
    } else {
      const created = await favoritesService.addPlaceFavorite(placeId)
      setFavorites((prev) => [created, ...prev])
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        isDestinationFavorited,
        isPlaceFavorited,
        toggleDestinationFavorite,
        togglePlaceFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}
