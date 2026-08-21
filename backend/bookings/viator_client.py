"""Thin wrapper around Viator's official Partner API.

Docs: https://docs.viator.com/partner-api/ (Partner API v2.0)

Real HTTP calls only — this module never invents availability, pricing, or
booking data. If VIATOR_API_KEY isn't configured, every call short-circuits
to a "not configured" result instead of hitting the network.

NOTE: the exact response field names below (`pricing.summary.fromPrice`,
etc.) follow Viator's documented Partner API v2.0 response shape as of
implementation time. Once real credentials are available, verify a live
sandbox response against these paths — Viator versions its API via the
`Accept` header, and a partner account's exact tier can affect which fields
are populated (e.g. affiliate accounts may not receive `bookingConfirmationSettings`).
"""

import requests
from django.conf import settings

REQUEST_TIMEOUT = 10


class ViatorError(Exception):
    """Raised for any Viator call failure, tagged with a stable error code."""

    def __init__(self, code, message):
        self.code = code
        self.message = message
        super().__init__(message)


def _headers():
    return {
        'exp-api-key': settings.VIATOR_API_KEY,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
    }


def is_configured():
    return bool(settings.VIATOR_API_KEY and settings.VIATOR_PARTNER_ID)


def _request(method, path, **kwargs):
    if not is_configured():
        raise ViatorError('not_configured', 'Viator API credentials are not configured.')

    url = f'{settings.VIATOR_BASE_URL.rstrip("/")}{path}'
    try:
        response = requests.request(method, url, headers=_headers(), timeout=REQUEST_TIMEOUT, **kwargs)
    except requests.Timeout:
        raise ViatorError('timeout', 'The Viator API took too long to respond.')
    except requests.RequestException:
        raise ViatorError('network_error', 'Could not reach the Viator API.')

    if response.status_code == 401 or response.status_code == 403:
        raise ViatorError('auth_error', 'Viator API authentication failed.')
    if response.status_code == 404:
        raise ViatorError('invalid_product', 'This product could not be found on Viator.')
    if response.status_code == 429:
        raise ViatorError('rate_limited', 'Viator API rate limit reached.')
    if response.status_code >= 500:
        raise ViatorError('service_unavailable', 'Viator is temporarily unavailable.')
    if not response.ok:
        raise ViatorError('service_unavailable', 'Viator returned an unexpected error.')

    try:
        return response.json()
    except ValueError:
        raise ViatorError('service_unavailable', 'Viator returned an unreadable response.')


def get_product(product_code):
    """GET /products/{product-code} — real product details only."""
    data = _request('GET', f'/products/{product_code}')
    pricing_summary = (data.get('pricing') or {}).get('summary') or {}
    reviews = data.get('reviews') or {}
    images = [
        (img.get('variants') or [{}])[-1].get('url')
        for img in (data.get('images') or [])
        if img.get('variants')
    ]
    return {
        'product_code': data.get('productCode', product_code),
        'title': data.get('title'),
        'description': data.get('description'),
        'duration': (data.get('duration') or {}).get('description'),
        'images': [url for url in images if url],
        'rating': reviews.get('combinedAverageRating'),
        'review_count': reviews.get('totalReviews'),
        'from_price': pricing_summary.get('fromPrice'),
        'currency': (data.get('pricing') or {}).get('currency'),
        'product_url': data.get('productUrl'),
        'meeting_point': ((data.get('logistics') or {}).get('start') or [{}])[0].get('description')
        if (data.get('logistics') or {}).get('start') else None,
        'cancellation_policy': (data.get('cancellationPolicy') or {}).get('description'),
        'supports_in_app_booking': bool(data.get('bookingConfirmationSettings')),
    }


def check_availability(product_code, date, travelers):
    """POST /availability/check — real-time availability/pricing for a date + traveler count."""
    payload = {
        'productCode': product_code,
        'travelDate': date,
        'paxMix': [{'ageBand': 'ADULT', 'numberOfTravelers': travelers}],
    }
    data = _request('POST', '/availability/check', json=payload)

    bookable_items = data.get('bookableItems') or []
    if not bookable_items:
        return {'status': 'unavailable', 'price': None, 'currency': None}

    item = bookable_items[0]
    seasons = item.get('seasons') or []
    price_records = [record for season in seasons for record in (season.get('pricingRecords') or [])]
    matching = [r for r in price_records if r.get('dateRange', {}).get('startDate') == date]

    if not matching:
        return {'status': 'unavailable', 'price': None, 'currency': None}

    record = matching[0]
    available = record.get('available', False)
    vacancies = record.get('vacancies')
    unit_price = (record.get('pricingDetail') or {}).get('price', {}).get('recommendedRetailPrice')

    if not available:
        status = 'sold_out' if vacancies == 0 else 'unavailable'
    elif isinstance(vacancies, int) and 0 < vacancies <= 5:
        status = 'limited'
    else:
        status = 'available'

    return {
        'status': status,
        'price': unit_price,
        'currency': data.get('currency'),
    }
