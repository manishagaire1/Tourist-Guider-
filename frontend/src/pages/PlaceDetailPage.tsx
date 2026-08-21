import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock, ExternalLink, Globe, MapPin, Navigation, Phone, Share2, Star, Tag } from 'lucide-react'
import AddToTripButton from '@/components/AddToTripButton'
import FavoriteButton from '@/components/FavoriteButton'
import PlaceCard from '@/components/PlaceCard'
import StarRatingInput from '@/components/StarRatingInput'
import { useAuth } from '@/hooks/useAuth'
import { fetchPlace, fetchPlaces } from '@/services/placesService'
import { createReview, deleteReview, fetchReviews, updateReview } from '@/services/reviewsService'
import { getLocalizedDescription, getLocalizedName } from '@/utils/localization'
import type { Place, Review } from '@/types'

function PlaceDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [place, setPlace] = useState<Place | null>(null)
  const [nearby, setNearby] = useState<Place[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchPlace(id)
      .then(async (placeData) => {
        if (cancelled) return
        setPlace(placeData)
        const [placeReviews, siblingPlaces] = await Promise.all([
          fetchReviews(placeData.id),
          fetchPlaces({ destination: placeData.destination }),
        ])
        if (cancelled) return
        setReviews(placeReviews)
        setNearby(siblingPlaces.filter((p) => p.id !== placeData.id))
      })
      .catch(() => {
        if (!cancelled) setError(t('common.somethingWentWrong'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: place?.name, url })
      } catch {
        // user cancelled — no-op
      }
      return
    }
    await navigator.clipboard.writeText(url)
    setShareStatus(t('placeDetail.linkCopied'))
    setTimeout(() => setShareStatus(null), 2000)
  }

  const myReview = reviews.find((review) => review.user === user?.id)

  async function handleSubmitReview() {
    if (!place) return
    setIsSubmittingReview(true)
    try {
      if (myReview) {
        const updated = await updateReview(myReview.id, reviewRating, reviewComment)
        setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      } else {
        const created = await createReview(place.id, reviewRating, reviewComment)
        setReviews((prev) => [created, ...prev])
      }
      setReviewComment('')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  async function handleDeleteReview() {
    if (!myReview) return
    await deleteReview(myReview.id)
    setReviews((prev) => prev.filter((r) => r.id !== myReview.id))
  }

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center py-24 text-neutral-500">{t('common.loading')}</div>
  }

  if (error || !place) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-center text-red-600">
        {error ?? t('common.somethingWentWrong')}
      </div>
    )
  }

  const name = getLocalizedName(place, i18n.language)
  const categoryName = getLocalizedName(place.category, i18n.language)
  const rating = place.average_rating ?? Number(place.rating)
  const directionsUrl = place.latitude && place.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`

  return (
    <main className="flex-1">
      <div className="relative h-72 overflow-hidden sm:h-96">
        <img src={place.image_url} alt={name} className="size-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950/80 via-neutral-950/10 to-transparent" />
        <FavoriteButton type="place" id={place.id} className="absolute right-4 top-4" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
          <p className="mb-1 flex items-center gap-1 text-sm text-primary-100">
            <Tag className="size-3.5" />
            {categoryName}
          </p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">{name}</h1>
          <p className="mt-1 flex items-center gap-1 text-primary-100">
            <MapPin className="size-4" />
            {place.address || place.destination_name}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 pb-6">
          <span className="flex items-center gap-1.5 font-medium text-neutral-900">
            <Star className="size-4 fill-accent-500 text-accent-500" />
            {rating ? rating.toFixed(1) : t('placeDetail.new')} (
            {t('placeDetail.reviewCount', { count: place.review_count })})
          </span>
          {place.price_range && <span className="text-neutral-600">{place.price_range}</span>}
          {place.opening_hours && (
            <span className="flex items-center gap-1.5 text-neutral-600">
              <Clock className="size-4" />
              {place.opening_hours}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 py-6">
          <AddToTripButton placeId={place.id} />
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-pill border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800 transition hover:border-accent-500 hover:text-accent-600"
          >
            <Navigation className="size-4" />
            {t('placeDetail.getDirections')}
          </a>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-pill border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800 transition hover:border-accent-500 hover:text-accent-600"
          >
            <Share2 className="size-4" />
            {shareStatus ?? t('placeDetail.share')}
          </button>
        </div>

        {place.description && (
          <p className="max-w-3xl pb-6 text-neutral-700">{getLocalizedDescription(place, i18n.language)}</p>
        )}

        <div className="grid grid-cols-1 gap-3 border-t border-neutral-200 py-6 sm:grid-cols-2">
          {place.phone && (
            <p className="flex items-center gap-2 text-sm text-neutral-600">
              <Phone className="size-4" />
              {place.phone}
            </p>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-accent-600 hover:underline"
            >
              <Globe className="size-4" />
              {t('placeDetail.visitWebsite')}
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>

        <section className="border-t border-neutral-200 py-8">
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">{t('placeDetail.reviews')}</h2>

          {user && (
            <div className="mb-6 rounded-card border border-neutral-200 p-4">
              <p className="mb-2 text-sm font-medium text-neutral-700">
                {myReview ? t('placeDetail.updateReview') : t('placeDetail.writeReview')}
              </p>
              <StarRatingInput value={reviewRating} onChange={setReviewRating} />
              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder={t('placeDetail.reviewPlaceholder')}
                rows={3}
                className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="rounded-pill bg-accent-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
                >
                  {myReview ? t('placeDetail.updateReviewButton') : t('placeDetail.submitReview')}
                </button>
                {myReview && (
                  <button
                    onClick={handleDeleteReview}
                    className="rounded-pill border border-neutral-200 px-5 py-2 text-sm font-medium text-neutral-700 hover:border-red-300 hover:text-red-600"
                  >
                    {t('placeDetail.deleteReview')}
                  </button>
                )}
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-neutral-500">{t('placeDetail.noReviews')}</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-card border border-neutral-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-neutral-900">{review.user_display}</p>
                    <span className="flex items-center gap-1 text-sm text-neutral-600">
                      <Star className="size-3.5 fill-accent-500 text-accent-500" />
                      {review.rating}
                    </span>
                  </div>
                  {review.comment && <p className="mt-2 text-sm text-neutral-600">{review.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {nearby.length > 0 && (
          <section className="border-t border-neutral-200 py-8">
            <h2 className="mb-4 text-xl font-semibold text-neutral-900">
              <Link to={`/destinations/${place.destination}`} className="text-accent-600 hover:underline">
                {t('placeDetail.nearbyIn', { name: place.destination_name })}
              </Link>
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map((nearbyPlace) => (
                <PlaceCard key={nearbyPlace.id} place={nearbyPlace} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default PlaceDetailPage
