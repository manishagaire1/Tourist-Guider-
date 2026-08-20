import axios from 'axios'
import { API_BASE_URL } from '@/services/config'
import type { AuthTokens } from '@/types'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getStoredTokens(): AuthTokens | null {
  const access = localStorage.getItem('accessToken')
  const refresh = localStorage.getItem('refreshToken')
  return access && refresh ? { access, refresh } : null
}

export function storeTokens(tokens: AuthTokens) {
  localStorage.setItem('accessToken', tokens.access)
  localStorage.setItem('refreshToken', tokens.refresh)
}

export function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

apiClient.interceptors.request.use((config) => {
  const tokens = getStoredTokens()
  if (tokens) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens()
  if (!tokens) return null

  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ access: string }>(`${API_BASE_URL}/auth/login/refresh/`, { refresh: tokens.refresh })
      .then((response) => {
        storeTokens({ access: response.data.access, refresh: tokens.refresh })
        return response.data.access
      })
      .catch(() => {
        clearTokens()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry && getStoredTokens()) {
      originalRequest._retry = true
      const newAccess = await refreshAccessToken()
      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return apiClient(originalRequest)
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
