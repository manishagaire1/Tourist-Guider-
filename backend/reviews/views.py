from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets

from config.permissions import IsOwner

from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwner]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['place']
    queryset = Review.objects.select_related('user', 'place').all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
