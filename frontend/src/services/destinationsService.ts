import apiClient from '@/services/apiClient'
import type { Destination, Paginated } from '@/types'

export interface DestinationQuery {
  search?: string
  ordering?: string
}

export async function fetchDestinations(query: DestinationQuery = {}): Promise<Destination[]> {
  const { data } = await apiClient.get<Paginated<Destination>>('/destinations/', { params: query })
  return data.results
}

export async function fetchDestination(id: string | number): Promise<Destination> {
  const { data } = await apiClient.get<Destination>(`/destinations/${id}/`)
  return data
}
