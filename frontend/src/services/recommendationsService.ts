import apiClient from '@/services/apiClient'
import type { Destination } from '@/types'

export interface RecommendationsResponse {
  based_on: string[]
  results: Destination[]
}

export async function fetchRecommendations(): Promise<RecommendationsResponse> {
  const { data } = await apiClient.get<RecommendationsResponse>('/recommendations/')
  return data
}
