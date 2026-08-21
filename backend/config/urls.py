from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from destinations.views import DestinationViewSet, RecommendationsView
from favorites.views import FavoriteViewSet
from places.views import CategoryViewSet, PlaceViewSet
from reviews.views import ReviewViewSet
from trips.views import ItineraryItemViewSet, TripViewSet

router = DefaultRouter()
router.register('destinations', DestinationViewSet, basename='destination')
router.register('categories', CategoryViewSet, basename='category')
router.register('places', PlaceViewSet, basename='place')
router.register('favorites', FavoriteViewSet, basename='favorite')
router.register('trips', TripViewSet, basename='trip')
router.register('itinerary-items', ItineraryItemViewSet, basename='itinerary-item')
router.register('reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/recommendations/', RecommendationsView.as_view(), name='recommendations'),
    path('api/currency/', include('currency.urls')),
    path('api/', include('bookings.urls')),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
