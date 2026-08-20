from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from config.permissions import IsOwner

from .models import ItineraryItem, Trip
from .serializers import ItineraryItemSerializer, TripSerializer


class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return (
            Trip.objects.filter(user=self.request.user)
            .select_related('destination')
            .prefetch_related('itinerary_items__place')
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ItineraryItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItineraryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ItineraryItem.objects.filter(trip__user=self.request.user).select_related('place', 'trip')

    def perform_create(self, serializer):
        trip = serializer.validated_data['trip']
        if trip.user != self.request.user:
            raise PermissionDenied("You don't own this trip.")
        serializer.save()
