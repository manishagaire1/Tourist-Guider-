from django.db import models
from django.utils.text import slugify

from destinations.models import Destination


class Category(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=70, unique=True, blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Lucide icon name')

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Place(models.Model):
    class PriceRange(models.TextChoices):
        BUDGET = '$', 'Budget'
        MODERATE = '$$', 'Moderate'
        EXPENSIVE = '$$$', 'Expensive'
        LUXURY = '$$$$', 'Luxury'

    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='places')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='places')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    price_range = models.CharField(max_length=4, choices=PriceRange.choices, blank=True)
    opening_hours = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    website = models.URLField(blank=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-rating', 'name']

    def __str__(self):
        return self.name
