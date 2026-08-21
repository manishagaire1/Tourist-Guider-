import apiClient, { clearTokens, getStoredTokens, storeTokens } from '@/services/apiClient'
import type { LoginResponse, TravelPreference, User } from '@/types'

export interface RegisterPayload {
  username: string
  email: string
  password: string
  password2: string
  first_name?: string
  last_name?: string
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiClient.post('/auth/register/', payload)
}

export async function login(username: string, password: string): Promise<User> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login/', { username, password })
  storeTokens({ access: data.access, refresh: data.refresh })
  return data.user
}

export async function logout(): Promise<void> {
  const tokens = getStoredTokens()
  try {
    if (tokens) {
      await apiClient.post('/auth/logout/', { refresh: tokens.refresh })
    }
  } finally {
    clearTokens()
  }
}

export async function fetchProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/profile/')
  return data
}

export async function updateProfile(payload: Partial<User>): Promise<User> {
  const { data } = await apiClient.patch<User>('/auth/profile/', payload)
  return data
}

export async function fetchTravelPreferences(): Promise<TravelPreference> {
  const { data } = await apiClient.get<TravelPreference>('/auth/profile/preferences/')
  return data
}

export async function updateTravelPreferences(
  payload: { interests?: string[]; preferred_currency?: string },
): Promise<TravelPreference> {
  const { data } = await apiClient.patch<TravelPreference>('/auth/profile/preferences/', payload)
  return data
}
