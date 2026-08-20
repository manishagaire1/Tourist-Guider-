from django.db import models
from django.utils.text import slugify


class Destination(models.Model):
    name = models.CharField(max_length=150)
    country = models.CharField(max_length=100)
    slug = models.SlugField(max_length=170, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='destinations/', blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    best_time_to_visit = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name}, {self.country}'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f'{self.name}-{self.country}')
        super().save(*args, **kwargs)
