import apiClient from '@/services/apiClient'

export interface TourProduct {
  product_code: string
  title: string | null
  description: string | null
  duration: string | null
  images: string[]
  rating: number | null
  review_count: number | null
  from_price: number | null
  currency: string | null
  product_url: string | null
  meeting_point: string | null
  cancellation_policy: string | null
  supports_in_app_booking: boolean
}

export interface ToursForPlace {
  configured: boolean
  products: TourProduct[]
}

export type AvailabilityStatus = 'available' | 'limited' | 'sold_out' | 'unavailable'

export interface AvailabilityResult {
  status: AvailabilityStatus
  price: number | null
  currency: string | null
}

export type AvailabilityErrorCode =
  | 'invalid_product'
  | 'invalid_date'
  | 'not_configured'
  | 'auth_error'
  | 'rate_limited'
  | 'timeout'
  | 'network_error'
  | 'service_unavailable'

export async function fetchToursForPlace(placeId: number | string): Promise<ToursForPlace> {
  const { data } = await apiClient.get<ToursForPlace>(`/places/${placeId}/tours/`)
  return data
}

export async function checkAvailability(
  placeId: number | string,
  productCode: string,
  date: string,
  travelers: number,
): Promise<AvailabilityResult> {
  const { data } = await apiClient.post<AvailabilityResult>(
    `/places/${placeId}/tours/${productCode}/availability/`,
    { date, travelers },
  )
  return data
}
