import { useOnlineStatus } from '@/hooks/useOnlineStatus'

function OnlineStatusPill({ className = '' }: { className?: string }) {
  const { isOnline, isSyncing } = useOnlineStatus()

  return (
    <span
      className={`flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium ${
        isOnline ? 'text-primary-700' : 'bg-neutral-100 text-neutral-500'
      } ${className}`}
    >
      <span className={`size-2 rounded-full ${isOnline ? 'bg-primary-500' : 'bg-neutral-400'}`} />
      {isSyncing ? 'Syncing…' : isOnline ? 'Online' : 'Offline'}
    </span>
  )
}

export default OnlineStatusPill
