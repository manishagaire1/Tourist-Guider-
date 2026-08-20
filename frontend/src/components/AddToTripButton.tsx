import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarPlus, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { addItineraryItem, fetchTrips } from '@/services/tripsService'
import type { Trip } from '@/types'

function AddToTripButton({ placeId }: { placeId: number }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null)
  const [dayNumber, setDayNumber] = useState(1)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  async function open() {
    if (!user) {
      navigate('/login')
      return
    }
    setIsOpen(true)
    setStatus('idle')
    setIsLoading(true)
    try {
      const data = await fetchTrips()
      setTrips(data)
      setSelectedTripId(data[0]?.id ?? null)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAdd() {
    if (!selectedTripId) return
    setStatus('saving')
    await addItineraryItem({ trip: selectedTripId, place: placeId, day_number: dayNumber })
    setStatus('saved')
  }

  return (
    <div className="relative">
      <button
        onClick={open}
        className="flex items-center gap-2 rounded-pill border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800 transition hover:border-accent-500 hover:text-accent-600"
      >
        <CalendarPlus className="size-4" />
        Add to My Trip
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-card border border-neutral-200 bg-white p-4 shadow-card-hover">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">Add to trip</h3>
            <button onClick={() => setIsOpen(false)} aria-label="Close">
              <X className="size-4 text-neutral-400" />
            </button>
          </div>

          {isLoading && <p className="text-sm text-neutral-500">Loading your trips…</p>}

          {!isLoading && trips.length === 0 && (
            <p className="text-sm text-neutral-500">
              You don't have any trips yet.{' '}
              <Link to="/trips" className="font-medium text-accent-600 hover:underline">
                Create one
              </Link>
              .
            </p>
          )}

          {!isLoading && trips.length > 0 && status !== 'saved' && (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
                Trip
                <select
                  value={selectedTripId ?? ''}
                  onChange={(event) => setSelectedTripId(Number(event.target.value))}
                  className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
                >
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
                Day
                <input
                  type="number"
                  min={1}
                  value={dayNumber}
                  onChange={(event) => setDayNumber(Number(event.target.value))}
                  className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
                />
              </label>
              <button
                onClick={handleAdd}
                disabled={status === 'saving'}
                className="rounded-pill bg-accent-500 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
              >
                {status === 'saving' ? 'Adding…' : 'Add to Itinerary'}
              </button>
            </div>
          )}

          {status === 'saved' && <p className="text-sm text-primary-700">Added to your trip.</p>}
        </div>
      )}
    </div>
  )
}

export default AddToTripButton
