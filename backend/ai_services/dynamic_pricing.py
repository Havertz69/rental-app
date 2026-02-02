import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import logging

from api.models import Property, Payment, AIModelPrediction

logger = logging.getLogger(__name__)

class DynamicPricingAI:
    """AI-powered dynamic pricing system"""
    
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def prepare_pricing_features(self, property):
        """Prepare features for price prediction"""
        # Calculate occupancy rate
        total_units = Property.objects.filter(
            location=property.location,
            property_type=property.property_type
        ).count()
        
        occupied_units = Property.objects.filter(
            location=property.location,
            property_type=property.property_type,
            available=False
        ).count()
        
        occupancy_rate = occupied_units / total_units if total_units > 0 else 0.5
        
        # Calculate average price in area
        similar_properties = Property.objects.filter(
            location=property.location,
            property_type=property.property_type
        )
        
        if similar_properties.exists():
            avg_price = similar_properties.aggregate(
                models.Avg('price')
            )['price__avg'] or property.price
        else:
            avg_price = property.price
            
        # Time-based factors
        season_factor = self._get_season_factor()
        
        # Property features
        features = [
            float(property.bedrooms),
            float(property.bathrooms),
            float(property.square_feet),
            occupancy_rate,
            float(avg_price),
            season_factor,
            property.demand_score,
            property.risk_score
        ]
        
        return np.array(features).reshape(1, -1)
    
    def _get_season_factor(self):
        """Get seasonal pricing factor"""
        month = datetime.now().month
        
        # Higher demand in summer months (June-August) for student housing
        if month in [6, 7, 8]:
            return 1.2
        elif month in [12, 1, 2]:  # Lower demand in winter
            return 0.9
        else:
            return 1.0
    
    def suggest_optimal_price(self, property):
        """Suggest optimal price for a property"""
        features = self.prepare_pricing_features(property)
        
        if not self.is_trained:
            return self._rule_based_pricing(property)
            
        try:
            suggested_price = self.model.predict(features)[0]
            return float(suggested_price)
        except Exception as e:
            logger.error(f"Error predicting optimal price: {e}")
            return self._rule_based_pricing(property)
    
    def _rule_based_pricing(self, property):
        """Fallback rule-based pricing"""
        base_price = float(property.price)
        
        # Adjust based on occupancy rate
        similar_properties = Property.objects.filter(
            location=property.location,
            property_type=property.property_type
        )
        
        if similar_properties.count() > 1:
            occupied = similar_properties.filter(available=False).count()
            total = similar_properties.count()
            occupancy_rate = occupied / total
            
            if occupancy_rate > 0.9:  # High demand
                base_price *= 1.15
            elif occupancy_rate < 0.5:  # Low demand
                base_price *= 0.9
        
        # Seasonal adjustment
        season_factor = self._get_season_factor()
        base_price *= season_factor
        
        # Property-specific adjustments
        if property.bedrooms > 1:
            base_price *= 1.1  # Multi-bedroom premium
            
        if property.square_feet > 500:
            base_price *= 1.05  # Larger space premium
            
        return round(base_price, 2)
    
    def calculate_demand_score(self, property):
        """Calculate demand score for a property"""
        score = 5.0  # Base score
        
        # Location popularity
        similar_properties = Property.objects.filter(
            location=property.location,
            property_type=property.property_type
        )
        
        if similar_properties.count() > 0:
            occupied = similar_properties.filter(available=False).count()
            total = similar_properties.count()
            occupancy_rate = occupied / total
            
            score += occupancy_rate * 3.0  # Higher occupancy = higher demand
        
        # Price competitiveness
        if similar_properties.exists():
            avg_price = similar_properties.aggregate(
                models.Avg('price')
            )['price__avg'] or property.price
            
            if property.price < avg_price:
                score += 2.0  # Below average price increases demand
            elif property.price > avg_price * 1.2:
                score -= 1.5  # Too expensive reduces demand
        
        # Property features
        score += property.bedrooms * 0.5
        score += property.bathrooms * 0.3
        
        return min(max(score, 0.0), 10.0)  # Clamp between 0-10
    
    def update_property_pricing(self, property):
        """Update AI pricing for a property"""
        suggested_price = self.suggest_optimal_price(property)
        demand_score = self.calculate_demand_score(property)
        
        # Update property record
        property.suggested_price = suggested_price
        property.demand_score = demand_score
        property.save()
        
        # Log prediction for model improvement
        AIModelPrediction.objects.create(
            model_type='price_optimization',
            input_data={
                'property_id': property.id,
                'current_price': float(property.price),
                'bedrooms': property.bedrooms,
                'bathrooms': property.bathrooms,
                'square_feet': property.square_feet,
                'location': property.location,
                'property_type': property.property_type
            },
            prediction_result={
                'suggested_price': suggested_price,
                'demand_score': demand_score,
                'price_difference': suggested_price - float(property.price),
                'price_difference_percent': ((suggested_price - float(property.price)) / float(property.price)) * 100
            },
            confidence_score=0.8
        )
    
    def train_model(self):
        """Train the pricing model"""
        # This would be implemented with historical pricing data
        self.is_trained = False
        logger.info("Dynamic pricing model initialized with rule-based scoring")
