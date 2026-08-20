from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_display = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'place', 'user', 'user_display', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate(self, attrs):
        request = self.context['request']
        place = attrs.get('place', getattr(self.instance, 'place', None))
        if self.instance is None and Review.objects.filter(user=request.user, place=place).exists():
            raise serializers.ValidationError('You already reviewed this place.')
        return attrs
