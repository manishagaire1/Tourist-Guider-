from django.db import models

from places.models import Place


class ViatorProductMapping(models.Model):
    """Curated link from a Place to a real Viator product code.

    Nothing here is auto-populated or guessed — an admin adds a mapping only
    after confirming the Viator product genuinely corresponds to this place.
    A place with no mappings simply has no bookable tours.
    """

    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='viator_products')
    product_code = models.CharField(max_length=50, help_text="Viator's productCode, e.g. '5010SYDNEY'")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('place', 'product_code')
        ordering = ['place', 'product_code']

    def __str__(self):
        return f'{self.place.name} → {self.product_code}'
