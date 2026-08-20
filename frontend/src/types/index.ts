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

export interface Destination {
  id: number
  name: string
  country: string
  slug: string
  description: string
  image_url: string
  rating: string
  best_time_to_visit: string
  latitude: string | null
  longitude: string | null
  places_count: number
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
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
