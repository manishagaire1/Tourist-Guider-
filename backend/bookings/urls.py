from django.urls import path

from .views import PlaceToursView, ProductAvailabilityView

urlpatterns = [
    path('places/<int:place_id>/tours/', PlaceToursView.as_view(), name='place-tours'),
    path(
        'places/<int:place_id>/tours/<str:product_code>/availability/',
        ProductAvailabilityView.as_view(),
        name='product-availability',
    ),
]
