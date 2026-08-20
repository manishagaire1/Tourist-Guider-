import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, Star } from 'lucide-react'
import { fetchPlaces } from '@/services/placesService'
import { createMarkerIcon, createUserLocationIcon } from '@/utils/mapIcons'
import { haversineDistanceKm } from '@/utils/distance'
import type { Place } from '@/types'

const DEFAULT_CENTER: [number, number] = [20, 20]
const DEFAULT_ZOOM = 2
const PLACE_MARKER_COLOR = '#fd5f0c'

function FlyToLocation({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo(position, 11)
    }
  }, [position, map])
  return null
}

function MapPage() {
  const navigate = useNavigate()
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlaces({ ordering: '-rating' })
      .then(setPlaces)
      .finally(() => setIsLoading(false))
  }, [])

  const mappablePlaces = useMemo(
    () => places.filter((place) => place.latitude && place.longitude),
    [places],
  )

  const nearbyPlaces = useMemo(() => {
    if (!userLocation) return []
    return mappablePlaces
      .map((place) => ({
        place,
        distanceKm: haversineDistanceKm(
          { lat: userLocation[0], lng: userLocation[1] },
          { lat: Number(place.latitude), lng: Number(place.longitude) },
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 8)
  }, [userLocation, mappablePlaces])

  function handleFindNearMe() {
    setLocationError(null)
    if (!navigator.geolocation) {
      setLocationError('Please allow location access to discover places near you.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
      },
      () => {
        setLocationError('Please allow location access to discover places near you.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-col gap-3 border-b border-neutral-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Interactive Map</h1>
          <p className="text-sm text-neutral-500">
            {isLoading ? 'Loading places…' : `${mappablePlaces.length} places plotted`}
          </p>
        </div>
        <button
          onClick={handleFindNearMe}
          className="flex items-center justify-center gap-2 rounded-pill bg-accent-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600"
        >
          <LocateFixed className="size-4" />
          Places Near Me
        </button>
      </div>

      {locationError && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-700 sm:px-6 lg:px-8">
          {locationError}
        </div>
      )}

      <div className="relative flex flex-1 flex-col lg:flex-row">
        <div className="h-[60vh] flex-1 lg:h-auto">
          <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="size-full" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyToLocation position={userLocation} />

            {mappablePlaces.map((place) => (
              <Marker
                key={place.id}
                position={[Number(place.latitude), Number(place.longitude)]}
                icon={createMarkerIcon(PLACE_MARKER_COLOR)}
              >
                <Popup>
                  <div className="flex w-48 flex-col gap-2">
                    <img src={place.image_url} alt={place.name} className="h-24 w-full rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-neutral-900">{place.name}</p>
                      <p className="flex items-center gap-1 text-xs text-neutral-500">
                        <Star className="size-3.5 fill-accent-500 text-accent-500" />
                        {(place.average_rating ?? Number(place.rating)).toFixed(1)} · {place.category.name}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/destinations/${place.destination}`)}
                      className="rounded-pill bg-neutral-900 py-1.5 text-xs font-medium text-white"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {userLocation && (
              <Marker position={userLocation} icon={createUserLocationIcon()}>
                <Popup>You are here</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {userLocation && (
          <aside className="w-full border-t border-neutral-200 bg-white p-4 lg:w-80 lg:overflow-y-auto lg:border-t-0 lg:border-l">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Nearby places</h2>
            {nearbyPlaces.length === 0 ? (
              <p className="text-sm text-neutral-500">No nearby places found.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {nearbyPlaces.map(({ place, distanceKm }) => (
                  <li key={place.id} className="flex items-center gap-3">
                    <img src={place.image_url} alt={place.name} className="size-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">{place.name}</p>
                      <p className="text-xs text-neutral-500">{distanceKm.toFixed(0)} km away</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}
      </div>
    </main>
  )
}

export default MapPage
