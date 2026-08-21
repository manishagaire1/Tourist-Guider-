import type { Translations } from '@/types'

interface Named {
  name: string
  translations?: Translations
}

interface Described {
  description: string
  translations?: Translations
}

/** Returns the translated name for the active language, falling back to the
 * English base field when no translation exists — so a place never renders
 * blank just because a language is missing a specific entry. */
export function getLocalizedName(item: Named, language: string): string {
  return item.translations?.[language]?.name || item.name
}

export function getLocalizedDescription(item: Described, language: string): string {
  return item.translations?.[language]?.description || item.description
}
