import apiClient from '@/services/apiClient'

export interface ExchangeRates {
  base: string
  rates: Record<string, number>
  updated_at: string | null
  cached: boolean
}

export interface ExchangeRatesError {
  error: 'not_configured' | 'unavailable' | 'provider_error'
}

const STORAGE_PREFIX = 'exchangeRates:'
const CLIENT_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour — mirrors the backend's own cache TTL

interface StoredRates extends ExchangeRates {
  fetchedAt: number
}

function readClientCache(base: string): StoredRates | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + base)
    return raw ? (JSON.parse(raw) as StoredRates) : null
  } catch {
    return null
  }
}

function writeClientCache(base: string, rates: ExchangeRates) {
  try {
    const stored: StoredRates = { ...rates, fetchedAt: Date.now() }
    localStorage.setItem(STORAGE_PREFIX + base, JSON.stringify(stored))
  } catch {
    // localStorage unavailable/full — the rates just won't persist across reloads
  }
}

/**
 * Fetches live exchange rates through our backend (never calls the external
 * provider directly). Avoids refetching on every keystroke by reusing a
 * recent client-side cached response; on a network/server failure, falls
 * back to whatever is cached (however old) rather than showing nothing.
 */
export async function fetchExchangeRates(base = 'USD'): Promise<ExchangeRates> {
  const cached = readClientCache(base)
  if (cached && Date.now() - cached.fetchedAt < CLIENT_CACHE_TTL_MS) {
    return cached
  }

  try {
    const { data } = await apiClient.get<ExchangeRates>('/currency/rates/', { params: { base } })
    writeClientCache(base, data)
    return data
  } catch (error) {
    if (cached) return cached
    throw error
  }
}
