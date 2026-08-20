function DestinationCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-white shadow-card">
      <div className="h-48 animate-pulse bg-neutral-200" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200" />
        <div className="mt-2 h-9 w-full animate-pulse rounded-pill bg-neutral-200" />
      </div>
    </div>
  )
}

export default DestinationCardSkeleton
