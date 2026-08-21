from django.contrib import admin

from .models import ViatorProductMapping


@admin.register(ViatorProductMapping)
class ViatorProductMappingAdmin(admin.ModelAdmin):
    list_display = ('place', 'product_code', 'created_at')
    search_fields = ('place__name', 'product_code')
    autocomplete_fields = ('place',)
