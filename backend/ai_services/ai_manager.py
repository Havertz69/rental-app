from .tenant_allocation import TenantAllocationAI
from .payment_prediction import PaymentPredictionAI
from .dynamic_pricing import DynamicPricingAI
from .occupancy_forecast import OccupancyForecastAI
from .risk_assessment import RiskAssessmentAI
from django.db import models

class AIServiceManager:
    """Main AI service manager that coordinates all AI services"""
    
    def __init__(self):
        self.tenant_allocation = TenantAllocationAI()
        self.payment_prediction = PaymentPredictionAI()
        self.dynamic_pricing = DynamicPricingAI()
        self.occupancy_forecast = OccupancyForecastAI()
        self.risk_assessment = RiskAssessmentAI()
        
        # Initialize all models
        self.initialize_models()
    
    def initialize_models(self):
        """Initialize all AI models"""
        self.tenant_allocation.train_model()
        self.payment_prediction.train_model()
        self.dynamic_pricing.train_model()
        self.occupancy_forecast.train_model()
        self.risk_assessment.train_model()
    
    def get_tenant_recommendations(self, tenant, properties=None):
        """Get property recommendations for a tenant"""
        if properties is None:
            from api.models import Property
            properties = Property.objects.filter(available=True)
        
        return self.tenant_allocation.find_best_matches(tenant, properties)
    
    def update_payment_predictions(self, payment):
        """Update payment predictions"""
        return self.payment_prediction.update_payment_predictions(payment)
    
    def update_property_pricing(self, property):
        """Update property pricing recommendations"""
        return self.dynamic_pricing.update_property_pricing(property)
    
    def update_property_forecasts(self, property):
        """Update property occupancy and revenue forecasts"""
        return self.occupancy_forecast.update_property_forecasts(property)
    
    def update_risk_scores(self, tenant=None, property=None):
        """Update risk scores"""
        return self.risk_assessment.update_risk_scores(tenant, property)
    
    def get_dashboard_analytics(self):
        """Get comprehensive analytics for dashboard"""
        from api.models import Property, Tenant, Payment, MaintenanceRequest
        
        # Basic statistics
        total_properties = Property.objects.count()
        total_tenants = Tenant.objects.filter(active=True).count()
        total_properties_available = Property.objects.filter(available=True).count()
        
        # Calculate total revenue (current month)
        from datetime import datetime, timedelta
        current_month_start = datetime.now().replace(day=1).date()
        current_month_payments = Payment.objects.filter(
            payment_date__gte=current_month_start,
            status='paid'
        )
        total_revenue = sum(p.amount for p in current_month_payments)
        
        # Average occupancy rate
        avg_occupancy = Property.objects.aggregate(
            avg_occupancy=models.Avg('occupancy_rate')
        )['avg_occupancy'] or 0
        
        # Maintenance requests
        pending_maintenance = MaintenanceRequest.objects.filter(
            status__in=['submitted', 'in_progress']
        ).count()
        
        return {
            'total_properties': total_properties,
            'total_tenants': total_tenants,
            'available_properties': total_properties_available,
            'total_revenue': float(total_revenue),
            'average_occupancy_rate': float(avg_occupancy),
            'pending_maintenance_requests': pending_maintenance,
            'ai_insights': self._get_ai_insights()
        }
    
    def _get_ai_insights(self):
        """Get AI-powered insights"""
        insights = []
        
        # High-risk tenants
        from api.models import Tenant
        high_risk_tenants = Tenant.objects.filter(
            behavior_risk_score__gte=7.0,
            active=True
        ).count()
        
        if high_risk_tenants > 0:
            insights.append({
                'type': 'warning',
                'title': f'{high_risk_tenants} High-Risk Tenants Detected',
                'description': 'Consider reviewing tenant behavior and payment history',
                'priority': 'high'
            })
        
        # Properties with pricing opportunities
        from api.models import Property
        underpriced_properties = Property.objects.filter(
            suggested_price__gt=models.F('price') * 1.1
        ).count()
        
        if underpriced_properties > 0:
            insights.append({
                'type': 'opportunity',
                'title': f'{underpriced_properties} Properties Underpriced',
                'description': 'AI suggests increasing rent for optimal revenue',
                'priority': 'medium'
            })
        
        # Low occupancy properties
        low_occupancy_properties = Property.objects.filter(
            occupancy_rate__lt=0.5,
            available=True
        ).count()
        
        if low_occupancy_properties > 0:
            insights.append({
                'type': 'warning',
                'title': f'{low_occupancy_properties} Properties with Low Occupancy',
                'description': 'Consider adjusting pricing or marketing strategies',
                'priority': 'medium'
            })
        
        return insights

# Global AI service instance
ai_service = AIServiceManager()
