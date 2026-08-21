from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return self.username


class TravelPreference(models.Model):
    class Interest(models.TextChoices):
        NATURE = 'nature', 'Nature'
        HISTORY = 'history', 'History'
        FOOD = 'food', 'Food'
        SHOPPING = 'shopping', 'Shopping'
        ADVENTURE = 'adventure', 'Adventure'
        BEACHES = 'beaches', 'Beaches'
        PHOTOGRAPHY = 'photography', 'Photography'
        CULTURE = 'culture', 'Culture'
        NIGHTLIFE = 'nightlife', 'Nightlife'
        FAMILY_TRAVEL = 'family_travel', 'Family Travel'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='travel_preference')
    interests = models.JSONField(default=list, blank=True, help_text='List of Interest values')
    preferred_currency = models.CharField(
        max_length=3, blank=True, help_text='ISO 4217 code, e.g. "JPY" — optional, never required',
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s preferences"
