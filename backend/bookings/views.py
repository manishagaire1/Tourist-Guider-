from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from places.models import Place

from . import viator_client
from .models import ViatorProductMapping
from .serializers import AvailabilityRequestSerializer
from .viator_client import ViatorError


class PlaceToursView(APIView):
    """GET /api/places/{id}/tours/ — real Viator products mapped to this place.

    Returns an empty list (never fabricated products) when the place has no
    curated mappings, or when Viator credentials aren't configured yet.
    """

    permission_classes = [AllowAny]

    def get(self, request, place_id):
        place = get_object_or_404(Place, pk=place_id)
        mappings = ViatorProductMapping.objects.filter(place=place)

        if not viator_client.is_configured():
            return Response({'configured': False, 'products': []})

        products = []
        for mapping in mappings:
            try:
                products.append(viator_client.get_product(mapping.product_code))
            except ViatorError:
                # Skip a single bad mapping rather than failing the whole list —
                # the place may still have other valid, bookable products.
                continue

        return Response({'configured': True, 'products': products})


class ProductAvailabilityView(APIView):
    """POST /api/places/{id}/tours/{product_code}/availability/

    Body: {"date": "YYYY-MM-DD", "travelers": <int>}
    Proxies a real-time availability check to Viator. Never returns a
    fabricated availability state.
    """

    permission_classes = [AllowAny]

    def post(self, request, place_id, product_code):
        get_object_or_404(Place, pk=place_id)
        mapping_exists = ViatorProductMapping.objects.filter(
            place_id=place_id, product_code=product_code,
        ).exists()
        if not mapping_exists:
            return Response({'error': 'invalid_product'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AvailabilityRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'invalid_date'}, status=status.HTTP_400_BAD_REQUEST)

        if not viator_client.is_configured():
            return Response({'error': 'not_configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            result = viator_client.check_availability(
                product_code,
                serializer.validated_data['date'].isoformat(),
                serializer.validated_data['travelers'],
            )
        except ViatorError as error:
            error_status = {
                'auth_error': status.HTTP_502_BAD_GATEWAY,
                'rate_limited': status.HTTP_429_TOO_MANY_REQUESTS,
                'timeout': status.HTTP_504_GATEWAY_TIMEOUT,
                'invalid_product': status.HTTP_404_NOT_FOUND,
            }.get(error.code, status.HTTP_503_SERVICE_UNAVAILABLE)
            return Response({'error': error.code}, status=error_status)

        return Response(result)
