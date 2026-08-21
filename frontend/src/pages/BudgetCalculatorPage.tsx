import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Calculator } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { fetchTravelPreferences, updateTravelPreferences } from '@/services/authService'
import { fetchExchangeRates, type ExchangeRates } from '@/services/currencyService'
import {
  SUPPORTED_CURRENCIES,
  convertCurrency,
  detectDefaultCurrency,
  formatCurrency,
} from '@/utils/currency'

interface BudgetCategory {
  key: string
  labelKey: string
  color: string
  amount: number
}

const CURRENCY_STORAGE_KEY = 'preferredCurrency'

function relativeUpdatedLabel(
  t: (key: string, options?: Record<string, unknown>) => string,
  updatedAt: string | null,
): string {
  if (!updatedAt) return ''
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(updatedAt)) / 60000))
  if (minutes < 1) return t('currency.updatedJustNow')
  if (minutes < 60) return t('currency.updatedMinutesAgo', { count: minutes })
  return t('currency.updatedHoursAgo', { count: Math.round(minutes / 60) })
}

function BudgetCalculatorPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [travelers, setTravelers] = useState(2)
  const [days, setDays] = useState(5)
  const [hotelPerNight, setHotelPerNight] = useState(120)
  const [foodPerDay, setFoodPerDay] = useState(40)
  const [transportationTotal, setTransportationTotal] = useState(300)
  const [activityPerDay, setActivityPerDay] = useState(30)
  const [shoppingTotal, setShoppingTotal] = useState(200)

  const [currency, setCurrency] = useState(() => localStorage.getItem(CURRENCY_STORAGE_KEY) ?? detectDefaultCurrency(i18n.language))
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [ratesUnavailable, setRatesUnavailable] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTravelPreferences().then((preference) => {
        if (preference.preferred_currency) setCurrency(preference.preferred_currency)
      })
    }
  }, [user])

  useEffect(() => {
    fetchExchangeRates('USD')
      .then(setRates)
      .catch(() => setRatesUnavailable(true))
  }, [])

  function handleCurrencyChange(nextCurrency: string) {
    setCurrency(nextCurrency)
    localStorage.setItem(CURRENCY_STORAGE_KEY, nextCurrency)
    if (user) {
      updateTravelPreferences({ preferred_currency: nextCurrency }).catch(() => {
        // best-effort — the localStorage value above still keeps the choice for this session
      })
    }
  }

  const hasLiveRate = currency !== 'USD' && !!rates?.rates[currency]
  const displayCurrency = currency === 'USD' || hasLiveRate ? currency : 'USD'

  function convertAmount(usdAmount: number): number {
    if (displayCurrency === 'USD' || !rates) return usdAmount
    return convertCurrency(usdAmount, 'USD', displayCurrency, rates.rates) ?? usdAmount
  }

  const percentFormatter = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language])

  const categories: BudgetCategory[] = useMemo(
    () => [
      { key: 'hotel', labelKey: 'budget.hotel', color: 'bg-primary-600', amount: hotelPerNight * days },
      { key: 'food', labelKey: 'budget.food', color: 'bg-accent-500', amount: foodPerDay * days * travelers },
      { key: 'transportation', labelKey: 'budget.transportation', color: 'bg-primary-300', amount: transportationTotal },
      { key: 'activities', labelKey: 'budget.activities', color: 'bg-accent-300', amount: activityPerDay * days * travelers },
      { key: 'shopping', labelKey: 'budget.shopping', color: 'bg-neutral-400', amount: shoppingTotal },
    ],
    [travelers, days, hotelPerNight, foodPerDay, transportationTotal, activityPerDay, shoppingTotal],
  )

  const total = categories.reduce((sum, category) => sum + category.amount, 0)
  const format = (usdAmount: number) => formatCurrency(convertAmount(usdAmount), displayCurrency, i18n.language)

  return (
    <main className="mx-auto max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-accent-50 text-accent-500">
          <Calculator className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{t('budget.title')}</h1>
          <p className="text-neutral-500">{t('budget.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-card border border-neutral-200 bg-white p-6">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            {t('currency.budgetCurrency')}
            <select
              value={currency}
              onChange={(event) => handleCurrencyChange(event.target.value)}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            >
              {SUPPORTED_CURRENCIES.map((option) => (
                <option key={option.code} value={option.code}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              {t('budget.travelers')}
              <input
                type="number"
                min={1}
                value={travelers}
                onChange={(event) => setTravelers(Math.max(1, Number(event.target.value)))}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              {t('budget.days')}
              <input
                type="number"
                min={1}
                value={days}
                onChange={(event) => setDays(Math.max(1, Number(event.target.value)))}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            {t('budget.hotelBudget')}
            <input
              type="number"
              min={0}
              value={hotelPerNight}
              onChange={(event) => setHotelPerNight(Math.max(0, Number(event.target.value)))}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            {t('budget.foodBudget')}
            <input
              type="number"
              min={0}
              value={foodPerDay}
              onChange={(event) => setFoodPerDay(Math.max(0, Number(event.target.value)))}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            {t('budget.transportationBudget')}
            <input
              type="number"
              min={0}
              value={transportationTotal}
              onChange={(event) => setTransportationTotal(Math.max(0, Number(event.target.value)))}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            {t('budget.activityBudget')}
            <input
              type="number"
              min={0}
              value={activityPerDay}
              onChange={(event) => setActivityPerDay(Math.max(0, Number(event.target.value)))}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            {t('budget.shoppingBudget')}
            <input
              type="number"
              min={0}
              value={shoppingTotal}
              onChange={(event) => setShoppingTotal(Math.max(0, Number(event.target.value)))}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
          </label>
        </div>

        <div className="flex flex-col gap-6 rounded-card border border-neutral-200 bg-white p-6">
          <div>
            <p className="text-sm text-neutral-500">{t('budget.estimatedTotal')}</p>
            <p className="text-4xl font-semibold text-neutral-900">{format(total)}</p>
            <p className="mt-1 text-sm text-neutral-500">
              {t('budget.perTravelerPerDay', {
                perTraveler: format(Math.round(total / travelers)),
                perDay: format(Math.round(total / days)),
              })}
            </p>

            {displayCurrency !== 'USD' && rates && (
              <p className="mt-2 text-xs text-neutral-400">
                {t('currency.rateLine', { rate: rates.rates[displayCurrency]?.toFixed(2), currency: displayCurrency })}
                {' · '}
                {relativeUpdatedLabel(t, rates.updated_at)}
                {rates.cached && ` · ${t('currency.usingCachedRate')}`}
              </p>
            )}

            {currency !== 'USD' && !hasLiveRate && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-accent-700">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  {t('currency.unavailable')} {t('currency.continuingInUsd')}
                </span>
              </p>
            )}
            {ratesUnavailable && currency === 'USD' && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-neutral-400">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>{t('currency.unavailable')}</span>
              </p>
            )}
          </div>

          <div className="flex h-3 w-full overflow-hidden rounded-pill bg-neutral-100">
            {categories.map((category) => (
              <div
                key={category.key}
                className={category.color}
                style={{ width: `${total > 0 ? (category.amount / total) * 100 : 0}%` }}
              />
            ))}
          </div>

          <ul className="flex flex-col gap-3">
            {categories.map((category) => (
              <li key={category.key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-neutral-700">
                  <span className={`size-2.5 rounded-full ${category.color}`} />
                  {t(category.labelKey)}
                </span>
                <span className="font-medium text-neutral-900">
                  {format(category.amount)}
                  <span className="ml-2 text-xs text-neutral-400">
                    {percentFormatter.format(total > 0 ? Math.round((category.amount / total) * 100) : 0)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}

export default BudgetCalculatorPage
