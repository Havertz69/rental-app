from django.urls import path
from . import views

urlpatterns = [
    # Tenant AI endpoints
    path('tenant-recommendations/', views.tenant_recommendations, name='ai-tenant-recommendations'),
    path('tenant-risk-assessment/', views.tenant_risk_assessment, name='ai-tenant-risk-assessment'),
    
    # Property AI endpoints
    path('update-property-pricing/', views.update_property_pricing, name='ai-update-property-pricing'),
    path('update-property-forecasts/', views.update_property_forecasts, name='ai-update-property-forecasts'),
    path('property-risk-assessment/', views.property_risk_assessment, name='ai-property-risk-assessment'),
    
    # Payment AI endpoints
    path('update-payment-prediction/', views.update_payment_prediction, name='ai-update-payment-prediction'),
    
    # Risk assessment endpoints
    path('update-risk-scores/', views.update_risk_scores, name='ai-update-risk-scores'),
    
    # Dashboard analytics
    path('dashboard-analytics/', views.dashboard_analytics, name='ai-dashboard-analytics'),
]
