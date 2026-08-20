import apiClient from '@/services/apiClient'
import type { Paginated, Review } from '@/types'

export async function fetchReviews(placeId: number): Promise<Review[]> {
  const { data } = await apiClient.get<Paginated<Review>>('/reviews/', { params: { place: placeId } })
  return data.results
}

export async function createReview(placeId: number, rating: number, comment: string): Promise<Review> {
  const { data } = await apiClient.post<Review>('/reviews/', { place: placeId, rating, comment })
  return data
}

export async function updateReview(reviewId: number, rating: number, comment: string): Promise<Review> {
  const { data } = await apiClient.patch<Review>(`/reviews/${reviewId}/`, { rating, comment })
  return data
}

export async function deleteReview(reviewId: number): Promise<void> {
  await apiClient.delete(`/reviews/${reviewId}/`)
}
