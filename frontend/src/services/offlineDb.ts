import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Trip } from '@/types'

export type PendingMutation =
  | { id: string; tripId: number; type: 'removeItem'; payload: { itemId: number }; createdAt: string }
  | { id: string; tripId: number; type: 'reorderDay'; payload: { orderedItemIds: number[] }; createdAt: string }
  | { id: string; tripId: number; type: 'updateDates'; payload: { start_date?: string; end_date?: string }; createdAt: string }

interface OfflineDbSchema extends DBSchema {
  trips: {
    key: number
    value: Trip
  }
  pendingMutations: {
    key: string
    value: PendingMutation
    indexes: { 'by-tripId': number }
  }
}

const DB_NAME = 'tourist-guide-offline'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<OfflineDbSchema>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('trips')) {
          db.createObjectStore('trips', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('pendingMutations')) {
          const store = db.createObjectStore('pendingMutations', { keyPath: 'id' })
          store.createIndex('by-tripId', 'tripId')
        }
      },
    })
  }
  return dbPromise
}

export async function saveTripOffline(trip: Trip): Promise<void> {
  const db = await getDb()
  await db.put('trips', trip)
}

export async function getOfflineTrip(id: number): Promise<Trip | undefined> {
  const db = await getDb()
  return db.get('trips', id)
}

export async function getAllOfflineTrips(): Promise<Trip[]> {
  const db = await getDb()
  return db.getAll('trips')
}

export async function removeOfflineTrip(id: number): Promise<void> {
  const db = await getDb()
  await db.delete('trips', id)
}

export async function isTripSavedOffline(id: number): Promise<boolean> {
  const trip = await getOfflineTrip(id)
  return trip !== undefined
}

export async function enqueueMutation(mutation: Omit<PendingMutation, 'id' | 'createdAt'>): Promise<void> {
  const db = await getDb()

  // Only the latest date change matters — replace rather than replay stale intermediates.
  if (mutation.type === 'updateDates') {
    const existing = await db.getAllFromIndex('pendingMutations', 'by-tripId', mutation.tripId)
    const stale = existing.find((entry) => entry.type === 'updateDates')
    if (stale) await db.delete('pendingMutations', stale.id)
  }

  const id = `${mutation.tripId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  await db.put('pendingMutations', { ...mutation, id, createdAt: new Date().toISOString() } as PendingMutation)
}

export async function getPendingMutations(): Promise<PendingMutation[]> {
  const db = await getDb()
  return db.getAll('pendingMutations')
}

export async function getPendingMutationsForTrip(tripId: number): Promise<PendingMutation[]> {
  const db = await getDb()
  return db.getAllFromIndex('pendingMutations', 'by-tripId', tripId)
}

export async function removePendingMutation(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('pendingMutations', id)
}
