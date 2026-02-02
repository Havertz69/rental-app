import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import logging
from django.db import models

from api.models import Tenant, Property, Payment, MaintenanceRequest, TenantBehavior, AIModelPrediction

logger = logging.getLogger(__name__)

class RiskAssessmentAI:
    """AI-powered risk assessment system"""
    
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def calculate_tenant_risk_score(self, tenant):
        """Calculate comprehensive risk score for a tenant"""
        risk_factors = {}
        total_risk = 0.0
        
        # Payment history risk (30% weight)
        payment_risk = self._calculate_payment_risk(tenant)
        risk_factors['payment_risk'] = payment_risk
        total_risk += payment_risk * 0.3
        
        # Credit score risk (25% weight)
        credit_risk = self._calculate_credit_risk(tenant.credit_score)
        risk_factors['credit_risk'] = credit_risk
        total_risk += credit_risk * 0.25
        
        # Behavior pattern risk (20% weight)
        behavior_risk = self._calculate_behavior_risk(tenant)
        risk_factors['behavior_risk'] = behavior_risk
        total_risk += behavior_risk * 0.2
        
        # Maintenance request risk (15% weight)
        maintenance_risk = self._calculate_maintenance_risk(tenant)
        risk_factors['maintenance_risk'] = maintenance_risk
        total_risk += maintenance_risk * 0.15
        
        # Tenancy duration risk (10% weight)
        duration_risk = self._calculate_duration_risk(tenant)
        risk_factors['duration_risk'] = duration_risk
        total_risk += duration_risk * 0.10
        
        return {
            'total_risk_score': min(total_risk, 10.0),
            'risk_factors': risk_factors,
            'risk_level': self._get_risk_level(total_risk)
        }
    
    def _calculate_payment_risk(self, tenant):
        """Calculate payment-related risk"""
        total_payments = Payment.objects.filter(tenant=tenant).count()
        
        if total_payments == 0:
            return 5.0  # Neutral risk for new tenants
        
        late_payments = Payment.objects.filter(
            tenant=tenant,
            status__in=['late', 'overdue']
        ).count()
        
        late_rate = late_payments / total_payments
        
        # Convert to 0-10 scale
        return late_rate * 10.0
    
    def _calculate_credit_risk(self, credit_score):
        """Calculate credit score risk"""
        if credit_score >= 750:
            return 1.0
        elif credit_score >= 700:
            return 2.5
        elif credit_score >= 650:
            return 4.0
        elif credit_score >= 600:
            return 6.0
        elif credit_score >= 550:
            return 8.0
        else:
            return 10.0
    
    def _calculate_behavior_risk(self, tenant):
        """Calculate behavior pattern risk"""
        # Check for recent concerning behaviors
        recent_behaviors = TenantBehavior.objects.filter(
            tenant=tenant,
            timestamp__gte=datetime.now() - timedelta(days=90)
        )
        
        if not recent_behaviors.exists():
            return 3.0  # Neutral risk
        
        total_risk = 0.0
        for behavior in recent_behaviors:
            total_risk += behavior.risk_score
        
        # Average risk score
        avg_risk = total_risk / recent_behaviors.count()
        return min(avg_risk, 10.0)
    
    def _calculate_maintenance_risk(self, tenant):
        """Calculate maintenance request risk"""
        maintenance_requests = MaintenanceRequest.objects.filter(tenant=tenant)
        
        if not maintenance_requests.exists():
            return 3.0  # Neutral risk
        
        total_requests = maintenance_requests.count()
        recent_requests = maintenance_requests.filter(
            created_at__gte=datetime.now() - timedelta(days=90)
        ).count()
        
        # High frequency of maintenance requests increases risk
        if recent_requests > 5:
            return 8.0
        elif recent_requests > 3:
            return 6.0
        elif recent_requests > 1:
            return 4.0
        else:
            return 2.0
    
    def _calculate_duration_risk(self, tenant):
        """Calculate tenancy duration risk"""
        if not tenant.created_at:
            return 5.0
        
        days_as_tenant = (datetime.now().date() - tenant.created_at).days
        
        if days_as_tenant < 30:
            return 7.0  # New tenant
        elif days_as_tenant < 90:
            return 5.0  # Recent tenant
        elif days_as_tenant < 365:
            return 3.0  # Established tenant
        else:
            return 1.0  # Long-term tenant
    
    def _get_risk_level(self, risk_score):
        """Convert risk score to risk level"""
        if risk_score <= 2.0:
            return 'Very Low'
        elif risk_score <= 4.0:
            return 'Low'
        elif risk_score <= 6.0:
            return 'Medium'
        elif risk_score <= 8.0:
            return 'High'
        else:
            return 'Very High'
    
    def calculate_property_risk_score(self, property):
        """Calculate risk score for a property"""
        risk_factors = {}
        total_risk = 0.0
        
        # Location risk (30% weight)
        location_risk = self._calculate_location_risk(property)
        risk_factors['location_risk'] = location_risk
        total_risk += location_risk * 0.3
        
        # Occupancy risk (25% weight)
        occupancy_risk = self._calculate_occupancy_risk(property)
        risk_factors['occupancy_risk'] = occupancy_risk
        total_risk += occupancy_risk * 0.25
        
        # Tenant mix risk (20% weight)
        tenant_risk = self._calculate_tenant_mix_risk(property)
        risk_factors['tenant_risk'] = tenant_risk
        total_risk += tenant_risk * 0.2
        
        # Maintenance risk (15% weight)
        maintenance_risk = self._calculate_property_maintenance_risk(property)
        risk_factors['maintenance_risk'] = maintenance_risk
        total_risk += maintenance_risk * 0.15
        
        # Price risk (10% weight)
        price_risk = self._calculate_price_risk(property)
        risk_factors['price_risk'] = price_risk
        total_risk += price_risk * 0.10
        
        return {
            'total_risk_score': min(total_risk, 10.0),
            'risk_factors': risk_factors,
            'risk_level': self._get_risk_level(total_risk)
        }
    
    def _calculate_location_risk(self, property):
        """Calculate location-based risk"""
        # This could be enhanced with external data
        similar_properties = Property.objects.filter(location=property.location)
        
        if similar_properties.count() == 0:
            return 5.0  # Neutral risk
        
        avg_occupancy = sum(p.occupancy_rate for p in similar_properties) / similar_properties.count()
        
        # Lower occupancy = higher risk
        if avg_occupancy > 0.9:
            return 2.0
        elif avg_occupancy > 0.7:
            return 4.0
        elif avg_occupancy > 0.5:
            return 6.0
        else:
            return 8.0
    
    def _calculate_occupancy_risk(self, property):
        """Calculate occupancy-based risk"""
        occupancy_rate = property.occupancy_rate
        
        if occupancy_rate > 0.9:
            return 2.0  # Low risk - high occupancy
        elif occupancy_rate > 0.7:
            return 4.0
        elif occupancy_rate > 0.5:
            return 6.0
        else:
            return 8.0  # High risk - low occupancy
    
    def _calculate_tenant_mix_risk(self, property):
        """Calculate tenant mix risk"""
        tenants = property.tenants.filter(active=True)
        
        if not tenants.exists():
            return 5.0
        
        # Calculate average tenant risk
        total_tenant_risk = 0.0
        for tenant in tenants:
            tenant_risk = self.calculate_tenant_risk_score(tenant)
            total_tenant_risk += tenant_risk['total_risk_score']
        
        avg_tenant_risk = total_tenant_risk / tenants.count()
        return avg_tenant_risk
    
    def _calculate_property_maintenance_risk(self, property):
        """Calculate maintenance-related risk"""
        maintenance_requests = MaintenanceRequest.objects.filter(property=property)
        
        if not maintenance_requests.exists():
            return 3.0
        
        recent_requests = maintenance_requests.filter(
            created_at__gte=datetime.now() - timedelta(days=90)
        ).count()
        
        if recent_requests > 5:
            return 8.0
        elif recent_requests > 3:
            return 6.0
        elif recent_requests > 1:
            return 4.0
        else:
            return 2.0
    
    def _calculate_price_risk(self, property):
        """Calculate price-related risk"""
        similar_properties = Property.objects.filter(
            location=property.location,
            property_type=property.property_type
        )
        
        if not similar_properties.exists():
            return 5.0
        
        avg_price = similar_properties.aggregate(
            models.Avg('price')
        )['price__avg'] or property.price
        
        price_diff_ratio = abs(float(property.price) - float(avg_price)) / float(avg_price)
        
        # Higher price deviation = higher risk
        return min(price_diff_ratio * 10, 10.0)
    
    def update_risk_scores(self, tenant=None, property=None):
        """Update risk scores and save to database"""
        if tenant:
            risk_assessment = self.calculate_tenant_risk_score(tenant)
            tenant.behavior_risk_score = risk_assessment['total_risk_score']
            tenant.save()
            
            # Log assessment
            AIModelPrediction.objects.create(
                model_type='risk_assessment',
                input_data={'tenant_id': tenant.id},
                prediction_result=risk_assessment,
                confidence_score=0.8
            )
        
        if property:
            risk_assessment = self.calculate_property_risk_score(property)
            property.risk_score = risk_assessment['total_risk_score']
            property.save()
            
            # Log assessment
            AIModelPrediction.objects.create(
                model_type='risk_assessment',
                input_data={'property_id': property.id},
                prediction_result=risk_assessment,
                confidence_score=0.8
            )
    
    def train_model(self):
        """Train the risk assessment model"""
        # This would be implemented with historical risk data
        self.is_trained = False
        logger.info("Risk assessment model initialized with rule-based scoring")
