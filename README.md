# Tourist Guide

A modern, full-stack travel platform for discovering destinations, planning trips, and exploring attractions, restaurants, and hotels — built as a portfolio project demonstrating full-stack development, REST API integration, authentication, database design, third-party API integration, responsive UI development, and deployment.

> **Status:** In active development. This README grows alongside the build — see the Roadmap section for what's done and what's next.

## Overview

Tourist Guide helps travelers discover destinations, search attractions, view places on an interactive map, plan itineraries, track a travel budget, save favorites, read reviews, and get personalized recommendations based on their interests.

## Features

- [x] Project scaffolding (frontend + backend)
- [x] Database models (users, destinations, places, categories, favorites, trips, itinerary items, reviews, travel preferences)
- [x] REST API (destinations, places, favorites, trips, itinerary items, reviews)
- [x] JWT authentication (register, login, logout with token blacklisting, protected routes, profile, travel preferences)
- [x] Frontend layout (responsive navbar with mobile menu, footer, auth context, protected routes)
- [x] Homepage with hero search and live destinations grid
- [x] Destination detail page (real data, places within a destination)
- [x] Explore & search with filters (category, destination, price, rating)
- [x] Interactive map (Leaflet + OpenStreetMap) with marker popups and "Places Near Me" geolocation
- [x] Place details page (gallery image, reviews, favorite, add to trip, directions, share)
- [x] Favorites (destinations and places, add/remove, synced across the app)
- [x] Trip planner with day-by-day itinerary (add/remove/reorder places, edit dates)
- [x] Reviews & ratings (write/edit/delete own review, one per user per place)
- [x] Weather integration (mock-data-first service layer, real forecast UI, activity recommendations)
- [x] Travel budget calculator (live breakdown by category, per-traveler/per-day estimates)
- [ ] Travel tips
- [ ] Personalized recommendations
- [ ] Profile dashboard
- [ ] Full responsive design pass
- [ ] Testing
- [ ] Deployment preparation

## Technology Stack

**Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, Axios, Lucide React
**Backend:** Python, Django, Django REST Framework, Simple JWT
**Database:** SQLite (development), PostgreSQL (production-ready via `DATABASE_URL`)
**APIs:** Leaflet + OpenStreetMap (free, keyless — used for the interactive map), OpenWeather, REST Countries (weather integrated behind a mock-data-first service layer — see below)

## Architecture

```
Tourist-Guider/
├── frontend/                # React + Vite + TypeScript SPA
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route-level pages
│       ├── layouts/         # Shared layout shells (navbar, footer, etc.)
│       ├── hooks/           # Custom React hooks
│       ├── services/        # API clients — mock-data-first, real APIs behind one flag
│       ├── context/         # React context providers (auth, etc.)
│       └── utils/           # Shared helpers
└── backend/                 # Django + Django REST Framework API
    ├── config/               # Project settings, root URL config
    ├── users/                 # Custom User model, travel preferences
    ├── destinations/          # Destination model
    ├── places/                # Category + Place models
    ├── trips/                 # Trip + ItineraryItem models
    ├── reviews/                # Review model
    └── favorites/              # Favorite model
```

### API service layer (frontend)

Frontend services default to realistic mock JSON data (`VITE_USE_MOCK_DATA=true`) so the full UI can be built and demoed before real API keys are wired in. Flipping `VITE_USE_MOCK_DATA=false` and filling in the map/weather API keys switches services to live calls with no component changes required.

## Installation

### Prerequisites

- Node.js 20+
- Python 3.11+
- (Production) PostgreSQL 14+

### Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # fill in SECRET_KEY, etc.
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_destinations   # optional: populate demo destinations/places
python manage.py runserver
```

Backend runs at `http://localhost:8000`. Admin at `http://localhost:8000/admin/`.

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment Variables

**`backend/.env`**

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `true`/`false` |
| `ALLOWED_HOSTS` | Comma-separated hosts |
| `DATABASE_URL` | Leave unset for SQLite; set for PostgreSQL |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins |
| `OPENWEATHER_API_KEY` | OpenWeather API key (server-side) |
| `MAPS_API_KEY` | Maps provider API key (server-side) |

**`frontend/.env`**

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_USE_MOCK_DATA` | `true` to use mock data, `false` for live API calls |
| `VITE_MAPBOX_TOKEN` / `VITE_GOOGLE_MAPS_KEY` | Map provider key |
| `VITE_OPENWEATHER_KEY` | OpenWeather key |

## API Endpoints

**Auth** (`/api/auth/`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `register/` | Create an account |
| POST | `login/` | Obtain JWT access + refresh tokens |
| POST | `login/refresh/` | Refresh an access token |
| POST | `logout/` | Blacklist a refresh token |
| GET/PATCH | `profile/` | View or update the current user |
| GET/PATCH | `profile/preferences/` | View or update travel interests |

**Resources** (`/api/`) — standard DRF router endpoints (list/retrieve, plus create/update/delete where noted)

| Endpoint | Access |
|---|---|
| `destinations/` | Read-only, public |
| `categories/` | Read-only, public |
| `places/` — filter by `destination`, `category`, `price_range`, `min_rating`; search via `?search=`; order via `?ordering=` | Read-only, public |
| `favorites/` | Authenticated, scoped to the current user |
| `trips/` | Authenticated, scoped to the current user |
| `itinerary-items/` | Authenticated, scoped to trips the current user owns |
| `reviews/` — filter by `?place=<id>`; one review per user per place | Read public, write authenticated (owner-only edit/delete) |

## Database Setup

Development uses SQLite by default — no setup required beyond `python manage.py migrate`. For production, set `DATABASE_URL` to a PostgreSQL connection string, e.g.:

```
DATABASE_URL=postgres://user:password@host:5432/tourist_guide
```

## Roadmap / Future Improvements

- Real-time availability and booking integrations
- Server-side rendering / static generation for SEO on public pages
- Offline-friendly trip itineraries (PWA)
- Multi-language support

---

This project demonstrates full-stack development, REST API integration, authentication, database design, third-party API integration, responsive UI development, and deployment.
