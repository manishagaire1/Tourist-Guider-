import { Sparkles } from 'lucide-react'

function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent-50 text-accent-500">
        <Sparkles className="size-6" />
      </span>
      <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
      <p className="max-w-md text-neutral-500">{description}</p>
    </main>
  )
}

export default ComingSoonPage
