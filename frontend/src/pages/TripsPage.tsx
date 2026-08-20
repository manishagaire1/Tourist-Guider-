import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarRange, MapPin, Plus, Trash2 } from 'lucide-react'
import { fetchDestinations } from '@/services/destinationsService'
import { createTrip, deleteTrip, fetchTrips } from '@/services/tripsService'
import type { Destination, Trip } from '@/types'

function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState({ name: '', destination: '', start_date: '', end_date: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchTrips(), fetchDestinations()])
      .then(([tripsData, destinationsData]) => {
        setTrips(tripsData)
        setDestinations(destinationsData)
      })
      .finally(() => setIsLoading(false))
  }, [])

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
      setError('Please check your trip details and try again.')
    }
  }

  async function handleDelete(tripId: number) {
    await deleteTrip(tripId)
    setTrips((prev) => prev.filter((trip) => trip.id !== tripId))
  }

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center py-24 text-neutral-500">Loading…</div>
  }

  return (
    <main className="mx-auto max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">My Trips</h1>
          <p className="mt-1 text-neutral-500">Plan your itineraries, day by day.</p>
        </div>
        <button
          onClick={() => setIsFormOpen((open) => !open)}
          className="flex items-center gap-2 rounded-pill bg-accent-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600"
        >
          <Plus className="size-4" />
          New Trip
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleCreate} className="mb-8 flex flex-col gap-4 rounded-card border border-neutral-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              Trip name
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Tokyo Trip"
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              Destination
              <select
                value={form.destination}
                onChange={(event) => setForm((prev) => ({ ...prev, destination: event.target.value }))}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {destinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              Start date
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              End date
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
            Create Trip
          </button>
        </form>
      )}

      {trips.length === 0 ? (
        <div className="rounded-card border border-neutral-200 bg-white px-6 py-16 text-center text-neutral-500">
          You haven't planned any trips yet.
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
                  aria-label="Delete trip"
                  className="text-neutral-400 hover:text-red-600"
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
              <p className="text-xs text-neutral-400">{trip.itinerary_items.length} itinerary items</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default TripsPage
