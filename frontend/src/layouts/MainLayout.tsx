import { Outlet } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import OfflineBanner from '@/components/OfflineBanner'
import InstallPrompt from '@/components/InstallPrompt'
import PwaUpdatePrompt from '@/components/PwaUpdatePrompt'

function MainLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <OfflineBanner />
      <Outlet />
      <Footer />
      <InstallPrompt />
      <PwaUpdatePrompt />
    </div>
  )
}

export default MainLayout
