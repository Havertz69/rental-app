from rest_framework import routers
from django.urls import path, include
from .views import (
    PropertyViewSet, TenantViewSet, PaymentViewSet, MaintenanceRequestViewSet, 
    me, EmailTokenObtainPairView, create_tenant_user, create_admin_user, 
    get_available_properties, announcements
)
from .admin_views import (
    dashboard_stats, ai_insights, user_management, user_action, 
    system_activity, analytics_data, system_configuration
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = routers.DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'maintenance', MaintenanceRequestViewSet, basename='maintenance')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/me/', me, name='auth-me'),
    path('auth/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/create-tenant/', create_tenant_user, name='create-tenant'),
    path('auth/create-admin/', create_admin_user, name='create-admin'),
    path('properties/available/', get_available_properties, name='available-properties'),
    
    # Admin dashboard endpoints
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('ai/insights/', ai_insights, name='ai-insights'),
    path('users/', user_management, name='user-management'),
    path('users/<int:user_id>/<str:action>/', user_action, name='user-action'),
    path('activity/recent/', system_activity, name='system-activity'),
    path('analytics/', analytics_data, name='analytics-data'),
    path('system/configure/', system_configuration, name='system-configuration'),
    
    # Announcement endpoints
    path('announcements/', announcements, name='announcements'),
]
