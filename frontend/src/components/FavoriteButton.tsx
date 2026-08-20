import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites } from '@/hooks/useFavorites'

interface FavoriteButtonProps {
  type: 'destination' | 'place'
  id: number
  className?: string
}

function FavoriteButton({ type, id, className = '' }: FavoriteButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isDestinationFavorited, isPlaceFavorited, toggleDestinationFavorite, togglePlaceFavorite } =
    useFavorites()
  const [isBusy, setIsBusy] = useState(false)

  const isFavorited = type === 'destination' ? isDestinationFavorited(id) : isPlaceFavorited(id)

  async function handleClick(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      navigate('/login')
      return
    }

    setIsBusy(true)
    try {
      if (type === 'destination') {
        await toggleDestinationFavorite(id)
      } else {
        await togglePlaceFavorite(id)
      }
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
      aria-pressed={isFavorited}
      className={`flex items-center justify-center rounded-full bg-white/90 p-2 shadow-sm transition hover:bg-white disabled:opacity-60 ${className}`}
    >
      <Heart
        className={`size-4 transition ${isFavorited ? 'fill-accent-500 text-accent-500' : 'text-neutral-600'}`}
      />
    </button>
  )
}

export default FavoriteButton
