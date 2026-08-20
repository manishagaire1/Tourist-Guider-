from django.contrib import admin

from .models import Destination


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'rating', 'best_time_to_visit')
    list_filter = ('country',)
    search_fields = ('name', 'country')
    prepopulated_fields = {'slug': ('name', 'country')}
