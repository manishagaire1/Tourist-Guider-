import apiClient from '@/services/apiClient'
import type { ItineraryItem, Paginated, Trip } from '@/types'

export interface TripPayload {
  name: string
  destination?: number | null
  start_date: string
  end_date: string
  notes?: string
}

export async function fetchTrips(): Promise<Trip[]> {
  const { data } = await apiClient.get<Paginated<Trip>>('/trips/')
  return data.results
}

export async function fetchTrip(id: number | string): Promise<Trip> {
  const { data } = await apiClient.get<Trip>(`/trips/${id}/`)
  return data
}

export async function createTrip(payload: TripPayload): Promise<Trip> {
  const { data } = await apiClient.post<Trip>('/trips/', payload)
  return data
}

export async function updateTrip(id: number, payload: Partial<TripPayload>): Promise<Trip> {
  const { data } = await apiClient.patch<Trip>(`/trips/${id}/`, payload)
  return data
}

export async function deleteTrip(id: number): Promise<void> {
  await apiClient.delete(`/trips/${id}/`)
}

export interface ItineraryItemPayload {
  trip: number
  place: number
  day_number: number
  time?: string | null
  order?: number
  notes?: string
}

export async function addItineraryItem(payload: ItineraryItemPayload): Promise<ItineraryItem> {
  const { data } = await apiClient.post<ItineraryItem>('/itinerary-items/', payload)
  return data
}

export async function updateItineraryItem(
  id: number,
  payload: Partial<ItineraryItemPayload>,
): Promise<ItineraryItem> {
  const { data } = await apiClient.patch<ItineraryItem>(`/itinerary-items/${id}/`, payload)
  return data
}

export async function removeItineraryItem(id: number): Promise<void> {
  await apiClient.delete(`/itinerary-items/${id}/`)
}
