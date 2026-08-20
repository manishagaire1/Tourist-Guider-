from django.conf import settings
from django.db import models


class Trip(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trips')
    name = models.CharField(max_length=150)
    destination = models.ForeignKey(
        'destinations.Destination', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='trips',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.name} ({self.start_date} - {self.end_date})'


class ItineraryItem(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='itinerary_items')
    place = models.ForeignKey('places.Place', on_delete=models.CASCADE, related_name='itinerary_items')
    day_number = models.PositiveSmallIntegerField(help_text='1 = first day of the trip')
    time = models.TimeField(null=True, blank=True)
    order = models.PositiveSmallIntegerField(default=0, help_text='Manual ordering within a day')
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['day_number', 'order', 'time']

    def __str__(self):
        return f'Day {self.day_number}: {self.place} ({self.trip})'
