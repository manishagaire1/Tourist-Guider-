from rest_framework import serializers

from places.serializers import PlaceSerializer

from .models import ItineraryItem, Trip


class ItineraryItemSerializer(serializers.ModelSerializer):
    place_detail = PlaceSerializer(source='place', read_only=True)

    class Meta:
        model = ItineraryItem
        fields = ['id', 'trip', 'place', 'place_detail', 'day_number', 'time', 'order', 'notes']
        read_only_fields = ['id']


class TripSerializer(serializers.ModelSerializer):
    itinerary_items = ItineraryItemSerializer(many=True, read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True, default=None)

    class Meta:
        model = Trip
        fields = [
            'id', 'name', 'destination', 'destination_name', 'start_date', 'end_date',
            'notes', 'itinerary_items', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if start and end and end < start:
            raise serializers.ValidationError({'end_date': 'End date must be on or after the start date.'})
        return attrs
