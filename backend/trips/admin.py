from django.contrib import admin

from .models import ItineraryItem, Trip


class ItineraryItemInline(admin.TabularInline):
    model = ItineraryItem
    extra = 1


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'destination', 'start_date', 'end_date')
    list_filter = ('start_date',)
    inlines = [ItineraryItemInline]
