from django.contrib import admin
from .models import Property, Tenant, Payment, MaintenanceRequest

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('id','name','owner','location','price','available')
    list_filter = ('available',)
    search_fields = ('name','location')

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('id','first_name','last_name','email','user','property','active')
    list_filter = ('active',)
    search_fields = ('first_name','last_name','email')

admin.site.register(Payment)
admin.site.register(MaintenanceRequest)
