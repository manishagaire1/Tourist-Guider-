import apiClient from '@/services/apiClient'
import type { Favorite, Paginated } from '@/types'

export async function fetchFavorites(): Promise<Favorite[]> {
  const { data } = await apiClient.get<Paginated<Favorite>>('/favorites/')
  return data.results
}

export async function addDestinationFavorite(destinationId: number): Promise<Favorite> {
  const { data } = await apiClient.post<Favorite>('/favorites/', { destination: destinationId })
  return data
}

export async function addPlaceFavorite(placeId: number): Promise<Favorite> {
  const { data } = await apiClient.post<Favorite>('/favorites/', { place: placeId })
  return data
}

export async function removeFavorite(favoriteId: number): Promise<void> {
  await apiClient.delete(`/favorites/${favoriteId}/`)
}
