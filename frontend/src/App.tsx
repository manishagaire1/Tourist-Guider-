import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import DestinationDetailPage from '@/pages/DestinationDetailPage'
import ExplorePage from '@/pages/ExplorePage'
import MapPage from '@/pages/MapPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ComingSoonPage from '@/pages/ComingSoonPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/destinations/:id" element={<DestinationDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/explore" element={<ExplorePage />} />
            <Route
              path="/destinations"
              element={
                <ComingSoonPage
                  title="All Destinations"
                  description="A full, filterable destinations directory is coming soon."
                />
              }
            />
            <Route path="/map" element={<MapPage />} />
            <Route
              path="/travel-tips"
              element={
                <ComingSoonPage
                  title="Travel Tips"
                  description="Safety, culture, packing, and etiquette guides are coming soon."
                />
              }
            />

            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <ComingSoonPage
                    title="My Trips"
                    description="Plan day-by-day itineraries for your trips — coming soon."
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <ComingSoonPage
                    title="Favorites"
                    description="Your saved destinations and places will show up here — coming soon."
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ComingSoonPage
                    title="Profile"
                    description="Manage your profile and travel preferences — coming soon."
                  />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
