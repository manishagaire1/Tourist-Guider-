import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Cloud, CloudLightning, CloudRain, CloudSnow, CloudSun, Droplets, Sun, Sunrise, Sunset, Wind } from 'lucide-react'
import {
  ACTIVITY_RECOMMENDATION_KEYS,
  CONDITION_LABEL_KEYS,
  fetchWeather,
  type WeatherCondition,
  type WeatherData,
} from '@/services/weatherService'

const CONDITION_ICONS: Record<WeatherCondition, typeof Sun> = {
  Sunny: Sun,
  'Partly Cloudy': CloudSun,
  Cloudy: Cloud,
  Rainy: CloudRain,
  Thunderstorm: CloudLightning,
  Snowy: CloudSnow,
}

// destinationName is the English name — kept stable as the mock-weather seed
// key regardless of active language, so switching languages doesn't change
// "today's weather"; displayName is what's shown to the user.
function WeatherCard({ destinationName, displayName }: { destinationName: string; displayName?: string }) {
  const { t, i18n } = useTranslation()
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchWeather(destinationName, i18n.language).then((data) => {
      if (!cancelled) setWeather(data)
    })
    return () => {
      cancelled = true
    }
  }, [destinationName, i18n.language])

  if (!weather) {
    return <div className="h-64 animate-pulse rounded-card bg-neutral-200" />
  }

  const Icon = CONDITION_ICONS[weather.condition]

  return (
    <div className="rounded-card border border-neutral-200 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{t('weather.weatherIn', { name: displayName ?? destinationName })}</p>
          <p className="text-4xl font-semibold text-neutral-900">{weather.temp}°C</p>
          <p className="text-neutral-600">{t(CONDITION_LABEL_KEYS[weather.condition])}</p>
        </div>
        <Icon className="size-16 text-accent-500" strokeWidth={1.5} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-5 text-sm text-neutral-600 sm:grid-cols-4">
        <span className="flex items-center gap-1.5">
          <Droplets className="size-4 text-primary-500" />
          {weather.humidity}%
        </span>
        <span className="flex items-center gap-1.5">
          <Wind className="size-4 text-primary-500" />
          {weather.windSpeed} km/h
        </span>
        <span className="flex items-center gap-1.5">
          <Sunrise className="size-4 text-primary-500" />
          {weather.sunrise}
        </span>
        <span className="flex items-center gap-1.5">
          <Sunset className="size-4 text-primary-500" />
          {weather.sunset}
        </span>
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
        {weather.forecast.map((day) => {
          const DayIcon = CONDITION_ICONS[day.condition]
          return (
            <div
              key={day.date}
              className="flex min-w-16 shrink-0 flex-col items-center gap-1 rounded-lg bg-neutral-50 px-3 py-2.5"
            >
              <span className="text-xs text-neutral-500">{day.dayLabel}</span>
              <DayIcon className="size-5 text-primary-600" />
              <span className="text-xs font-medium text-neutral-800">
                {day.high}°/{day.low}°
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-5 border-t border-neutral-100 pt-5">
        <p className="mb-2 text-sm font-medium text-neutral-800">{t('weather.recommendedActivities')}</p>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_RECOMMENDATION_KEYS[weather.condition].map((key) => (
            <span key={key} className="rounded-pill bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
              {t(key)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WeatherCard
