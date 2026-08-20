import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import DestinationDetailPage from '@/pages/DestinationDetailPage'
import PlaceDetailPage from '@/pages/PlaceDetailPage'
import ExplorePage from '@/pages/ExplorePage'
import DestinationsPage from '@/pages/DestinationsPage'
import MapPage from '@/pages/MapPage'
import FavoritesPage from '@/pages/FavoritesPage'
import TripsPage from '@/pages/TripsPage'
import TripDetailPage from '@/pages/TripDetailPage'
import BudgetCalculatorPage from '@/pages/BudgetCalculatorPage'
import TravelTipsPage from '@/pages/TravelTipsPage'
import TravelTipDetailPage from '@/pages/TravelTipDetailPage'
import ProfileDashboardPage from '@/pages/ProfileDashboardPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
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
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
