from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import TravelPreference

from .models import Destination

User = get_user_model()


def make_destination(name, country, rating, interest_tags=None):
    return Destination.objects.create(
        name=name, country=country, rating=rating, interest_tags=interest_tags or [],
    )


class DestinationListTests(APITestCase):
    def setUp(self):
        make_destination('Tokyo', 'Japan', 4.8, ['culture', 'food'])
        make_destination('Sydney', 'Australia', 4.7, ['beaches', 'adventure'])

    def test_list_is_public(self):
        response = self.client.get('/api/destinations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_search_by_name(self):
        response = self.client.get('/api/destinations/', {'search': 'Tokyo'})
        names = [d['name'] for d in response.data['results']]
        self.assertEqual(names, ['Tokyo'])

    def test_places_count_defaults_to_zero(self):
        response = self.client.get('/api/destinations/')
        for destination in response.data['results']:
            self.assertEqual(destination['places_count'], 0)


class RecommendationsTests(APITestCase):
    def setUp(self):
        self.tokyo = make_destination('Tokyo', 'Japan', 4.8, ['culture', 'food'])
        self.sydney = make_destination('Sydney', 'Australia', 4.7, ['beaches', 'adventure'])
        self.paris = make_destination('Paris', 'France', 4.6, ['culture', 'history'])
        self.user = User.objects.create_user(username='traveler', email='t@example.com', password='S0meStrongPass!')

    def test_anonymous_user_gets_top_rated_fallback(self):
        response = self.client.get('/api/recommendations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['based_on'], [])
        names = [d['name'] for d in response.data['results']]
        self.assertEqual(names[0], 'Tokyo')  # highest rated

    def test_authenticated_user_without_preferences_gets_fallback(self):
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/recommendations/')
        self.assertEqual(response.data['based_on'], [])

    def test_matches_user_interests(self):
        TravelPreference.objects.create(user=self.user, interests=['beaches', 'adventure'])
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/recommendations/')
        names = [d['name'] for d in response.data['results']]
        self.assertIn('Sydney', names)
        self.assertNotIn('Paris', names)
        self.assertEqual(response.data['based_on'], ['adventure', 'beaches'])

    def test_ranks_more_overlapping_interests_higher(self):
        TravelPreference.objects.create(user=self.user, interests=['culture', 'history'])
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/recommendations/')
        names = [d['name'] for d in response.data['results']]
        # Paris matches both culture+history; Tokyo only matches culture.
        self.assertEqual(names[0], 'Paris')
