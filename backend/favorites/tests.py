from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from destinations.models import Destination
from places.models import Category, Place

from .models import Favorite

User = get_user_model()


class FavoriteTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='traveler', email='t@example.com', password='S0meStrongPass!')
        self.other_user = User.objects.create_user(username='other', email='o@example.com', password='S0meStrongPass!')
        self.destination = Destination.objects.create(name='Tokyo', country='Japan', rating=4.8)
        category = Category.objects.create(name='Temples')
        self.place = Place.objects.create(destination=self.destination, category=category, name='Senso-ji', rating=4.7)

    def test_requires_auth(self):
        response = self.client.post('/api/favorites/', {'destination': self.destination.id})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_destination_favorite(self):
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/favorites/', {'destination': self.destination.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Favorite.objects.count(), 1)

    def test_cannot_favorite_both_destination_and_place(self):
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/favorites/', {
            'destination': self.destination.id, 'place': self.place.id,
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_duplicate_favorite(self):
        self.client.force_authenticate(self.user)
        Favorite.objects.create(user=self.user, destination=self.destination)
        response = self.client.post('/api/favorites/', {'destination': self.destination.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_favorites_scoped_to_requesting_user(self):
        Favorite.objects.create(user=self.other_user, destination=self.destination)
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/favorites/')
        self.assertEqual(response.data['count'], 0)
