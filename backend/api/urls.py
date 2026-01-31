from rest_framework import routers
from django.urls import path, include
from .views import PropertyViewSet, TenantViewSet, PaymentViewSet, MaintenanceRequestViewSet, me

router = routers.DefaultRouter()
router.register(r'properties', PropertyViewSet)
router.register(r'tenants', TenantViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'maintenance', MaintenanceRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/me/', me, name='auth-me'),
]
