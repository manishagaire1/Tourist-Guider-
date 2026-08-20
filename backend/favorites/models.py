from django.conf import settings
from django.db import models
from django.db.models import Q


class Favorite(models.Model):
    """A saved Destination or Place. Exactly one of destination/place is set —
    two nullable FKs are simpler and safer here than a generic relation for
    just two favoritable types."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    destination = models.ForeignKey(
        'destinations.Destination', on_delete=models.CASCADE,
        null=True, blank=True, related_name='favorited_by',
    )
    place = models.ForeignKey(
        'places.Place', on_delete=models.CASCADE,
        null=True, blank=True, related_name='favorited_by',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(destination__isnull=False, place__isnull=True)
                    | Q(destination__isnull=True, place__isnull=False)
                ),
                name='favorite_exactly_one_target',
            ),
            models.UniqueConstraint(
                fields=['user', 'destination'], name='unique_user_destination_favorite',
                condition=Q(destination__isnull=False),
            ),
            models.UniqueConstraint(
                fields=['user', 'place'], name='unique_user_place_favorite',
                condition=Q(place__isnull=False),
            ),
        ]

    def __str__(self):
        target = self.destination or self.place
        return f'{self.user} favorited {target}'
