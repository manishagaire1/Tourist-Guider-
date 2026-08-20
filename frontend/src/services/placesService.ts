import apiClient from '@/services/apiClient'
import type { Category, Paginated, Place } from '@/types'

export interface PlaceQuery {
  destination?: number
  category?: number
  price_range?: string
  min_rating?: number
  search?: string
  ordering?: string
}

export async function fetchPlaces(query: PlaceQuery = {}): Promise<Place[]> {
  const { data } = await apiClient.get<Paginated<Place>>('/places/', { params: query })
  return data.results
}

export async function fetchPlace(id: string | number): Promise<Place> {
  const { data } = await apiClient.get<Place>(`/places/${id}/`)
  return data
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Paginated<Category>>('/categories/')
  return data.results
}
