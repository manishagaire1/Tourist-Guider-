from rest_framework import permissions, viewsets

from .models import Favorite
from .serializers import FavoriteSerializer


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('destination', 'place')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
