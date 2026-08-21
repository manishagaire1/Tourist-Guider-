import { useTranslation } from 'react-i18next'
import { AlertTriangle, WifiOff, X } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

function OfflineBanner() {
  const { t } = useTranslation()
  const { isOnline, syncError, dismissSyncError } = useOnlineStatus()

  if (isOnline && !syncError) return null

  if (syncError) {
    return (
      <div className="flex items-center justify-between gap-3 bg-accent-50 px-4 py-2 text-sm text-accent-800 sm:px-6 lg:px-8">
        <span className="flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          {syncError}
        </span>
        <button onClick={dismissSyncError} aria-label={t('common.dismiss')} className="shrink-0 text-accent-800/70 hover:text-accent-800">
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2 bg-neutral-800 px-4 py-2 text-center text-sm text-white">
      <WifiOff className="size-4 shrink-0" />
      {t('pwa.offlineBanner')}
    </div>
  )
}

export default OfflineBanner
