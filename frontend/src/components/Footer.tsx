import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-base font-semibold text-primary-800">
          <Compass className="size-5 text-accent-500" />
          Tourist Guide
        </Link>
        <p className="text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} Tourist Guide. Built as a full-stack portfolio project.
        </p>
      </div>
    </footer>
  )
}

export default Footer
