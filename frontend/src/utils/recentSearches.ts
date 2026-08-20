const STORAGE_KEY = 'recentSearches'
const MAX_ENTRIES = 6

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function addRecentSearch(query: string): void {
  const trimmed = query.trim()
  if (!trimmed) return
  const existing = getRecentSearches().filter((entry) => entry.toLowerCase() !== trimmed.toLowerCase())
  const updated = [trimmed, ...existing].slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
