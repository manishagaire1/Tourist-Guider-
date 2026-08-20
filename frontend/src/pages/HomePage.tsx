function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span className="rounded-pill bg-primary-100 px-4 py-1 text-sm font-medium text-primary-700">
        Tourist Guide — project scaffold
      </span>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
        Explore the World. Create Unforgettable Journeys.
      </h1>
      <p className="max-w-xl text-neutral-600">
        Discover amazing destinations, hidden gems, local experiences, and everything you need for your next adventure.
      </p>
      <div className="mt-4 flex gap-3">
        <button className="rounded-pill bg-accent-500 px-6 py-3 font-medium text-white shadow-card transition hover:bg-accent-600">
          Explore Now
        </button>
        <button className="rounded-pill border border-neutral-200 bg-white px-6 py-3 font-medium text-neutral-800 shadow-card transition hover:shadow-card-hover">
          View Map
        </button>
      </div>
    </main>
  )
}

export default HomePage
