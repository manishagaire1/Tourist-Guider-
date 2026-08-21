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
- [x] Multi-language support (English, Japanese, Nepali, Hindi — i18next-driven UI, translated destination/place/category content stored per-language on the existing records, locale-aware date/currency formatting, language switcher in the navbar)
- [x] Real-time tour availability & booking via the Viator Partner API (backend proxy, curated product-mapping table, live availability check, deep-link booking — fully wired, inert until real credentials are supplied; see Configuration below)
- [x] SEO prerendering for public pages (build-time metadata/Open Graph/Twitter/JSON-LD generation + real content snapshots, dynamic sitemap.xml/robots.txt — no framework migration)
- [x] Live currency conversion in the Budget Calculator (USD/JPY/EUR/GBP/AUD/CAD/NPR/INR via a backend-cached exchange-rate proxy, `Intl.NumberFormat` locale-aware formatting, graceful "rates unavailable" fallback — never a fabricated rate)

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
| `VIATOR_API_KEY` | Viator Partner API key. Leave blank to run with booking disabled ("Booking not available" everywhere — never fake availability) |
| `VIATOR_PARTNER_ID` | Viator partner ID |
| `VIATOR_BASE_URL` | Defaults to Viator's sandbox base URL |
| `CURRENCY_API_KEY` | exchangerate-api.com (v6) key. Leave blank to run with currency conversion disabled (the calculator reports rates unavailable rather than faking one) |
| `CURRENCY_API_BASE_URL` | Defaults to `https://v6.exchangerate-api.com/v6` |

**`frontend/.env`**

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_USE_MOCK_DATA` | `true` to use mock data, `false` for live API calls |
| `VITE_MAPBOX_TOKEN` / `VITE_GOOGLE_MAPS_KEY` | Map provider key |
| `VITE_OPENWEATHER_KEY` | OpenWeather key |
| `VITE_SITE_URL` | Public site origin (no trailing slash) — used for canonical URLs, `og:url`, and `sitemap.xml`. Set to the real deployed domain before building for production |

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
| `places/<id>/tours/` | Read-only, public — real Viator products mapped to this place (empty list if none, or if Viator isn't configured) |
| `places/<id>/tours/<product_code>/availability/` — `POST {date, travelers}` | Read-only, public — real-time availability proxy to Viator |
| `currency/rates/?base=USD` | Read-only, public — live exchange rates, backend-cached |

## Database Setup

Development uses SQLite by default — no setup required beyond `python manage.py migrate`. For production, set `DATABASE_URL` to a PostgreSQL connection string, e.g.:

```
DATABASE_URL=postgres://user:password@host:5432/tourist_guide
```

## Testing

Backend: 56 automated tests (Django REST Framework `APITestCase`) covering auth (register/login/logout/token blacklisting), travel preferences (including `preferred_currency`), destination/place filtering, recommendation ranking, favorites (including duplicate/conflicting-target rejection), review ownership and duplicate prevention, trip/itinerary ownership permissions, the Viator tours/availability proxy (empty-mapping, not-configured, and error-mapping cases, mocked at the HTTP boundary), and the currency-rates endpoint (live fetch, cache fallback on provider failure, and the no-cache-available error case).

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

1. Set `VITE_API_BASE_URL` to your deployed backend's `/api` URL, `VITE_SITE_URL` to your real production domain, and `VITE_USE_MOCK_DATA=false` once real map/weather API keys are set.
2. Build command: `npm run build` (runs `tsc -b && vite build && node scripts/prerender.mjs` — the prerender step calls the live backend at `VITE_API_BASE_URL`, so the backend must already be deployed and reachable at build time), output directory: `dist`. A `build:no-prerender` script is available as a fallback if the backend isn't reachable during a given build.
3. `frontend/vercel.json` rewrites the known prerendered public routes (`/destinations/:id`, `/places/:id`, `/travel-tips/:slug`, and the list pages) to their static `index.html` files, with a catch-all falling back to the SPA shell for everything else — so both real per-page SEO metadata and normal client-side routing work correctly.

**Database:** PostgreSQL in production (SQLite is dev-only). Point `DATABASE_URL` at a managed Postgres instance (Render/Railway both offer one).

## Contributors

- [Manisha Gaire](https://github.com/manishagaire1)

## Roadmap / Future Improvements

- Real currency conversion rates (needs a `CURRENCY_API_KEY` from exchangerate-api.com)
- Real Viator bookings (needs `VIATOR_API_KEY`/`VIATOR_PARTNER_ID`, plus real product codes added per place via Django admin)
- URL-based language routing (`/en/`, `/ja/`, …) and per-language SEO variants — the current prerendering is English-only
- Full HTML-content SSR (not just metadata + a static snapshot) if deeper crawler indexing is ever needed beyond what's here

---

This project demonstrates full-stack development, REST API integration, authentication, database design, third-party API integration, responsive UI development, and deployment.
