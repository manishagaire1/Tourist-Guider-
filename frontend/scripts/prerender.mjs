#!/usr/bin/env node
// Build-time SEO prerendering — run after `vite build`.
//
// For every public route, writes a real per-page <title>, meta description,
// canonical URL, Open Graph / Twitter tags, and JSON-LD structured data into
// a static dist/<route>/index.html, plus a static content snapshot in #root
// so crawlers see real text before any JS runs. The existing SPA bundle is
// untouched — real users still get the normal client-rendered app the
// instant it loads (createRoot re-renders over the snapshot).
//
// No framework migration: this is metadata + content prerendering on top of
// the existing Vite build, not a Next.js rewrite.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import {
  destinationDescription,
  destinationTitle,
  placeDescription,
  placeTitle,
  siteTitle,
  travelTipDescription,
  travelTipTitle,
} from '../src/utils/seo.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

function loadEnvFile(filename) {
  const filePath = path.join(ROOT, filename)
  if (!existsSync(filePath)) return {}
  const env = {}
  for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

const env = { ...loadEnvFile('.env'), ...loadEnvFile('.env.production.local'), ...process.env }
const API_BASE_URL = env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const SITE_URL = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')

async function fetchAllPages(url) {
  const results = []
  let next = url
  while (next) {
    const response = await fetch(next)
    if (!response.ok) {
      throw new Error(`Prerender: failed to fetch ${next} (${response.status}). Is the Django API running?`)
    }
    const data = await response.json()
    results.push(...data.results)
    next = data.next
  }
  return results
}

function escapeHtml(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeJsonLd(data) {
  return JSON.stringify(data).replaceAll('<', '\\u003c')
}

function buildHead({ title, description, canonical, image, ogType = 'website', jsonLd }) {
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="${escapeHtml(ogType)}" />`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ]
  if (image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(image)}" />`)
    tags.push(`<meta name="twitter:image" content="${escapeHtml(image)}" />`)
  }
  if (jsonLd) {
    for (const block of jsonLd) {
      tags.push(`<script type="application/ld+json">${escapeJsonLd(block)}</script>`)
    }
  }
  return tags.join('\n    ')
}

function breadcrumbList(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

function touristAttraction(entity) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: entity.name,
  }
  if (entity.description) data.description = entity.description
  if (entity.image_url) data.image = entity.image_url
  if (entity.address) data.address = { '@type': 'PostalAddress', streetAddress: entity.address }
  if (entity.latitude && entity.longitude) {
    data.geo = { '@type': 'GeoCoordinates', latitude: Number(entity.latitude), longitude: Number(entity.longitude) }
  }
  const rating = Number(entity.rating)
  if (rating > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      ...(entity.review_count ? { reviewCount: entity.review_count } : {}),
    }
  }
  return data
}

function renderPage(template, outPath, { head, snapshot }) {
  let html = template.replace(/<title>[\s\S]*?<\/title>/, '').replace(
    '</head>',
    `  ${head}\n  </head>`,
  )
  if (snapshot) {
    html = html.replace('<div id="root"></div>', `<div id="root">${snapshot}</div>`)
  }
  mkdirSync(path.dirname(outPath), { recursive: true })
  writeFileSync(outPath, html)
}

async function main() {
  if (!existsSync(DIST)) {
    throw new Error('Prerender: dist/ not found — run `vite build` first.')
  }
  const template = readFileSync(path.join(DIST, 'index.html'), 'utf-8')

  console.log(`Prerendering against API ${API_BASE_URL}, site URL ${SITE_URL}`)
  const [destinations, places] = await Promise.all([
    fetchAllPages(`${API_BASE_URL}/destinations/`),
    fetchAllPages(`${API_BASE_URL}/places/`),
  ])
  const { TRAVEL_TIPS } = await import(path.join(ROOT, 'src/data/travelTips.ts'))

  const sitemapUrls = []
  const addToSitemap = (loc, lastmod) => sitemapUrls.push({ loc, lastmod })

  // --- Home ---
  renderPage(template, path.join(DIST, 'index.html'), {
    head: buildHead({
      title: siteTitle(),
      description: 'Discover amazing destinations, hidden gems, local experiences, and everything you need for your next adventure.',
      canonical: SITE_URL + '/',
      jsonLd: [breadcrumbList([{ name: 'Home', url: SITE_URL + '/' }])],
    }),
  })
  addToSitemap(SITE_URL + '/')

  // --- Explore (generic — search results are inherently dynamic/private-state, no per-query prerendering) ---
  renderPage(template, path.join(DIST, 'explore', 'index.html'), {
    head: buildHead({
      title: siteTitle('Explore Places'),
      description: 'Search attractions, restaurants, hotels, and more across every destination on Tourist Guide.',
      canonical: SITE_URL + '/explore',
    }),
  })
  addToSitemap(SITE_URL + '/explore')

  // --- Destinations list ---
  const destinationsSnapshot = `<main><h1>All Destinations</h1><ul>${destinations
    .map((d) => `<li><a href="/destinations/${d.id}">${escapeHtml(d.name)}, ${escapeHtml(d.country)}</a></li>`)
    .join('')}</ul></main>`
  renderPage(template, path.join(DIST, 'destinations', 'index.html'), {
    head: buildHead({
      title: siteTitle('All Destinations'),
      description: 'Browse every destination on Tourist Guide — real places, real photos, real travel information.',
      canonical: SITE_URL + '/destinations',
      jsonLd: [breadcrumbList([{ name: 'Home', url: SITE_URL + '/' }, { name: 'Destinations', url: SITE_URL + '/destinations' }])],
    }),
    snapshot: destinationsSnapshot,
  })
  addToSitemap(SITE_URL + '/destinations')

  // --- Destination detail pages ---
  for (const destination of destinations) {
    const url = `${SITE_URL}/destinations/${destination.id}`
    const description = destinationDescription(destination.name, destination.country, destination.description)
    const snapshot = `<main><h1>${escapeHtml(destination.name)}</h1><p>${escapeHtml(destination.country)}</p>${
      destination.image_url ? `<img src="${escapeHtml(destination.image_url)}" alt="${escapeHtml(destination.name)}" />` : ''
    }<p>${escapeHtml(description)}</p></main>`
    renderPage(template, path.join(DIST, 'destinations', String(destination.id), 'index.html'), {
      head: buildHead({
        title: destinationTitle(destination.name, destination.country),
        description,
        canonical: url,
        image: destination.image_url || undefined,
        jsonLd: [
          touristAttraction(destination),
          breadcrumbList([
            { name: 'Home', url: SITE_URL + '/' },
            { name: 'Destinations', url: SITE_URL + '/destinations' },
            { name: destination.name, url },
          ]),
        ],
      }),
      snapshot,
    })
    addToSitemap(url, destination.created_at)
  }

  // --- Place detail pages ---
  for (const place of places) {
    const url = `${SITE_URL}/places/${place.id}`
    const description = placeDescription(place.name, place.destination_name, place.description)
    const snapshot = `<main><h1>${escapeHtml(place.name)}</h1>${
      place.destination_name ? `<p>${escapeHtml(place.destination_name)}</p>` : ''
    }${place.image_url ? `<img src="${escapeHtml(place.image_url)}" alt="${escapeHtml(place.name)}" />` : ''}<p>${escapeHtml(
      description,
    )}</p></main>`
    renderPage(template, path.join(DIST, 'places', String(place.id), 'index.html'), {
      head: buildHead({
        title: placeTitle(place.name, place.destination_name),
        description,
        canonical: url,
        image: place.image_url || undefined,
        jsonLd: [
          touristAttraction(place),
          breadcrumbList([
            { name: 'Home', url: SITE_URL + '/' },
            { name: 'Destinations', url: SITE_URL + '/destinations' },
            { name: place.name, url },
          ]),
        ],
      }),
      snapshot,
    })
    addToSitemap(url, place.created_at)
  }

  // --- Travel tips list ---
  const tipsSnapshot = `<main><h1>Travel Tips</h1><ul>${TRAVEL_TIPS.map(
    (tip) => `<li><a href="/travel-tips/${tip.slug}">${escapeHtml(tip.title)}</a></li>`,
  ).join('')}</ul></main>`
  renderPage(template, path.join(DIST, 'travel-tips', 'index.html'), {
    head: buildHead({
      title: siteTitle('Travel Tips'),
      description: 'Practical advice to travel safer, smarter, and more respectfully — real editorial guides on safety, culture, etiquette, and more.',
      canonical: SITE_URL + '/travel-tips',
      jsonLd: [breadcrumbList([{ name: 'Home', url: SITE_URL + '/' }, { name: 'Travel Tips', url: SITE_URL + '/travel-tips' }])],
    }),
    snapshot: tipsSnapshot,
  })
  addToSitemap(SITE_URL + '/travel-tips')

  // --- Travel tip detail pages ---
  for (const tip of TRAVEL_TIPS) {
    const url = `${SITE_URL}/travel-tips/${tip.slug}`
    const snapshot = `<main><h1>${escapeHtml(tip.title)}</h1><p>${escapeHtml(tip.summary)}</p>${tip.sections
      .map(
        (section) =>
          `<section><h2>${escapeHtml(section.heading)}</h2><ul>${section.items
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join('')}</ul></section>`,
      )
      .join('')}</main>`
    renderPage(template, path.join(DIST, 'travel-tips', tip.slug, 'index.html'), {
      head: buildHead({
        title: travelTipTitle(tip.title),
        description: travelTipDescription(tip.summary),
        canonical: url,
        ogType: 'article',
        jsonLd: [
          breadcrumbList([
            { name: 'Home', url: SITE_URL + '/' },
            { name: 'Travel Tips', url: SITE_URL + '/travel-tips' },
            { name: tip.title, url },
          ]),
        ],
      }),
      snapshot,
    })
    addToSitemap(url)
  }

  // --- sitemap.xml ---
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
    .map(
      ({ loc, lastmod }) =>
        `  <url>\n    <loc>${escapeHtml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}\n  </url>`,
    )
    .join('\n')}\n</urlset>\n`
  writeFileSync(path.join(DIST, 'sitemap.xml'), sitemapXml)

  // --- robots.txt ---
  const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /favorites\nDisallow: /trips\nDisallow: /profile\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
  writeFileSync(path.join(DIST, 'robots.txt'), robotsTxt)

  console.log(`Prerendered ${sitemapUrls.length} public pages + sitemap.xml + robots.txt`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
