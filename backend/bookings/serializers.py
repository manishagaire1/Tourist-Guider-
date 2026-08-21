from rest_framework import serializers


class AvailabilityRequestSerializer(serializers.Serializer):
    date = serializers.DateField()
    travelers = serializers.IntegerField(min_value=1, max_value=20)
