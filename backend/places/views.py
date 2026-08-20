from django.db.models import Avg, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from .models import Category, Place
from .serializers import CategorySerializer, PlaceSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PlaceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['destination', 'category', 'price_range']
    search_fields = ['name', 'description', 'address']
    ordering_fields = ['rating', 'name', 'price_range']
    ordering = ['-rating', 'name']

    def get_queryset(self):
        queryset = Place.objects.select_related('category', 'destination').annotate(
            avg_rating=Avg('reviews__rating'),
            reviews_count=Count('reviews'),
        )
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(rating__gte=min_rating)
        return queryset
