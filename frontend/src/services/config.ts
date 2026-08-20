// Central place to read env config and decide mock vs. real API mode.
// Every feature service (destinations, places, weather, ...) should branch on
// USE_MOCK_DATA rather than hardcoding fetch logic, so switching to live APIs
// later is a one-line change per service, not a rewrite.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? ''
export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? ''
export const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY ?? ''
