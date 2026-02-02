from django.db import models
from django.conf import settings
from datetime import datetime, date

def default_due_date():
    """Return current date as default for due_date"""
    return date.today()

class Announcement(models.Model):
    ANNOUNCEMENT_TYPES = [
        ('general', 'General'),
        ('maintenance', 'Maintenance'),
        ('payment', 'Payment'),
        ('policy', 'Policy'),
        ('emergency', 'Emergency'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    announcement_type = models.CharField(max_length=20, choices=ANNOUNCEMENT_TYPES, default='general')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='announcements')
    target_audience = models.CharField(max_length=20, choices=[
        ('all', 'All Users'),
        ('tenants', 'Tenants Only'),
        ('admins', 'Admins Only'),
    ], default='all')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']

class Property(models.Model):
    PROPERTY_TYPES = [
        ('apartment', 'Apartment'),
        ('bedsitter', 'Bedsitter'),
        ('hostel', 'Student Hostel'),
        ('studio', 'Studio'),
    ]
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='properties')
    name = models.CharField(max_length=200)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES, default='apartment')
    location = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    suggested_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # AI-suggested price
    bedrooms = models.IntegerField(default=0)
    bathrooms = models.IntegerField(default=1)
    square_feet = models.IntegerField(default=0)
    available = models.BooleanField(default=True)
    occupancy_rate = models.FloatField(default=0.0)  # AI-calculated
    demand_score = models.FloatField(default=0.0)  # AI-calculated demand
    risk_score = models.FloatField(default=0.0)  # AI-calculated risk
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Tenant(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='tenant_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name='tenants')
    active = models.BooleanField(default=True)
    
    # AI-relevant fields
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    preferred_property_type = models.CharField(max_length=20, choices=Property.PROPERTY_TYPES, null=True, blank=True)
    preferred_location = models.CharField(max_length=255, blank=True)
    credit_score = models.IntegerField(default=0)  # AI-calculated
    payment_reliability_score = models.FloatField(default=0.0)  # AI-calculated
    behavior_risk_score = models.FloatField(default=0.0)  # AI-calculated
    tenant_satisfaction_score = models.FloatField(default=0.0)  # AI-calculated
    late_payment_count = models.IntegerField(default=0)
    total_payments_made = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Payment(models.Model):
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('late', 'Late'),
        ('overdue', 'Overdue'),
    ]
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(default=default_due_date)
    payment_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # AI prediction fields
    late_payment_probability = models.FloatField(default=0.0)  # AI-calculated
    days_overdue_predicted = models.IntegerField(default=0)  # AI-calculated
    payment_risk_score = models.FloatField(default=0.0)  # AI-calculated
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.id} - {self.amount}"

class MaintenanceRequest(models.Model):
    MAINTENANCE_STATUS = [
        ('submitted', 'Submitted'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    tenant = models.ForeignKey(Tenant, on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_requests')
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_requests')
    issue_description = models.TextField()
    status = models.CharField(max_length=20, choices=MAINTENANCE_STATUS, default='submitted')
    priority_score = models.FloatField(default=0.0)  # AI-calculated urgency
    completion_time_predicted = models.IntegerField(default=0)  # AI-predicted hours
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Maintenance {self.id} - {self.status}"

class TenantPreference(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='preferences')
    preference_type = models.CharField(max_length=50)  # 'location', 'price_range', 'amenities', etc.
    preference_value = models.TextField()
    importance_score = models.FloatField(default=1.0)  # 1.0-10.0 how important this preference is
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tenant.first_name} - {self.preference_type}"

class TenantBehavior(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='behaviors')
    behavior_type = models.CharField(max_length=50)  # 'login_frequency', 'payment_pattern', 'maintenance_requests', etc.
    behavior_data = models.JSONField()  # Store behavior metrics
    risk_score = models.FloatField(default=0.0)  # AI-calculated risk for this behavior
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tenant.first_name} - {self.behavior_type}"

class AIModelPrediction(models.Model):
    MODEL_TYPES = [
        ('tenant_allocation', 'Tenant Allocation'),
        ('payment_prediction', 'Payment Prediction'),
        ('price_optimization', 'Price Optimization'),
        ('risk_assessment', 'Risk Assessment'),
        ('occupancy_forecast', 'Occupancy Forecast'),
    ]
    
    model_type = models.CharField(max_length=30, choices=MODEL_TYPES)
    input_data = models.JSONField()
    prediction_result = models.JSONField()
    confidence_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    is_accurate = models.BooleanField(null=True, blank=True)  # For model improvement feedback

    def __str__(self):
        return f"{self.model_type} - {self.created_at}"
