import { createContext, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { syncPendingMutations } from '@/services/syncService'

interface OnlineStatusContextValue {
  isOnline: boolean
  isSyncing: boolean
  syncError: string | null
  dismissSyncError: () => void
}

export const OnlineStatusContext = createContext<OnlineStatusContextValue | undefined>(undefined)

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    async function handleOnline() {
      setIsOnline(true)
      setIsSyncing(true)
      setSyncError(null)
      try {
        const failedCount = await syncPendingMutations()
        if (failedCount > 0) {
          setSyncError(t('pwa.syncError', { count: failedCount }))
        }
      } catch {
        setSyncError(t('common.somethingWentWrong'))
      } finally {
        setIsSyncing(false)
      }
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <OnlineStatusContext.Provider
      value={{ isOnline, isSyncing, syncError, dismissSyncError: () => setSyncError(null) }}
    >
      {children}
    </OnlineStatusContext.Provider>
  )
}
