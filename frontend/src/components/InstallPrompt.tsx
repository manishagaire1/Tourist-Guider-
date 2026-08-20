import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  if (!deferredPrompt || isDismissed) return null

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 rounded-card border border-neutral-200 bg-white p-4 shadow-card-hover sm:inset-x-auto sm:right-6 sm:w-80">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Download className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-neutral-900">Install Tourist Guide</p>
          <p className="text-xs text-neutral-500">Add to your home screen for quick access.</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={handleInstall}
          className="rounded-pill bg-accent-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-600"
        >
          Install
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss"
          className="p-1.5 text-neutral-400 hover:text-neutral-600"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

export default InstallPrompt
