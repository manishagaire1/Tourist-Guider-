import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getTravelTip } from '@/data/travelTips'

function TravelTipDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const tip = slug ? getTravelTip(slug) : undefined

  if (!tip) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-center text-neutral-500">
        Tip not found.
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/travel-tips" className="mb-6 flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800">
        <ArrowLeft className="size-4" />
        All Travel Tips
      </Link>

      <span className="text-xs font-medium uppercase tracking-wide text-accent-600">{tip.category}</span>
      <h1 className="mt-1 text-3xl font-semibold text-neutral-900">{tip.title}</h1>
      <p className="mt-3 text-lg text-neutral-600">{tip.summary}</p>

      <div className="mt-8 flex flex-col gap-8">
        {tip.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-lg font-semibold text-neutral-900">{section.heading}</h2>
            <ul className="flex flex-col gap-2">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-neutral-700">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}

export default TravelTipDetailPage
