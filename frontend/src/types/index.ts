export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  bio: string
  avatar: string | null
  date_joined: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginResponse extends AuthTokens {
  user: User
}

export interface LocalizedFields {
  name?: string
  description?: string
}

export type Translations = Record<string, LocalizedFields>

export interface Destination {
  id: number
  name: string
  country: string
  slug: string
  description: string
  image_url: string
  image_source: string
  image_source_url: string
  image_credit: string
  rating: string
  best_time_to_visit: string
  latitude: string | null
  longitude: string | null
  places_count: number
  translations: Translations
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
  translations: Translations
}

export interface Place {
  id: number
  destination: number
  destination_name: string
  category: Category
  name: string
  description: string
  address: string
  latitude: string | null
  longitude: string | null
  rating: string
  price_range: '$' | '$$' | '$$$' | '$$$$' | ''
  opening_hours: string
  phone: string
  website: string
  image_url: string
  image_source: string
  image_source_url: string
  image_credit: string
  translations: Translations
  average_rating: number | null
  review_count: number
  created_at: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Favorite {
  id: number
  destination: number | null
  place: number | null
  destination_detail: Destination | null
  place_detail: Place | null
  created_at: string
}

export interface Review {
  id: number
  place: number
  user: number
  user_display: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

export interface ItineraryItem {
  id: number
  trip: number
  place: number
  place_detail: Place
  day_number: number
  time: string | null
  order: number
  notes: string
}

export interface TravelPreference {
  interests: string[]
  updated_at: string
}

export interface Trip {
  id: number
  name: string
  destination: number | null
  destination_name: string | null
  start_date: string
  end_date: string
  notes: string
  itinerary_items: ItineraryItem[]
  created_at: string
}
