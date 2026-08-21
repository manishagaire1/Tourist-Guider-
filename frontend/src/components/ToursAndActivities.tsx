import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { CalendarCheck, Clock, ExternalLink, Star, Users } from 'lucide-react'
import {
  checkAvailability,
  fetchToursForPlace,
  type AvailabilityErrorCode,
  type AvailabilityResult,
  type TourProduct,
} from '@/services/toursService'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function TourCard({ placeId, product }: { placeId: number; product: TourProduct }) {
  const { t, i18n } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [date, setDate] = useState(todayISO())
  const [travelers, setTravelers] = useState(2)
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<AvailabilityResult | null>(null)
  const [errorCode, setErrorCode] = useState<AvailabilityErrorCode | null>(null)

  async function handleCheckAvailability() {
    setIsChecking(true)
    setResult(null)
    setErrorCode(null)
    try {
      const data = await checkAvailability(placeId, product.product_code, date, travelers)
      setResult(data)
    } catch (error) {
      const code = axios.isAxiosError<{ error?: AvailabilityErrorCode }>(error)
        ? error.response?.data?.error
        : undefined
      setErrorCode(code ?? 'service_unavailable')
    } finally {
      setIsChecking(false)
    }
  }

  const statusStyles: Record<string, string> = {
    available: 'bg-primary-50 text-primary-700 border-primary-200',
    limited: 'bg-accent-50 text-accent-700 border-accent-200',
    sold_out: 'bg-red-50 text-red-700 border-red-200',
    unavailable: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-neutral-200 bg-white p-4 shadow-card">
      <div className="flex gap-3">
        {product.images[0] && (
          <img src={product.images[0]} alt={product.title ?? ''} className="size-20 shrink-0 rounded-lg object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-neutral-900">{product.title}</p>
          {product.rating !== null && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
              <Star className="size-3.5 fill-accent-500 text-accent-500" />
              {product.rating.toFixed(1)}
              {product.review_count !== null && ` (${product.review_count})`}
            </p>
          )}
          {product.duration && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
              <Clock className="size-3.5" />
              {product.duration}
            </p>
          )}
          {product.from_price !== null && product.currency && (
            <p className="mt-1 text-sm font-medium text-neutral-900">
              {t('tours.fromPrice', {
                price: new Intl.NumberFormat(i18n.language, {
                  style: 'currency',
                  currency: product.currency,
                  maximumFractionDigits: 0,
                }).format(product.from_price),
              })}
            </p>
          )}
        </div>
      </div>

      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-center gap-1.5 rounded-pill border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:border-accent-500 hover:text-accent-600"
        >
          <CalendarCheck className="size-4" />
          {t('tours.viewAvailability')}
        </button>
      ) : (
        <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
            />
            <label className="flex items-center gap-1.5 text-sm text-neutral-600">
              <Users className="size-4" />
              <input
                type="number"
                min={1}
                max={20}
                value={travelers}
                onChange={(event) => setTravelers(Math.max(1, Number(event.target.value)))}
                className="w-16 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
              />
            </label>
            <button
              onClick={handleCheckAvailability}
              disabled={isChecking}
              className="rounded-pill bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-60"
            >
              {isChecking ? t('tours.checking') : t('tours.checkAvailability')}
            </button>
          </div>

          {result && (
            <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${statusStyles[result.status]}`}>
              <span>{t(`tours.status.${result.status}`)}</span>
              {result.status !== 'sold_out' && result.status !== 'unavailable' && product.product_url && (
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-medium underline hover:no-underline"
                >
                  {t('tours.continueToViator')}
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          )}

          {errorCode && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {t('tours.error')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function ToursAndActivities({ placeId }: { placeId: number }) {
  const { t } = useTranslation()
  const [products, setProducts] = useState<TourProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchToursForPlace(placeId)
      .then((data) => {
        if (!cancelled) setProducts(data.products)
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [placeId])

  if (isLoading || products.length === 0) return null

  return (
    <section className="border-t border-neutral-200 py-8">
      <h2 className="mb-4 text-xl font-semibold text-neutral-900">{t('tours.title')}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <TourCard key={product.product_code} placeId={placeId} product={product} />
        ))}
      </div>
    </section>
  )
}

export default ToursAndActivities
