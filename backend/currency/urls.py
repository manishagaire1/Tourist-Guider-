from django.urls import path

from .views import ExchangeRatesView

urlpatterns = [
    path('rates/', ExchangeRatesView.as_view(), name='exchange-rates'),
]
