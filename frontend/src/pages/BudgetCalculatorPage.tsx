import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calculator } from 'lucide-react'

interface BudgetCategory {
  key: string
  labelKey: string
  color: string
  amount: number
}

function BudgetCalculatorPage() {
  const { t, i18n } = useTranslation()
  const [travelers, setTravelers] = useState(2)
  const [days, setDays] = useState(5)
  const [hotelPerNight, setHotelPerNight] = useState(120)
  const [foodPerDay, setFoodPerDay] = useState(40)
  const [transportationTotal, setTransportationTotal] = useState(300)
  const [activityPerDay, setActivityPerDay] = useState(30)
  const [shoppingTotal, setShoppingTotal] = useState(200)

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    [i18n.language],
  )
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
            <p className="text-4xl font-semibold text-neutral-900">{currencyFormatter.format(total)}</p>
            <p className="mt-1 text-sm text-neutral-500">
              {t('budget.perTravelerPerDay', {
                perTraveler: currencyFormatter.format(Math.round(total / travelers)),
                perDay: currencyFormatter.format(Math.round(total / days)),
              })}
            </p>
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
                  {currencyFormatter.format(category.amount)}
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
