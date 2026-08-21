import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, X } from 'lucide-react'

function PwaUpdatePrompt() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 rounded-card border border-primary-700 bg-primary-900 p-4 text-white shadow-card-hover sm:inset-x-auto sm:left-6 sm:w-80">
      <div className="flex items-center gap-3">
        <RefreshCw className="size-5 shrink-0" />
        <p className="text-sm">{t('pwa.updateAvailable')}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="rounded-pill bg-white px-3 py-1.5 text-xs font-medium text-primary-900 hover:bg-primary-50"
        >
          {t('pwa.reload')}
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          aria-label={t('common.dismiss')}
          className="p-1 text-white/70 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

export default PwaUpdatePrompt
