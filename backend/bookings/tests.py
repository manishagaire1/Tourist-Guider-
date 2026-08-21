from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APITestCase

from destinations.models import Destination
from places.models import Category, Place

from .models import ViatorProductMapping
from .viator_client import ViatorError


class PlaceToursTests(APITestCase):
    def setUp(self):
        destination = Destination.objects.create(name='Tokyo', country='Japan')
        category = Category.objects.create(name='Temples')
        self.place_with_mapping = Place.objects.create(
            destination=destination, category=category, name='Senso-ji Temple',
        )
        self.place_without_mapping = Place.objects.create(
            destination=destination, category=category, name='Some Museum',
        )
        ViatorProductMapping.objects.create(place=self.place_with_mapping, product_code='5010TOKYO')

    def test_place_with_no_mappings_returns_empty_products(self):
        response = self.client.get(f'/api/places/{self.place_without_mapping.id}/tours/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['products'], [])

    def test_unconfigured_viator_returns_not_configured(self):
        with self.settings(VIATOR_API_KEY='', VIATOR_PARTNER_ID=''):
            response = self.client.get(f'/api/places/{self.place_with_mapping.id}/tours/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['configured'])
        self.assertEqual(response.data['products'], [])

    def test_unknown_place_returns_404(self):
        response = self.client.get('/api/places/999999/tours/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch('bookings.views.viator_client.get_product')
    def test_configured_viator_returns_real_product(self, mock_get_product):
        mock_get_product.return_value = {'product_code': '5010TOKYO', 'title': 'Tokyo Walking Tour'}
        with self.settings(VIATOR_API_KEY='test-key', VIATOR_PARTNER_ID='test-partner'):
            response = self.client.get(f'/api/places/{self.place_with_mapping.id}/tours/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['configured'])
        self.assertEqual(response.data['products'], [{'product_code': '5010TOKYO', 'title': 'Tokyo Walking Tour'}])

    @patch('bookings.views.viator_client.get_product')
    def test_a_failing_mapping_is_skipped_not_fatal(self, mock_get_product):
        mock_get_product.side_effect = ViatorError('invalid_product', 'not found')
        with self.settings(VIATOR_API_KEY='test-key', VIATOR_PARTNER_ID='test-partner'):
            response = self.client.get(f'/api/places/{self.place_with_mapping.id}/tours/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['products'], [])


class ProductAvailabilityTests(APITestCase):
    def setUp(self):
        destination = Destination.objects.create(name='Tokyo', country='Japan')
        category = Category.objects.create(name='Temples')
        self.place = Place.objects.create(destination=destination, category=category, name='Senso-ji Temple')
        ViatorProductMapping.objects.create(place=self.place, product_code='5010TOKYO')

    def _url(self, product_code='5010TOKYO'):
        return f'/api/places/{self.place.id}/tours/{product_code}/availability/'

    def test_unmapped_product_code_returns_invalid_product(self):
        response = self.client.post(self._url('does-not-exist'), {'date': '2026-09-01', 'travelers': 2})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'invalid_product')

    def test_invalid_traveler_count_is_rejected(self):
        response = self.client.post(self._url(), {'date': '2026-09-01', 'travelers': 0})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unconfigured_viator_returns_503(self):
        with self.settings(VIATOR_API_KEY='', VIATOR_PARTNER_ID=''):
            response = self.client.post(self._url(), {'date': '2026-09-01', 'travelers': 2})
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(response.data['error'], 'not_configured')

    @patch('bookings.views.viator_client.check_availability')
    def test_configured_viator_returns_real_availability(self, mock_check):
        mock_check.return_value = {'status': 'available', 'price': 8000, 'currency': 'JPY'}
        with self.settings(VIATOR_API_KEY='test-key', VIATOR_PARTNER_ID='test-partner'):
            response = self.client.post(self._url(), {'date': '2026-09-01', 'travelers': 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'available')

    @patch('bookings.views.viator_client.check_availability')
    def test_viator_rate_limit_maps_to_429(self, mock_check):
        mock_check.side_effect = ViatorError('rate_limited', 'too many requests')
        with self.settings(VIATOR_API_KEY='test-key', VIATOR_PARTNER_ID='test-partner'):
            response = self.client.post(self._url(), {'date': '2026-09-01', 'travelers': 2})
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
