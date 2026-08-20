from django.db.models import Count
from rest_framework import filters, viewsets

from .models import Destination
from .serializers import DestinationSerializer


class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DestinationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country', 'description']
    ordering_fields = ['rating', 'name', 'created_at']

    def get_queryset(self):
        return Destination.objects.annotate(places_count=Count('places'))
