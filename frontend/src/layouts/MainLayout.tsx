import { Outlet } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function MainLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default MainLayout
