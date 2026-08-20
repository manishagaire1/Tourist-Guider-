from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from destinations.models import Destination
from places.models import Category, Place

from .models import Review

User = get_user_model()


class ReviewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='traveler', email='t@example.com', password='S0meStrongPass!')
        self.other_user = User.objects.create_user(username='other', email='o@example.com', password='S0meStrongPass!')
        destination = Destination.objects.create(name='Tokyo', country='Japan', rating=4.8)
        category = Category.objects.create(name='Temples')
        self.place = Place.objects.create(destination=destination, category=category, name='Senso-ji', rating=4.7)

    def test_anyone_can_read_reviews(self):
        Review.objects.create(user=self.user, place=self.place, rating=5, comment='Great!')
        response = self.client.get('/api/reviews/', {'place': self.place.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_create_requires_auth(self):
        response = self.client.post('/api/reviews/', {'place': self.place.id, 'rating': 5})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_review(self):
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/reviews/', {'place': self.place.id, 'rating': 5, 'comment': 'Loved it'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user'], self.user.id)

    def test_duplicate_review_rejected(self):
        Review.objects.create(user=self.user, place=self.place, rating=4)
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/reviews/', {'place': self.place.id, 'rating': 5})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_only_owner_can_update_review(self):
        review = Review.objects.create(user=self.user, place=self.place, rating=4)
        self.client.force_authenticate(self.other_user)
        response = self.client.patch(f'/api/reviews/{review.id}/', {'rating': 1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_update_own_review(self):
        review = Review.objects.create(user=self.user, place=self.place, rating=4)
        self.client.force_authenticate(self.user)
        response = self.client.patch(f'/api/reviews/{review.id}/', {'rating': 2}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['rating'], 2)
