from django.contrib import admin

from .models import Category, Place


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'destination', 'category', 'rating', 'price_range')
    list_filter = ('category', 'destination', 'price_range')
    search_fields = ('name', 'address')
