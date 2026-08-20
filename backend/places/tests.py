from rest_framework import status
from rest_framework.test import APITestCase

from destinations.models import Destination

from .models import Category, Place


class PlaceListTests(APITestCase):
    def setUp(self):
        self.destination = Destination.objects.create(name='Tokyo', country='Japan', rating=4.8)
        self.temples = Category.objects.create(name='Temples')
        self.museums = Category.objects.create(name='Museums')
        self.temple_place = Place.objects.create(
            destination=self.destination, category=self.temples, name='Senso-ji Temple', rating=4.7,
        )
        self.museum_place = Place.objects.create(
            destination=self.destination, category=self.museums, name='Some Museum', rating=4.2,
        )

    def test_list_is_public(self):
        response = self.client.get('/api/places/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_filter_by_category(self):
        response = self.client.get('/api/places/', {'category': self.temples.id})
        names = [p['name'] for p in response.data['results']]
        self.assertEqual(names, ['Senso-ji Temple'])

    def test_filter_by_min_rating(self):
        response = self.client.get('/api/places/', {'min_rating': 4.5})
        names = [p['name'] for p in response.data['results']]
        self.assertEqual(names, ['Senso-ji Temple'])

    def test_average_rating_is_null_without_reviews(self):
        response = self.client.get('/api/places/')
        for place in response.data['results']:
            self.assertIsNone(place['average_rating'])
            self.assertEqual(place['review_count'], 0)
