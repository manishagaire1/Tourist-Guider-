import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/i18n'

function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const current = SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.language) ?? SUPPORTED_LANGUAGES[0]

  function selectLanguage(code: string) {
    i18n.changeLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('common.changeLanguage')}
        className="flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
      >
        <Globe className="size-4" />
        {current.label}
      </button>

      {isOpen && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <ul
            role="listbox"
            aria-label={t('common.selectLanguage')}
            className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-card border border-neutral-200 bg-white py-1 shadow-card-hover"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  role="option"
                  aria-selected={lang.code === current.code}
                  onClick={() => selectLanguage(lang.code)}
                  className={`block w-full px-4 py-2 text-left text-sm ${
                    lang.code === current.code
                      ? 'bg-accent-50 text-accent-600'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {lang.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher
