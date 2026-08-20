import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const DestinationDetailPage = lazy(() => import('@/pages/DestinationDetailPage'))
const PlaceDetailPage = lazy(() => import('@/pages/PlaceDetailPage'))
const ExplorePage = lazy(() => import('@/pages/ExplorePage'))
const DestinationsPage = lazy(() => import('@/pages/DestinationsPage'))
const MapPage = lazy(() => import('@/pages/MapPage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const TripsPage = lazy(() => import('@/pages/TripsPage'))
const TripDetailPage = lazy(() => import('@/pages/TripDetailPage'))
const BudgetCalculatorPage = lazy(() => import('@/pages/BudgetCalculatorPage'))
const TravelTipsPage = lazy(() => import('@/pages/TravelTipsPage'))
const TravelTipDetailPage = lazy(() => import('@/pages/TravelTipDetailPage'))
const ProfileDashboardPage = lazy(() => import('@/pages/ProfileDashboardPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))

function PageFallback() {
  return <div className="flex flex-1 items-center justify-center py-24 text-neutral-500">Loading…</div>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/destinations/:id" element={<DestinationDetailPage />} />
                <Route path="/places/:id" element={<PlaceDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/budget-calculator" element={<BudgetCalculatorPage />} />
                <Route path="/travel-tips" element={<TravelTipsPage />} />
                <Route path="/travel-tips/:slug" element={<TravelTipDetailPage />} />

                <Route
                  path="/trips"
                  element={
                    <ProtectedRoute>
                      <TripsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trips/:id"
                  element={
                    <ProtectedRoute>
                      <TripDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileDashboardPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
