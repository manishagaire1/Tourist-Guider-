import { OPENWEATHER_KEY, USE_MOCK_DATA } from '@/services/config'
import { hashString, mulberry32 } from '@/utils/seededRandom'

export type WeatherCondition = 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rainy' | 'Thunderstorm' | 'Snowy'

export interface DayForecast {
  date: string
  dayLabel: string
  high: number
  low: number
  condition: WeatherCondition
}

export interface WeatherData {
  temp: number
  condition: WeatherCondition
  humidity: number
  windSpeed: number
  sunrise: string
  sunset: string
  forecast: DayForecast[]
}

const CONDITIONS: WeatherCondition[] = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorm', 'Snowy']

// Translation keys (under the "weather" namespace) rather than literal
// English text, so WeatherCard can render them via t() in the active
// language — condition/activity wording is UI chrome, not data.
export const CONDITION_LABEL_KEYS: Record<WeatherCondition, string> = {
  Sunny: 'weather.conditionSunny',
  'Partly Cloudy': 'weather.conditionPartlyCloudy',
  Cloudy: 'weather.conditionCloudy',
  Rainy: 'weather.conditionRainy',
  Thunderstorm: 'weather.conditionThunderstorm',
  Snowy: 'weather.conditionSnowy',
}

export const ACTIVITY_RECOMMENDATION_KEYS: Record<WeatherCondition, string[]> = {
  Sunny: ['weather.activityVisitOutdoorAttractions', 'weather.activityExploreParksGardens', 'weather.activityWalkingTour'],
  'Partly Cloudy': ['weather.activitySightseeing', 'weather.activityOutdoorMarkets', 'weather.activityCityWalkingTour'],
  Cloudy: ['weather.activityMuseums', 'weather.activityShoppingDistricts', 'weather.activityLocalCafes'],
  Rainy: ['weather.activityMuseumsGalleries', 'weather.activityIndoorMarkets', 'weather.activityCafesTeaHouses'],
  Thunderstorm: ['weather.activityMuseums', 'weather.activityShoppingMalls', 'weather.activityIndoorDining'],
  Snowy: ['weather.activityHotSprings', 'weather.activityCozyCafes', 'weather.activityIndoorCulturalSites'],
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function getMockWeather(seedKey: string, locale: string): WeatherData {
  // Reseeds once per calendar day so numbers stay stable within a session
  // instead of jumping on every re-render, without freezing forever.
  const dayStamp = new Date().toISOString().slice(0, 10)
  const rand = mulberry32(hashString(seedKey + dayStamp))

  const baseTemp = 15 + rand() * 18
  const condition = CONDITIONS[Math.floor(rand() * CONDITIONS.length)]

  const forecast: DayForecast[] = Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index + 1)
    const isoDate = date.toISOString().slice(0, 10)
    const dayRand = mulberry32(hashString(seedKey + isoDate))
    const high = Math.round(baseTemp + dayRand() * 6 - 3)
    return {
      date: isoDate,
      dayLabel: date.toLocaleDateString(locale, { weekday: 'short' }),
      high,
      low: high - Math.round(4 + dayRand() * 4),
      condition: CONDITIONS[Math.floor(dayRand() * CONDITIONS.length)],
    }
  })

  return {
    temp: Math.round(baseTemp),
    condition,
    humidity: Math.round(40 + rand() * 40),
    windSpeed: Math.round(5 + rand() * 20),
    sunrise: `0${5 + Math.floor(rand() * 2)}:${pad(Math.floor(rand() * 60))}`,
    sunset: `${17 + Math.floor(rand() * 3)}:${pad(Math.floor(rand() * 60))}`,
    forecast,
  }
}

export async function fetchWeather(seedKey: string, locale: string = 'en'): Promise<WeatherData> {
  if (USE_MOCK_DATA || !OPENWEATHER_KEY) {
    return getMockWeather(seedKey, locale)
  }
  // Live OpenWeather integration point — wire in once VITE_OPENWEATHER_KEY
  // and VITE_USE_MOCK_DATA=false are set; return shape matches WeatherData.
  throw new Error('Live weather is not configured yet.')
}
