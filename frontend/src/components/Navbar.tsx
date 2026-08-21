import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Compass, Menu, User, X } from 'lucide-react'
import OnlineStatusPill from '@/components/OnlineStatusPill'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useAuth } from '@/hooks/useAuth'

function Navbar() {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/explore', label: t('nav.explore') },
    { to: '/destinations', label: t('nav.destinations') },
    { to: '/map', label: t('nav.map') },
    { to: '/trips', label: t('nav.myTrips') },
    { to: '/favorites', label: t('nav.favorites') },
    { to: '/travel-tips', label: t('nav.travelTips') },
  ]

  async function handleLogout() {
    await logout()
    setIsMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-primary-800">
          <Compass className="size-6 text-accent-500" strokeWidth={2.25} />
          Tourist Guide
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? 'text-accent-600' : 'text-neutral-600 hover:text-neutral-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <OnlineStatusPill />
          <LanguageSwitcher />
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                <User className="size-4" />
                {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-pill bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-pill px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="rounded-pill bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
              >
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>

        <button
          className="flex items-center justify-center rounded-lg p-2 text-neutral-700 lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={t('common.toggleMenu')}
        >
          {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-accent-50 text-accent-600' : 'text-neutral-700 hover:bg-neutral-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4">
            <OnlineStatusPill />
            <LanguageSwitcher />
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 pt-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  <User className="size-4" />
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-pill bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-pill bg-accent-500 px-4 py-2 text-center text-sm font-medium text-white"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
