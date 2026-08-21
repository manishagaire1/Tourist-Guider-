"""Live exchange-rate lookup via exchangerate-api.com (v6), server-side only.

Docs: https://www.exchangerate-api.com/docs/standard-requests
Response shape: {"result": "success", "base_code": "USD",
                  "conversion_rates": {...}, "time_last_update_utc": "..."}

Never fabricates a rate: if the provider call fails, the last cached
response is served (flagged as cached, with its real original timestamp).
If there is no cache at all, callers get a clear "unavailable" signal.
"""

from email.utils import parsedate_to_datetime

import requests
from django.conf import settings
from django.core.cache import cache

REQUEST_TIMEOUT = 8
CACHE_TTL_SECONDS = 60 * 60  # 1 hour — safe margin under the provider's own update cadence


class CurrencyError(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message
        super().__init__(message)


def _cache_key(base):
    return f'exchange_rates:{base}'


def get_exchange_rates(base='USD'):
    """Returns {base, rates, updated_at (ISO string), cached: bool}."""
    cache_key = _cache_key(base)

    if not settings.CURRENCY_API_KEY:
        cached = cache.get(cache_key)
        if cached:
            return {**cached, 'cached': True}
        raise CurrencyError('not_configured', 'Live exchange rates are not configured.')

    url = f'{settings.CURRENCY_API_BASE_URL.rstrip("/")}/{settings.CURRENCY_API_KEY}/latest/{base}'
    try:
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        if data.get('result') != 'success':
            raise CurrencyError('provider_error', 'The exchange rate provider returned an error.')

        result = {
            'base': data.get('base_code', base),
            'rates': data.get('conversion_rates', {}),
            'updated_at': _to_iso(data.get('time_last_update_utc')),
        }
        cache.set(cache_key, result, CACHE_TTL_SECONDS)
        return {**result, 'cached': False}

    except (requests.RequestException, ValueError, CurrencyError):
        cached = cache.get(cache_key)
        if cached:
            return {**cached, 'cached': True}
        raise CurrencyError('unavailable', 'Live exchange rates are temporarily unavailable.')


def _to_iso(provider_timestamp):
    """exchangerate-api.com returns RFC 2822-style timestamps, e.g.
    'Mon, 01 Jan 2024 00:00:01 +0000' — not ISO 8601."""
    if not provider_timestamp:
        return None
    try:
        return parsedate_to_datetime(provider_timestamp).isoformat()
    except (TypeError, ValueError):
        return None
