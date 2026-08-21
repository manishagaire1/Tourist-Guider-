import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

function OnlineStatusPill({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const { isOnline, isSyncing } = useOnlineStatus()

  return (
    <span
      className={`flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium ${
        isOnline ? 'text-primary-700' : 'bg-neutral-100 text-neutral-500'
      } ${className}`}
    >
      <span className={`size-2 rounded-full ${isOnline ? 'bg-primary-500' : 'bg-neutral-400'}`} />
      {isSyncing ? t('common.syncing') : isOnline ? t('common.online') : t('common.offline')}
    </span>
  )
}

export default OnlineStatusPill
