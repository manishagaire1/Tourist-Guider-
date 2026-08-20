from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import TravelPreference

User = get_user_model()


class RegisterTests(APITestCase):
    def test_register_creates_user(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'traveler',
            'email': 'traveler@example.com',
            'password': 'S0meStrongPass!',
            'password2': 'S0meStrongPass!',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='traveler').exists())
        self.assertNotIn('password', response.data)

    def test_register_password_mismatch_fails(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'traveler',
            'email': 'traveler@example.com',
            'password': 'S0meStrongPass!',
            'password2': 'Different!',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username='traveler').exists())


class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='traveler', email='t@example.com', password='S0meStrongPass!')

    def test_login_returns_tokens_and_user(self):
        response = self.client.post('/api/auth/login/', {'username': 'traveler', 'password': 'S0meStrongPass!'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'traveler')

    def test_login_wrong_password_fails(self):
        response = self.client.post('/api/auth/login/', {'username': 'traveler', 'password': 'wrong'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklists_refresh_token(self):
        login = self.client.post('/api/auth/login/', {'username': 'traveler', 'password': 'S0meStrongPass!'})
        access, refresh = login.data['access'], login.data['refresh']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        logout = self.client.post('/api/auth/logout/', {'refresh': refresh})
        self.assertEqual(logout.status_code, status.HTTP_205_RESET_CONTENT)

        refresh_attempt = self.client.post('/api/auth/login/refresh/', {'refresh': refresh})
        self.assertEqual(refresh_attempt.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='traveler', email='t@example.com', password='S0meStrongPass!')

    def test_profile_requires_auth(self):
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_returns_current_user(self):
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'traveler')


class TravelPreferenceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='traveler', email='t@example.com', password='S0meStrongPass!')
        self.client.force_authenticate(self.user)

    def test_get_creates_preference_on_first_access(self):
        self.assertFalse(TravelPreference.objects.filter(user=self.user).exists())
        response = self.client.get('/api/auth/profile/preferences/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(TravelPreference.objects.filter(user=self.user).exists())

    def test_update_with_valid_interests(self):
        response = self.client.patch('/api/auth/profile/preferences/', {'interests': ['food', 'culture']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(sorted(response.data['interests']), ['culture', 'food'])

    def test_update_with_invalid_interest_rejected(self):
        response = self.client.patch('/api/auth/profile/preferences/', {'interests': ['not-a-real-interest']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
