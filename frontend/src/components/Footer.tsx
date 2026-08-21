import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Compass } from 'lucide-react'

function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-base font-semibold text-primary-800">
          <Compass className="size-5 text-accent-500" />
          Tourist Guide
        </Link>

        <div className="flex gap-6 text-sm text-neutral-500">
          <Link to="/budget-calculator" className="hover:text-neutral-800">
            {t('footer.budgetCalculator')}
          </Link>
          <Link to="/travel-tips" className="hover:text-neutral-800">
            {t('footer.travelTips')}
          </Link>
        </div>

        <p className="text-sm text-neutral-500">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  )
}

export default Footer
