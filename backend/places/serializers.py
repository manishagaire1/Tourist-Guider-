from rest_framework import serializers

from .models import Category, Place


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'translations']


class PlaceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True,
    )
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Place
        fields = [
            'id', 'destination', 'destination_name', 'category', 'category_id', 'name',
            'description', 'address', 'latitude', 'longitude', 'rating', 'price_range',
            'opening_hours', 'phone', 'website', 'image_url', 'image_source', 'image_source_url',
            'image_credit', 'translations', 'average_rating', 'review_count', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_average_rating(self, obj):
        avg = getattr(obj, 'avg_rating', None)
        return round(avg, 2) if avg is not None else None

    def get_review_count(self, obj):
        return getattr(obj, 'reviews_count', 0)
