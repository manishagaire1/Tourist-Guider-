import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'

function StarRatingInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={t('placeDetail.starLabel', { count: star })}
          className="p-0.5"
        >
          <Star className={`size-6 ${star <= value ? 'fill-accent-500 text-accent-500' : 'text-neutral-300'}`} />
        </button>
      ))}
    </div>
  )
}

export default StarRatingInput
