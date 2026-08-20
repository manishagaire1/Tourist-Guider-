from rest_framework import serializers

from .models import Destination


class DestinationSerializer(serializers.ModelSerializer):
    places_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Destination
        fields = [
            'id', 'name', 'country', 'slug', 'description', 'image', 'rating',
            'best_time_to_visit', 'latitude', 'longitude', 'places_count', 'created_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at']
