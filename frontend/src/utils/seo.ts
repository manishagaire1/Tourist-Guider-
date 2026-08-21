// Shared title/description builders. Used both client-side (useDocumentTitle,
// so the tab title stays correct across client-side navigation) and by
// scripts/prerender.mjs at build time (Node can import this .ts file
// directly) — one source of truth so the prerendered <title>/<meta> and the
// live client title never drift apart.

const SITE_NAME = 'Tourist Guide'

export function truncate(text: string, maxLength = 155): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength - 1).trimEnd() + '…'
}

export function siteTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} — ${SITE_NAME}` : `${SITE_NAME} — Explore the World`
}

export function destinationTitle(name: string, country: string): string {
  return siteTitle(`${name}, ${country}`)
}

export function destinationDescription(name: string, country: string, description?: string): string {
  if (description) return truncate(description)
  return `Explore ${name}, ${country} — discover top attractions, places to eat, and things to do with Tourist Guide.`
}

export function placeTitle(name: string, destinationName?: string): string {
  return siteTitle(destinationName ? `${name}, ${destinationName}` : name)
}

export function placeDescription(name: string, destinationName?: string, description?: string): string {
  if (description) return truncate(description)
  return `Discover ${name}${destinationName ? ` in ${destinationName}` : ''} — travel information, nearby attractions, and visitor tips.`
}

export function travelTipTitle(title: string): string {
  return siteTitle(title)
}

export function travelTipDescription(summary: string): string {
  return truncate(summary)
}
