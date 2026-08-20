import { useContext } from 'react'
import { OnlineStatusContext } from '@/context/OnlineStatusContext'

export function useOnlineStatus() {
  const context = useContext(OnlineStatusContext)
  if (!context) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider')
  }
  return context
}
