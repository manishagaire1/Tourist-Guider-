from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import CurrencyError, get_exchange_rates


class ExchangeRatesView(APIView):
    """GET /api/currency/rates/?base=USD

    Public, read-only. The provider API key never leaves the backend.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        base = request.query_params.get('base', 'USD').upper()
        try:
            result = get_exchange_rates(base)
        except CurrencyError as error:
            return Response({'error': error.code, 'message': error.message}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(result)
