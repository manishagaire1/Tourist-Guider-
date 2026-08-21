import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarRange, CloudOff, MapPin, Plus, Trash2 } from 'lucide-react'
import { fetchDestinations } from '@/services/destinationsService'
import { getAllOfflineTrips } from '@/services/offlineDb'
import { createTrip, deleteTrip, fetchTrips } from '@/services/tripsService'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { getLocalizedName } from '@/utils/localization'
import type { Destination, Trip } from '@/types'

function TripsPage() {
  const { t, i18n } = useTranslation()
  const { isOnline, isSyncing } = useOnlineStatus()
  const wasSyncing = useRef(isSyncing)
  const [trips, setTrips] = useState<Trip[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [offlineTripIds, setOfflineTripIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isShowingOfflineData, setIsShowingOfflineData] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState({ name: '', destination: '', start_date: '', end_date: '' })
  const [error, setError] = useState<string | null>(null)

  async function loadTrips() {
    getAllOfflineTrips().then((offline) => setOfflineTripIds(new Set(offline.map((trip) => trip.id))))

    // Check connectivity explicitly — the service worker's own API cache can
    // otherwise serve a previously-fetched list while offline and mask that
    // it's a possibly-stale saved copy.
    if (!navigator.onLine) {
      const offline = await getAllOfflineTrips()
      setTrips(offline)
      setIsShowingOfflineData(true)
      return
    }

    try {
      const [tripsData, destinationsData] = await Promise.all([fetchTrips(), fetchDestinations()])
      setTrips(tripsData)
      setDestinations(destinationsData)
      setIsShowingOfflineData(false)
    } catch {
      const offline = await getAllOfflineTrips()
      setTrips(offline)
      setIsShowingOfflineData(true)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    loadTrips().finally(() => setIsLoading(false))
  }, [])

  // Refresh once background sync finishes so the list reflects synced state
  // instead of lingering on the offline snapshot.
  useEffect(() => {
    if (wasSyncing.current && !isSyncing && isOnline) {
      loadTrips()
    }
    wasSyncing.current = isSyncing
  }, [isSyncing])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      const trip = await createTrip({
        name: form.name,
        destination: form.destination ? Number(form.destination) : null,
        start_date: form.start_date,
        end_date: form.end_date,
      })
      setTrips((prev) => [trip, ...prev])
      setForm({ name: '', destination: '', start_date: '', end_date: '' })
      setIsFormOpen(false)
    } catch {
      setError(t('trips.createError'))
    }
  }

  async function handleDelete(tripId: number) {
    if (!isOnline) return
    await deleteTrip(tripId)
    setTrips((prev) => prev.filter((trip) => trip.id !== tripId))
  }

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center py-24 text-neutral-500">{t('common.loading')}</div>
  }

  return (
    <main className="mx-auto max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{t('trips.title')}</h1>
          <p className="mt-1 text-neutral-500">{t('trips.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsFormOpen((open) => !open)}
          disabled={!isOnline}
          title={isOnline ? undefined : t('trips.creatingRequiresInternet')}
          className="flex items-center gap-2 rounded-pill bg-accent-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" />
          {t('trips.newTrip')}
        </button>
      </div>

      {isShowingOfflineData && (
        <div className="mb-6 flex items-center gap-2 rounded-card border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          <CloudOff className="size-4 shrink-0" />
          {t('trips.offlineShowingSaved')}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleCreate} className="mb-8 flex flex-col gap-4 rounded-card border border-neutral-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              {t('trips.tripName')}
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder={t('trips.tripNamePlaceholder')}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              {t('trips.destination')}
              <select
                value={form.destination}
                onChange={(event) => setForm((prev) => ({ ...prev, destination: event.target.value }))}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              >
                <option value="">{t('trips.none')}</option>
                {destinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {getLocalizedName(destination, i18n.language)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              {t('trips.startDate')}
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              {t('trips.endDate')}
              <input
                type="date"
                required
                value={form.end_date}
                onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="self-start rounded-pill bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            {t('trips.createTrip')}
          </button>
        </form>
      )}

      {trips.length === 0 ? (
        <div className="rounded-card border border-neutral-200 bg-white px-6 py-16 text-center text-neutral-500">
          {t('trips.noTrips')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="flex flex-col gap-2 rounded-card border border-neutral-200 bg-white p-5 shadow-card"
            >
              <div className="flex items-start justify-between">
                <Link to={`/trips/${trip.id}`} className="text-lg font-semibold text-neutral-900 hover:text-accent-600">
                  {trip.name}
                </Link>
                <button
                  onClick={() => handleDelete(trip.id)}
                  disabled={!isOnline}
                  aria-label={t('trips.deleteTrip')}
                  title={isOnline ? undefined : t('trips.deletingRequiresInternet')}
                  className="text-neutral-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {trip.destination_name && (
                <p className="flex items-center gap-1.5 text-sm text-neutral-500">
                  <MapPin className="size-3.5" />
                  {trip.destination_name}
                </p>
              )}
              <p className="flex items-center gap-1.5 text-sm text-neutral-500">
                <CalendarRange className="size-3.5" />
                {trip.start_date} – {trip.end_date}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-400">
                  {t('trips.itineraryItems', { count: trip.itinerary_items.length })}
                </p>
                {offlineTripIds.has(trip.id) && (
                  <span className="flex items-center gap-1 text-xs font-medium text-primary-600">
                    <CloudOff className="size-3.5" />
                    {t('trips.availableOffline')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default TripsPage
