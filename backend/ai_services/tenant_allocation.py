import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
from datetime import datetime, timedelta
import json
import logging

from api.models import Tenant, Property, Payment, TenantPreference, TenantBehavior, AIModelPrediction

logger = logging.getLogger(__name__)

class TenantAllocationAI:
    """AI-powered tenant allocation system"""
    
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def prepare_features(self, tenant, property):
        """Prepare features for tenant-property matching"""
        features = []
        
        # Budget compatibility
        if tenant.budget_min and tenant.budget_max:
            budget_fit = 1.0 if tenant.budget_min <= property.price <= tenant.budget_max else 0.0
        else:
            budget_fit = 0.5  # neutral if no budget specified
            
        # Property type preference
        type_match = 1.0 if tenant.preferred_property_type == property.property_type else 0.0
        
        # Location preference (simple string matching for now)
        location_match = 0.0
        if tenant.preferred_location and property.location:
            if tenant.preferred_location.lower() in property.location.lower():
                location_match = 1.0
                
        # Property characteristics
        features.extend([
            budget_fit,
            type_match,
            location_match,
            float(property.bedrooms),
            float(property.bathrooms),
            float(property.square_feet),
            property.demand_score,
            property.risk_score,
            tenant.credit_score,
            tenant.payment_reliability_score,
            tenant.behavior_risk_score
        ])
        
        return np.array(features).reshape(1, -1)
    
    def calculate_match_score(self, tenant, property):
        """Calculate match score between tenant and property"""
        features = self.prepare_features(tenant, property)
        
        if not self.is_trained:
            # Simple rule-based scoring if model not trained
            return self._rule_based_scoring(tenant, property)
            
        try:
            score = self.model.predict_proba(features)[0][1]  # Probability of good match
            return float(score)
        except Exception as e:
            logger.error(f"Error predicting match score: {e}")
            return self._rule_based_scoring(tenant, property)
    
    def _rule_based_scoring(self, tenant, property):
        """Fallback rule-based scoring"""
        score = 0.0
        
        # Budget compatibility (40% weight)
        if tenant.budget_min and tenant.budget_max:
            if tenant.budget_min <= property.price <= tenant.budget_max:
                score += 0.4
            elif property.price < tenant.budget_min:
                score += 0.2  # Under budget is okay
                
        # Property type (25% weight)
        if tenant.preferred_property_type == property.property_type:
            score += 0.25
            
        # Location (20% weight)
        if tenant.preferred_location and property.location:
            if tenant.preferred_location.lower() in property.location.lower():
                score += 0.2
                
        # Tenant reliability (15% weight)
        score += (tenant.payment_reliability_score / 10.0) * 0.15
        
        return min(score, 1.0)
    
    def find_best_matches(self, tenant, properties, top_k=5):
        """Find best matching properties for a tenant"""
        matches = []
        
        for property in properties:
            if not property.available:
                continue
                
            score = self.calculate_match_score(tenant, property)
            matches.append({
                'property': property,
                'match_score': score,
                'property_id': property.id,
                'property_name': property.name,
                'price': float(property.price),
                'location': property.location
            })
        
        # Sort by match score and return top matches
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        return matches[:top_k]
    
    def train_model(self):
        """Train the allocation model (placeholder for future implementation)"""
        # This would be implemented with historical data
        # For now, we'll use rule-based approach
        self.is_trained = False
        logger.info("Tenant allocation model initialized with rule-based scoring")
