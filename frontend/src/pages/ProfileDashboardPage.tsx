import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarRange, Compass, Globe2, Heart, MapPin, Sparkles, User as UserIcon } from 'lucide-react'
import DestinationCard from '@/components/DestinationCard'
import StatTile from '@/components/StatTile'
import WeatherCard from '@/components/WeatherCard'
import { INTERESTS } from '@/data/interests'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites } from '@/hooks/useFavorites'
import { fetchTravelPreferences, updateProfile, updateTravelPreferences } from '@/services/authService'
import { fetchDestinations } from '@/services/destinationsService'
import { fetchRecommendations } from '@/services/recommendationsService'
import { fetchTrips } from '@/services/tripsService'
import { getRecentSearches } from '@/utils/recentSearches'
import type { Destination, Trip } from '@/types'

function ProfileDashboardPage() {
  const { user } = useAuth()
  const { favorites } = useFavorites()

  const [trips, setTrips] = useState<Trip[]>([])
  const [allDestinations, setAllDestinations] = useState<Destination[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Destination[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', bio: '' })
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setProfileForm({ first_name: user.first_name, last_name: user.last_name, bio: user.bio })
    fetchTrips().then(setTrips)
    fetchDestinations().then(setAllDestinations)
    fetchTravelPreferences().then((preference) => setInterests(preference.interests))
    fetchRecommendations().then((response) => setRecommendations(response.results))
    setRecentSearches(getRecentSearches())
  }, [user])

  if (!user) return null

  const today = new Date().toISOString().slice(0, 10)
  const upcomingTrip = [...trips]
    .filter((trip) => trip.end_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))[0]

  const destinationById = new Map(allDestinations.map((destination) => [destination.id, destination]))
  const favoriteCountries = favorites
    .map((favorite) => favorite.destination_detail?.country)
    .filter((country): country is string => Boolean(country))
  const tripCountries = trips
    .map((trip) => (trip.destination ? destinationById.get(trip.destination)?.country : undefined))
    .filter((country): country is string => Boolean(country))
  const countriesVisited = new Set([...favoriteCountries, ...tripCountries]).size

  function toggleInterest(value: string) {
    setInterests((prev) => (prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]))
  }

  async function handleSaveProfile(event: FormEvent) {
    event.preventDefault()
    await updateProfile(profileForm)
    setIsEditingProfile(false)
    setSavedMessage('Profile updated.')
    setTimeout(() => setSavedMessage(null), 2500)
  }

  async function handleSavePreferences() {
    await updateTravelPreferences(interests)
    const response = await fetchRecommendations()
    setRecommendations(response.results)
    setSavedMessage('Preferences saved.')
    setTimeout(() => setSavedMessage(null), 2500)
  }

  const weatherDestination = upcomingTrip?.destination_name ?? favorites.find((f) => f.destination_detail)?.destination_detail?.name

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900">
        Welcome back, {user.first_name || user.username}!
      </h1>
      <p className="mb-8 text-neutral-500">Here's what's happening with your travels.</p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={Globe2} label="Countries Visited" value={countriesVisited} />
        <StatTile icon={Heart} label="Places Saved" value={favorites.length} />
        <StatTile icon={CalendarRange} label="Trips Planned" value={trips.length} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          {upcomingTrip ? (
            <section className="rounded-card border border-neutral-200 bg-white p-6 shadow-card">
              <p className="mb-1 text-sm font-medium text-accent-600">Upcoming Trip</p>
              <Link to={`/trips/${upcomingTrip.id}`} className="text-xl font-semibold text-neutral-900 hover:text-accent-600">
                {upcomingTrip.name}
              </Link>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                <MapPin className="size-4" />
                {upcomingTrip.destination_name ?? 'No destination set'}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                <CalendarRange className="size-4" />
                {upcomingTrip.start_date} – {upcomingTrip.end_date}
              </p>
            </section>
          ) : (
            <section className="rounded-card border border-dashed border-neutral-300 bg-white p-6 text-center text-neutral-500">
              No upcoming trips.{' '}
              <Link to="/trips" className="font-medium text-accent-600 hover:underline">
                Plan one
              </Link>
              .
            </section>
          )}

          {weatherDestination && <WeatherCard destinationName={weatherDestination} />}

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-5 text-accent-500" />
              <h2 className="text-lg font-semibold text-neutral-900">Recommended for You</h2>
            </div>
            {recommendations.length === 0 ? (
              <p className="text-sm text-neutral-500">Set your travel preferences to get personalized picks.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {recommendations.slice(0, 4).map((destination) => (
                  <DestinationCard key={destination.id} destination={destination} />
                ))}
              </div>
            )}
          </section>

          {recentSearches.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-neutral-900">Recent Searches</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <Link
                    key={term}
                    to={`/explore?q=${encodeURIComponent(term)}`}
                    className="rounded-pill border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 hover:border-accent-500 hover:text-accent-600"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-card border border-neutral-200 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700">
                  {user.username.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-neutral-900">{user.username}</p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile((editing) => !editing)}
                className="text-sm font-medium text-accent-600 hover:underline"
              >
                {isEditingProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={profileForm.first_name}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, first_name: event.target.value }))}
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={profileForm.last_name}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, last_name: event.target.value }))}
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Bio"
                  value={profileForm.bio}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, bio: event.target.value }))}
                  rows={3}
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-pill bg-accent-500 py-2 text-sm font-medium text-white hover:bg-accent-600"
                >
                  Save Profile
                </button>
              </form>
            ) : (
              <p className="flex items-start gap-1.5 text-sm text-neutral-600">
                <UserIcon className="mt-0.5 size-4 shrink-0" />
                {user.bio || 'No bio yet.'}
              </p>
            )}
          </section>

          <section className="rounded-card border border-neutral-200 bg-white p-6 shadow-card">
            <h2 className="mb-3 font-semibold text-neutral-900">Travel Preferences</h2>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.value}
                  onClick={() => toggleInterest(interest.value)}
                  className={`rounded-pill border px-3 py-1.5 text-sm transition ${
                    interests.includes(interest.value)
                      ? 'border-accent-500 bg-accent-50 text-accent-700'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {interest.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleSavePreferences}
              className="mt-4 w-full rounded-pill bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-700"
            >
              Save Preferences
            </button>
            {savedMessage && <p className="mt-2 text-center text-sm text-primary-700">{savedMessage}</p>}
          </section>

          <section className="rounded-card border border-neutral-200 bg-white p-6 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Favorite Places</h2>
              <Link to="/favorites" className="flex items-center gap-1 text-sm text-accent-600 hover:underline">
                View all
                <Compass className="size-3.5" />
              </Link>
            </div>
            {favorites.length === 0 ? (
              <p className="text-sm text-neutral-500">No favorites yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {favorites.slice(0, 4).map((favorite) => {
                  const item = favorite.destination_detail ?? favorite.place_detail
                  if (!item) return null
                  return (
                    <li key={favorite.id} className="flex items-center gap-3">
                      <img src={item.image_url} alt={item.name} className="size-10 rounded-lg object-cover" />
                      <span className="truncate text-sm font-medium text-neutral-800">{item.name}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default ProfileDashboardPage
