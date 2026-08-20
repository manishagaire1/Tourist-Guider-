import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Calculator, CalendarRange, Plus, Trash2 } from 'lucide-react'
import { fetchPlaces } from '@/services/placesService'
import {
  addItineraryItem,
  deleteTrip,
  fetchTrip,
  removeItineraryItem,
  updateItineraryItem,
  updateTrip,
} from '@/services/tripsService'
import type { ItineraryItem, Place, Trip } from '@/types'

function dateForDay(startDate: string, dayNumber: number): string {
  const date = new Date(startDate + 'T00:00:00')
  date.setDate(date.getDate() + (dayNumber - 1))
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function dayCount(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
}

function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addForm, setAddForm] = useState<{ day: number; place: string; time: string } | null>(null)

  async function loadTrip() {
    if (!id) return
    const data = await fetchTrip(id)
    setTrip(data)
    return data
  }

  useEffect(() => {
    setIsLoading(true)
    loadTrip()
      .then((data) => {
        if (data) {
          return fetchPlaces(data.destination ? { destination: data.destination } : {}).then(setAvailablePlaces)
        }
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading || !trip) {
    return <div className="flex flex-1 items-center justify-center py-24 text-neutral-500">Loading…</div>
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

  async function handleRemoveItem(itemId: number) {
    await removeItineraryItem(itemId)
    await loadTrip()
  }

  async function handleMove(day: number, index: number, direction: -1 | 1) {
    const items = [...(itemsByDay.get(day) ?? [])]
    const target = items[index + direction]
    const current = items[index]
    if (!target || !current) return
    ;[items[index], items[index + direction]] = [items[index + direction], items[index]]

    // Reindex the whole day so order values stay unique and sequential —
    // items created without an explicit order all default to 0, so a plain
    // two-item swap can be a no-op when their order values already match.
    await Promise.all(items.map((item, newOrder) => updateItineraryItem(item.id, { order: newOrder })))
    await loadTrip()
  }

  async function handleAddPlace(day: number) {
    if (!addForm || !addForm.place) return
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
    await deleteTrip(tripId)
    navigate('/trips')
  }

  async function handleDateChange(field: 'start_date' | 'end_date', value: string) {
    const updated = await updateTrip(tripId, { [field]: value })
    setTrip(updated)
  }

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{trip.name}</h1>
          {trip.destination_name && <p className="mt-1 text-neutral-500">{trip.destination_name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/budget-calculator"
            className="flex items-center gap-1.5 rounded-pill border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-accent-500 hover:text-accent-600"
          >
            <Calculator className="size-4" />
            Estimate Budget
          </Link>
          <button
            onClick={handleDeleteTrip}
            className="flex items-center gap-1.5 rounded-pill border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-red-300 hover:text-red-600"
          >
            <Trash2 className="size-4" />
            Delete Trip
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
        <span className="text-neutral-400">to</span>
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
                  <h2 className="font-semibold text-neutral-900">Day {day}</h2>
                  <p className="text-xs text-neutral-400">{dateForDay(trip.start_date, day)}</p>
                </div>
              </div>

              <div className="ml-4 flex flex-col gap-3 border-l-2 border-neutral-200 pl-6">
                {items.length === 0 && <p className="text-sm text-neutral-400">No places added yet.</p>}
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-card border border-neutral-200 bg-white p-3 shadow-card"
                  >
                    <img
                      src={item.place_detail.image_url}
                      alt={item.place_detail.name}
                      className="size-14 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      {item.time && <p className="text-xs font-medium text-accent-600">{item.time}</p>}
                      <p className="truncate font-medium text-neutral-900">{item.place_detail.name}</p>
                      <p className="truncate text-xs text-neutral-500">{item.place_detail.category.name}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        onClick={() => handleMove(day, index, -1)}
                        disabled={index === 0}
                        className="rounded p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        onClick={() => handleMove(day, index, 1)}
                        disabled={index === items.length - 1}
                        className="rounded p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="shrink-0 text-neutral-400 hover:text-red-600"
                      aria-label="Remove"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}

                {addForm?.day === day ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-card border border-dashed border-neutral-300 p-3">
                    <select
                      value={addForm.place}
                      onChange={(event) => setAddForm({ ...addForm, place: event.target.value })}
                      className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
                    >
                      <option value="">Select a place…</option>
                      {availablePlaces.map((place) => (
                        <option key={place.id} value={place.id}>
                          {place.name}
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
                      Add
                    </button>
                    <button
                      onClick={() => setAddForm(null)}
                      className="text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddForm({ day, place: '', time: '' })}
                    className="flex w-fit items-center gap-1.5 rounded-pill border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-500 hover:border-accent-500 hover:text-accent-600"
                  >
                    <Plus className="size-4" />
                    Add a place
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
