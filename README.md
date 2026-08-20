# Tourist Guide

A modern, full-stack travel platform for discovering destinations, planning trips, and exploring attractions, restaurants, and hotels — built as a portfolio project demonstrating full-stack development, REST API integration, authentication, database design, third-party API integration, responsive UI development, and deployment.

> **Status:** Feature-complete and deployment-ready. See the checklist below for what's built.

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
- [x] Travel tips (10 real editorial guides — safety, culture, etiquette, phrases, visas, and more)
- [x] Personalized recommendations (destinations tagged by interest, matched against saved travel preferences)
- [x] Profile dashboard (stats, upcoming trip, weather, recommendations, editable preferences and profile)
- [x] All Destinations directory with search
- [x] Full responsive design pass (verified on mobile/tablet/desktop, zero horizontal-overflow issues)
- [x] Testing (39 backend API tests; full frontend flows verified end-to-end in a real browser)
- [x] Deployment preparation (production security settings, WhiteNoise static files, gunicorn, Procfile, Vercel SPA rewrite)
- [x] Progressive Web App — installable, service worker with offline caching, update-available prompt
- [x] Offline trip itineraries (IndexedDB, "Save for Offline" per trip, offline reorder/remove/date-edit with a synced mutation queue, online/offline indicator)

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

### Running both at once

After completing both setups above, a root-level convenience script starts backend + frontend together with one command:

```bash
npm install       # once, at the project root — installs `concurrently`
npm run dev
```

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

## Testing

Backend: 39 automated tests (Django REST Framework `APITestCase`) covering auth (register/login/logout/token blacklisting), travel preferences, destination/place filtering, recommendation ranking, favorites (including duplicate/conflicting-target rejection), review ownership and duplicate prevention, and trip/itinerary ownership permissions.

```bash
cd backend
python manage.py test
```

Frontend flows (registration, login/logout, search, filters, map, place details, favorites, trip creation, itinerary editing, reviews, weather, mobile responsiveness, and API error states) were verified end-to-end in a real browser during development.

## Deployment

**Backend (Render / Railway):**

1. Set environment variables from `backend/.env.example` in the platform's dashboard — at minimum `SECRET_KEY`, `DEBUG=false`, `ALLOWED_HOSTS`, `DATABASE_URL` (a managed PostgreSQL instance), and `CORS_ALLOWED_ORIGINS` (your deployed frontend URL).
2. Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
3. Start command: `gunicorn config.wsgi --log-file -` (also defined in `backend/Procfile`, along with a `release: python manage.py migrate` step for platforms that support release phases).
4. Static files are served in production via WhiteNoise — no separate static host needed.

**Frontend (Vercel):**

1. Set `VITE_API_BASE_URL` to your deployed backend's `/api` URL, and `VITE_USE_MOCK_DATA=false` once real map/weather API keys are set.
2. Build command: `npm run build`, output directory: `dist`.
3. `frontend/vercel.json` rewrites all routes to `index.html` so client-side routing (React Router) works on direct navigation and refresh.

**Database:** PostgreSQL in production (SQLite is dev-only). Point `DATABASE_URL` at a managed Postgres instance (Render/Railway both offer one).

## Contributors

- [Manisha Gaire](https://github.com/manishagaire1)

## Roadmap / Future Improvements

- Real-time availability and booking integrations
- Server-side rendering / static generation for SEO on public pages
- Offline-friendly trip itineraries (PWA)
- Multi-language support

---

This project demonstrates full-stack development, REST API integration, authentication, database design, third-party API integration, responsive UI development, and deployment.
