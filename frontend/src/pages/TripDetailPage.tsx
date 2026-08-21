import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowDown,
  ArrowUp,
  Calculator,
  CalendarRange,
  CloudDownload,
  CloudOff,
  Plus,
  Trash2,
} from 'lucide-react'
import { fetchPlaces } from '@/services/placesService'
import {
  enqueueMutation,
  getOfflineTrip,
  isTripSavedOffline,
  removeOfflineTrip,
  saveTripOffline,
} from '@/services/offlineDb'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import {
  addItineraryItem,
  deleteTrip,
  fetchTrip,
  removeItineraryItem,
  updateItineraryItem,
  updateTrip,
} from '@/services/tripsService'
import { getLocalizedName } from '@/utils/localization'
import type { ItineraryItem, Place, Trip } from '@/types'

function dateForDay(startDate: string, dayNumber: number, locale: string): string {
  const date = new Date(startDate + 'T00:00:00')
  date.setDate(date.getDate() + (dayNumber - 1))
  return date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })
}

function dayCount(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
}

function TripDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isOnline, isSyncing } = useOnlineStatus()
  const wasSyncing = useRef(isSyncing)

  const [trip, setTrip] = useState<Trip | null>(null)
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isShowingOfflineData, setIsShowingOfflineData] = useState(false)
  const [isSavedOffline, setIsSavedOffline] = useState(false)
  const [addForm, setAddForm] = useState<{ day: number; place: string; time: string } | null>(null)

  async function loadTrip(): Promise<Trip | undefined> {
    if (!id) return undefined
    const numericId = Number(id)

    // Check connectivity explicitly rather than waiting for the network call
    // to fail — the service worker's own API cache can transparently serve a
    // previously-fetched trip while offline, which would otherwise mask the
    // fact that we're showing a possibly-stale saved copy.
    if (!navigator.onLine) {
      const offline = await getOfflineTrip(numericId)
      if (offline) {
        setTrip(offline)
        setIsShowingOfflineData(true)
        return offline
      }
      setTrip(null)
      return undefined
    }

    try {
      const data = await fetchTrip(id)
      setTrip(data)
      setIsShowingOfflineData(false)
      if (await isTripSavedOffline(numericId)) {
        await saveTripOffline(data) // keep the offline copy fresh
      }
      return data
    } catch (error) {
      const offline = await getOfflineTrip(numericId)
      if (offline) {
        setTrip(offline)
        setIsShowingOfflineData(true)
        return offline
      }
      throw error
    }
  }

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    isTripSavedOffline(Number(id)).then(setIsSavedOffline)
    loadTrip()
      .then((data) => {
        if (data && isOnline) {
          return fetchPlaces(data.destination ? { destination: data.destination } : {}).then(setAvailablePlaces)
        }
      })
      .catch(() => setTrip(null))
      .finally(() => setIsLoading(false))
  }, [id])

  // Once background sync (queued offline mutations) finishes, refresh this
  // trip from the server so the page reflects the synced order/dates instead
  // of lingering on the "offline copy" view until the user navigates away.
  useEffect(() => {
    if (wasSyncing.current && !isSyncing && isOnline) {
      loadTrip()
    }
    wasSyncing.current = isSyncing
  }, [isSyncing])

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center py-24 text-neutral-500">{t('common.loading')}</div>
  }

  if (!trip) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center text-neutral-500">
        <p>{t('trips.tripNotAvailableOffline')}</p>
        <p className="text-sm">{t('trips.connectToView')}</p>
      </div>
    )
  }

  const tripId = trip.id
  const totalDays = dayCount(trip.start_date, trip.end_date)
  const itemsByDay = new Map<number, ItineraryItem[]>()
  for (const item of trip.itinerary_items) {
    const list = itemsByDay.get(item.day_number) ?? []
    list.push(item)
    itemsByDay.set(item.day_number, list)
  }
  for (const list of itemsByDay.values()) {
    list.sort((a, b) => a.order - b.order || (a.time ?? '').localeCompare(b.time ?? ''))
  }

  async function applyLocalUpdate(updated: Trip) {
    setTrip(updated)
    if (isSavedOffline) await saveTripOffline(updated)
  }

  async function handleToggleOffline() {
    if (isSavedOffline) {
      await removeOfflineTrip(tripId)
      setIsSavedOffline(false)
    } else {
      await saveTripOffline(trip!)
      setIsSavedOffline(true)
    }
  }

  async function handleRemoveItem(itemId: number) {
    if (!isOnline) {
      const updated: Trip = { ...trip!, itinerary_items: trip!.itinerary_items.filter((item) => item.id !== itemId) }
      await applyLocalUpdate(updated)
      await enqueueMutation({ tripId, type: 'removeItem', payload: { itemId } })
      return
    }
    await removeItineraryItem(itemId)
    await loadTrip()
  }

  async function handleMove(day: number, index: number, direction: -1 | 1) {
    const items = [...(itemsByDay.get(day) ?? [])]
    const target = items[index + direction]
    const current = items[index]
    if (!target || !current) return
    ;[items[index], items[index + direction]] = [items[index + direction], items[index]]

    if (!isOnline) {
      const reindexed = items.map((item, newOrder) => ({ ...item, order: newOrder }))
      const otherDays = trip!.itinerary_items.filter((item) => item.day_number !== day)
      const updated: Trip = { ...trip!, itinerary_items: [...otherDays, ...reindexed] }
      await applyLocalUpdate(updated)
      await enqueueMutation({
        tripId,
        type: 'reorderDay',
        payload: { orderedItemIds: reindexed.map((item) => item.id) },
      })
      return
    }

    // Reindex the whole day so order values stay unique and sequential —
    // items created without an explicit order all default to 0, so a plain
    // two-item swap can be a no-op when their order values already match.
    await Promise.all(items.map((item, newOrder) => updateItineraryItem(item.id, { order: newOrder })))
    await loadTrip()
  }

  async function handleAddPlace(day: number) {
    if (!addForm || !addForm.place || !isOnline) return
    const existingCount = (itemsByDay.get(day) ?? []).length
    await addItineraryItem({
      trip: tripId,
      place: Number(addForm.place),
      day_number: day,
      time: addForm.time || null,
      order: existingCount,
    })
    setAddForm(null)
    await loadTrip()
  }

  async function handleDeleteTrip() {
    if (!isOnline) return
    await deleteTrip(tripId)
    await removeOfflineTrip(tripId)
    navigate('/trips')
  }

  async function handleDateChange(field: 'start_date' | 'end_date', value: string) {
    if (!isOnline) {
      const updated: Trip = { ...trip!, [field]: value }
      await applyLocalUpdate(updated)
      await enqueueMutation({ tripId, type: 'updateDates', payload: { [field]: value } })
      return
    }
    const updated = await updateTrip(tripId, { [field]: value })
    setTrip(updated)
  }

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      {isShowingOfflineData && (
        <div className="mb-6 flex items-center gap-2 rounded-card border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          <CloudOff className="size-4 shrink-0" />
          {t('trips.offlineShowingSavedTrip')}
        </div>
      )}

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{trip.name}</h1>
          {trip.destination_name && <p className="mt-1 text-neutral-500">{trip.destination_name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleOffline}
            className={`flex items-center gap-1.5 rounded-pill border px-4 py-2 text-sm font-medium transition ${
              isSavedOffline
                ? 'border-primary-200 bg-primary-50 text-primary-700'
                : 'border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-700'
            }`}
          >
            <CloudDownload className="size-4" />
            {isSavedOffline ? t('trips.availableOfflineButton') : t('trips.saveForOffline')}
          </button>
          <Link
            to="/budget-calculator"
            className="flex items-center gap-1.5 rounded-pill border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-accent-500 hover:text-accent-600"
          >
            <Calculator className="size-4" />
            {t('trips.estimateBudget')}
          </Link>
          <button
            onClick={handleDeleteTrip}
            disabled={!isOnline}
            title={isOnline ? undefined : t('trips.deletingRequiresInternet')}
            className="flex items-center gap-1.5 rounded-pill border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="size-4" />
            {t('trips.deleteTrip')}
          </button>
        </div>
      </div>

      <div className="mb-10 flex flex-wrap items-center gap-3 rounded-card border border-neutral-200 bg-white p-4">
        <CalendarRange className="size-4 text-neutral-500" />
        <input
          type="date"
          value={trip.start_date}
          onChange={(event) => handleDateChange('start_date', event.target.value)}
          className="rounded-lg border border-neutral-200 px-2 py-1 text-sm"
        />
        <span className="text-neutral-400">{t('trips.to')}</span>
        <input
          type="date"
          value={trip.end_date}
          onChange={(event) => handleDateChange('end_date', event.target.value)}
          className="rounded-lg border border-neutral-200 px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col gap-10">
        {Array.from({ length: totalDays }, (_, index) => index + 1).map((day) => {
          const items = itemsByDay.get(day) ?? []
          return (
            <section key={day}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-800 text-sm font-semibold text-white">
                  {day}
                </span>
                <div>
                  <h2 className="font-semibold text-neutral-900">{t('trips.day', { number: day })}</h2>
                  <p className="text-xs text-neutral-400">{dateForDay(trip.start_date, day, i18n.language)}</p>
                </div>
              </div>

              <div className="ml-4 flex flex-col gap-3 border-l-2 border-neutral-200 pl-6">
                {items.length === 0 && <p className="text-sm text-neutral-400">{t('trips.noPlacesAddedYet')}</p>}
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-card border border-neutral-200 bg-white p-3 shadow-card"
                  >
                    <img
                      src={item.place_detail.image_url}
                      alt={getLocalizedName(item.place_detail, i18n.language)}
                      className="size-14 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      {item.time && <p className="text-xs font-medium text-accent-600">{item.time}</p>}
                      <p className="truncate font-medium text-neutral-900">
                        {getLocalizedName(item.place_detail, i18n.language)}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {getLocalizedName(item.place_detail.category, i18n.language)}
                      </p>
                      {item.place_detail.address && (
                        <p className="truncate text-xs text-neutral-400">{item.place_detail.address}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        onClick={() => handleMove(day, index, -1)}
                        disabled={index === 0}
                        className="rounded p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                        aria-label={t('trips.moveUp')}
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        onClick={() => handleMove(day, index, 1)}
                        disabled={index === items.length - 1}
                        className="rounded p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                        aria-label={t('trips.moveDown')}
                      >
                        <ArrowDown className="size-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="shrink-0 text-neutral-400 hover:text-red-600"
                      aria-label={t('trips.removeItem')}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}

                {!isOnline ? (
                  <p className="text-xs text-neutral-400">{t('trips.addingRequiresInternet')}</p>
                ) : addForm?.day === day ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-card border border-dashed border-neutral-300 p-3">
                    <select
                      value={addForm.place}
                      onChange={(event) => setAddForm({ ...addForm, place: event.target.value })}
                      className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
                    >
                      <option value="">{t('trips.selectPlace')}</option>
                      {availablePlaces.map((place) => (
                        <option key={place.id} value={place.id}>
                          {getLocalizedName(place, i18n.language)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={addForm.time}
                      onChange={(event) => setAddForm({ ...addForm, time: event.target.value })}
                      className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
                    />
                    <button
                      onClick={() => handleAddPlace(day)}
                      className="rounded-pill bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600"
                    >
                      {t('common.add')}
                    </button>
                    <button
                      onClick={() => setAddForm(null)}
                      className="text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      {t('trips.cancel')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddForm({ day, place: '', time: '' })}
                    className="flex w-fit items-center gap-1.5 rounded-pill border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-500 hover:border-accent-500 hover:text-accent-600"
                  >
                    <Plus className="size-4" />
                    {t('trips.addPlace')}
                  </button>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}

export default TripDetailPage
