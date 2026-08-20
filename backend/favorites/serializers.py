from rest_framework import serializers

from destinations.serializers import DestinationSerializer
from places.serializers import PlaceSerializer

from .models import Favorite


class FavoriteSerializer(serializers.ModelSerializer):
    destination_detail = DestinationSerializer(source='destination', read_only=True)
    place_detail = PlaceSerializer(source='place', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'destination', 'place', 'destination_detail', 'place_detail', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        destination = attrs.get('destination')
        place = attrs.get('place')
        if bool(destination) == bool(place):
            raise serializers.ValidationError('Provide exactly one of destination or place.')
        return attrs
