from django.contrib import admin

from .models import Airport, Flight, Passenger

# Register your models here.
class FlightAdmin(admin.ModelAdmin):
    list_display = ("origin","destination", "duration")

class PassengerAdmin(admin.ModelAdmin):
    filter_horizontal = ("flights",)

admin.site.register(Airport)
admin.site.register(Flight, FlightAdmin)
admin.site.register(Passenger, PassengerAdmin)