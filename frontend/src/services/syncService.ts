import {
  getAllOfflineTrips,
  getPendingMutations,
  removePendingMutation,
  saveTripOffline,
} from '@/services/offlineDb'
import { fetchTrip, removeItineraryItem, updateItineraryItem, updateTrip } from '@/services/tripsService'

/**
 * Replays queued offline trip edits against the real API in the order they
 * were made. Mutations that fail (e.g. the trip was deleted server-side)
 * are left in the queue rather than silently dropped or overwriting server
 * state — the caller surfaces the failure count to the user.
 */
export async function syncPendingMutations(): Promise<number> {
  const mutations = await getPendingMutations()
  const sorted = [...mutations].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  let failedCount = 0
  const affectedTripIds = new Set<number>()

  for (const mutation of sorted) {
    try {
      if (mutation.type === 'removeItem') {
        await removeItineraryItem(mutation.payload.itemId)
      } else if (mutation.type === 'updateDates') {
        await updateTrip(mutation.tripId, mutation.payload)
      } else if (mutation.type === 'reorderDay') {
        await Promise.all(
          mutation.payload.orderedItemIds.map((itemId, index) => updateItineraryItem(itemId, { order: index })),
        )
      }
      await removePendingMutation(mutation.id)
      affectedTripIds.add(mutation.tripId)
    } catch {
      failedCount += 1
    }
  }

  // Refresh the offline copy of every saved trip — both the ones we just
  // synced and any others saved for offline, in case they changed elsewhere.
  const offlineTrips = await getAllOfflineTrips()
  const idsToRefresh = new Set<number>([...affectedTripIds, ...offlineTrips.map((trip) => trip.id)])

  await Promise.all(
    Array.from(idsToRefresh).map(async (id) => {
      try {
        const fresh = await fetchTrip(id)
        await saveTripOffline(fresh)
      } catch {
        // Trip may have been deleted server-side while offline — leave the
        // cached copy as-is rather than guessing what happened.
      }
    }),
  )

  return failedCount
}
