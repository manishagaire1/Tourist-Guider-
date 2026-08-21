export interface CurrencyOption {
  code: string
  labelKey: string
}

// Add more here to extend supported currencies — nothing else needs to change.
export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', labelKey: 'currency.usd' },
  { code: 'JPY', labelKey: 'currency.jpy' },
  { code: 'EUR', labelKey: 'currency.eur' },
  { code: 'GBP', labelKey: 'currency.gbp' },
  { code: 'AUD', labelKey: 'currency.aud' },
  { code: 'CAD', labelKey: 'currency.cad' },
  { code: 'NPR', labelKey: 'currency.npr' },
  { code: 'INR', labelKey: 'currency.inr' },
]

const REGION_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  JP: 'JPY',
  GB: 'GBP',
  AU: 'AUD',
  CA: 'CAD',
  NP: 'NPR',
  IN: 'INR',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  AT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
}

/**
 * rates is USD-based (rates[X] = how many units of X per 1 USD), matching
 * the backend's exchangerate-api.com response shape — so any from/to pair
 * resolves in a single computed step rather than a literal USD round trip.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
): number | null {
  if (fromCurrency === toCurrency) return amount
  const fromRate = fromCurrency === 'USD' ? 1 : rates[fromCurrency]
  const toRate = toCurrency === 'USD' ? 1 : rates[toCurrency]
  if (!fromRate || !toRate) return null
  return (amount / fromRate) * toRate
}

export function formatCurrency(amount: number, currencyCode: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(amount)
}

export function detectDefaultCurrency(locale: string): string {
  try {
    const region = new Intl.Locale(locale).maximize().region
    return (region && REGION_TO_CURRENCY[region]) || 'USD'
  } catch {
    return 'USD'
  }
}
