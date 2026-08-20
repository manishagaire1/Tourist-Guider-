function PlaceCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-white shadow-card">
      <div className="h-40 animate-pulse bg-neutral-200" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
        <div className="h-3 w-full animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  )
}

export default PlaceCardSkeleton
