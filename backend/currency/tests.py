from unittest.mock import Mock, patch

from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase


class ExchangeRatesViewTests(APITestCase):
    def setUp(self):
        cache.clear()

    def tearDown(self):
        cache.clear()

    def test_unconfigured_with_no_cache_returns_503(self):
        with self.settings(CURRENCY_API_KEY=''):
            response = self.client.get('/api/currency/rates/')
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(response.data['error'], 'not_configured')

    @patch('currency.services.requests.get')
    def test_live_rate_is_returned_and_cached(self, mock_get):
        mock_get.return_value = Mock(
            status_code=200,
            json=lambda: {
                'result': 'success',
                'base_code': 'USD',
                'conversion_rates': {'JPY': 149.5, 'EUR': 0.92},
                'time_last_update_utc': 'Mon, 01 Jan 2024 00:00:01 +0000',
            },
        )
        mock_get.return_value.raise_for_status = lambda: None

        with self.settings(CURRENCY_API_KEY='test-key'):
            response = self.client.get('/api/currency/rates/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['rates']['JPY'], 149.5)
        self.assertFalse(response.data['cached'])
        self.assertIsNotNone(response.data['updated_at'])

    @patch('currency.services.requests.get')
    def test_provider_failure_falls_back_to_cache(self, mock_get):
        mock_get.return_value = Mock(
            status_code=200,
            json=lambda: {
                'result': 'success', 'base_code': 'USD',
                'conversion_rates': {'JPY': 149.5}, 'time_last_update_utc': 'Mon, 01 Jan 2024 00:00:01 +0000',
            },
        )
        mock_get.return_value.raise_for_status = lambda: None
        with self.settings(CURRENCY_API_KEY='test-key'):
            self.client.get('/api/currency/rates/')  # warms the cache

            import requests
            mock_get.side_effect = requests.RequestException('network down')
            response = self.client.get('/api/currency/rates/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['cached'])
        self.assertEqual(response.data['rates']['JPY'], 149.5)

    @patch('currency.services.requests.get')
    def test_provider_failure_with_no_cache_returns_503(self, mock_get):
        import requests
        mock_get.side_effect = requests.RequestException('network down')
        with self.settings(CURRENCY_API_KEY='test-key'):
            response = self.client.get('/api/currency/rates/')
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(response.data['error'], 'unavailable')
