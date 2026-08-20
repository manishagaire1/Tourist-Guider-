from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from destinations.models import Destination
from places.models import Category, Place

from .models import ItineraryItem, Trip

User = get_user_model()


class TripTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='traveler', email='t@example.com', password='S0meStrongPass!')
        self.other_user = User.objects.create_user(username='other', email='o@example.com', password='S0meStrongPass!')
        self.destination = Destination.objects.create(name='Tokyo', country='Japan', rating=4.8)
        category = Category.objects.create(name='Temples')
        self.place = Place.objects.create(destination=self.destination, category=category, name='Senso-ji', rating=4.7)

    def test_requires_auth(self):
        response = self.client.get('/api/trips/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_trip_assigns_current_user(self):
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/trips/', {
            'name': 'Tokyo Trip', 'destination': self.destination.id,
            'start_date': '2026-06-10', 'end_date': '2026-06-15',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        trip = Trip.objects.get(id=response.data['id'])
        self.assertEqual(trip.user, self.user)

    def test_end_date_before_start_date_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/trips/', {
            'name': 'Bad Trip', 'start_date': '2026-06-15', 'end_date': '2026-06-10',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_trips_scoped_to_owner(self):
        Trip.objects.create(user=self.other_user, name='Other Trip', start_date='2026-01-01', end_date='2026-01-02')
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/trips/')
        self.assertEqual(response.data['count'], 0)

    def test_cannot_access_others_trip_detail(self):
        trip = Trip.objects.create(user=self.other_user, name='Other Trip', start_date='2026-01-01', end_date='2026-01-02')
        self.client.force_authenticate(self.user)
        response = self.client.get(f'/api/trips/{trip.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ItineraryItemTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='traveler', email='t@example.com', password='S0meStrongPass!')
        self.other_user = User.objects.create_user(username='other', email='o@example.com', password='S0meStrongPass!')
        destination = Destination.objects.create(name='Tokyo', country='Japan', rating=4.8)
        category = Category.objects.create(name='Temples')
        self.place = Place.objects.create(destination=destination, category=category, name='Senso-ji', rating=4.7)
        self.trip = Trip.objects.create(user=self.user, name='My Trip', start_date='2026-06-10', end_date='2026-06-12')
        self.other_trip = Trip.objects.create(
            user=self.other_user, name='Other Trip', start_date='2026-06-10', end_date='2026-06-12',
        )

    def test_add_item_to_own_trip(self):
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/itinerary-items/', {
            'trip': self.trip.id, 'place': self.place.id, 'day_number': 1,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ItineraryItem.objects.count(), 1)

    def test_cannot_add_item_to_others_trip(self):
        self.client.force_authenticate(self.user)
        response = self.client.post('/api/itinerary-items/', {
            'trip': self.other_trip.id, 'place': self.place.id, 'day_number': 1,
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(ItineraryItem.objects.count(), 0)
