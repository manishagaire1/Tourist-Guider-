import { useEffect } from 'react'

/** Keeps document.title correct across client-side navigation, matching
 * whatever scripts/prerender.mjs generated for that route's first paint. */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (title) document.title = title
  }, [title])
}
