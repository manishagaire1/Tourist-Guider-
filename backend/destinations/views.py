from django.db.models import Count
from rest_framework import filters, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Destination
from .serializers import DestinationSerializer

RECOMMENDATION_LIMIT = 8


class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DestinationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country', 'description']
    ordering_fields = ['rating', 'name', 'created_at']

    def get_queryset(self):
        return Destination.objects.annotate(places_count=Count('places'))


class RecommendationsView(APIView):
    """Destinations matching the current user's travel interests, ranked by
    how many interests overlap and falling back to top-rated destinations
    when the user has no preferences set (or isn't logged in)."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = Destination.objects.annotate(places_count=Count('places'))

        interests = set()
        if request.user.is_authenticated:
            preference = getattr(request.user, 'travel_preference', None)
            if preference:
                interests = set(preference.interests)

        if interests:
            scored = [
                (destination, len(interests.intersection(destination.interest_tags or [])))
                for destination in queryset
            ]
            matched = sorted(
                (item for item in scored if item[1] > 0),
                key=lambda item: (item[1], item[0].rating),
                reverse=True,
            )
            destinations = [item[0] for item in matched[:RECOMMENDATION_LIMIT]]
            if destinations:
                serializer = DestinationSerializer(destinations, many=True)
                return Response({'based_on': sorted(interests), 'results': serializer.data})

        fallback = queryset.order_by('-rating')[:RECOMMENDATION_LIMIT]
        serializer = DestinationSerializer(fallback, many=True)
        return Response({'based_on': [], 'results': serializer.data})
