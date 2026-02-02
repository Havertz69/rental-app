import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import logging

from api.models import Property, Payment, Tenant, AIModelPrediction

logger = logging.getLogger(__name__)

class OccupancyForecastAI:
    """AI-powered occupancy forecasting system"""
    
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def prepare_occupancy_features(self, property, months_ahead=1):
        """Prepare features for occupancy prediction"""
        # Historical occupancy data
        current_occupancy = property.occupancy_rate
        
        # Calculate recent payment trends (indicator of tenant satisfaction)
        recent_payments = Payment.objects.filter(
            property=property,
            created_at__gte=datetime.now() - timedelta(days=90)
        )
        
        if recent_payments.exists():
            on_time_payments = recent_payments.filter(status='paid').count()
            payment_performance = on_time_payments / recent_payments.count()
        else:
            payment_performance = 0.5
        
        # Property characteristics
        features = [
            current_occupancy,
            payment_performance,
            float(property.price),
            float(property.bedrooms),
            float(property.bathrooms),
            property.demand_score,
            property.risk_score,
            float(months_ahead),
            datetime.now().month / 12.0,  # Seasonality
        ]
        
        return np.array(features).reshape(1, -1)
    
    def forecast_occupancy(self, property, months_ahead=1):
        """Forecast occupancy rate for future months"""
        features = self.prepare_occupancy_features(property, months_ahead)
        
        if not self.is_trained:
            return self._rule_based_forecast(property, months_ahead)
            
        try:
            predicted_occupancy = self.model.predict(features)[0]
            return float(max(0.0, min(1.0, predicted_occupancy)))  # Clamp between 0-1
        except Exception as e:
            logger.error(f"Error forecasting occupancy: {e}")
            return self._rule_based_forecast(property, months_ahead)
    
    def _rule_based_forecast(self, property, months_ahead):
        """Fallback rule-based forecasting"""
        current_occupancy = property.occupancy_rate
        
        # Base trend based on demand score
        if property.demand_score > 7.0:
            trend = 0.05 * months_ahead  # Increasing occupancy
        elif property.demand_score < 4.0:
            trend = -0.03 * months_ahead  # Decreasing occupancy
        else:
            trend = 0.0  # Stable
        
        # Seasonal adjustment
        current_month = datetime.now().month
        future_month = (current_month + months_ahead - 1) % 12 + 1
        
        if future_month in [6, 7, 8]:  # Summer months
            seasonal_factor = 1.1
        elif future_month in [12, 1, 2]:  # Winter months
            seasonal_factor = 0.9
        else:
            seasonal_factor = 1.0
        
        # Price competitiveness
        similar_properties = Property.objects.filter(
            location=property.location,
            property_type=property.property_type
        )
        
        price_factor = 1.0
        if similar_properties.exists():
            avg_price = similar_properties.aggregate(
                models.Avg('price')
            )['price__avg'] or property.price
            
            if property.price < avg_price * 0.9:
                price_factor = 1.05  # Competitive price
            elif property.price > avg_price * 1.1:
                price_factor = 0.95  # Expensive
        
        predicted_occupancy = current_occupancy + trend
        predicted_occupancy *= seasonal_factor * price_factor
        
        return max(0.0, min(1.0, predicted_occupancy))
    
    def forecast_revenue(self, property, months_ahead=1):
        """Forecast rental income for future months"""
        predicted_occupancy = self.forecast_occupancy(property, months_ahead)
        monthly_revenue = float(property.price) * predicted_occupancy
        
        # Add seasonal pricing adjustments
        current_month = datetime.now().month
        future_month = (current_month + months_ahead - 1) % 12 + 1
        
        if future_month in [6, 7, 8]:  # Premium summer pricing
            monthly_revenue *= 1.1
        elif future_month in [12, 1, 2]:  # Discount winter pricing
            monthly_revenue *= 0.95
        
        return {
            'predicted_occupancy_rate': predicted_occupancy,
            'predicted_monthly_revenue': monthly_revenue,
            'predicted_annual_revenue': monthly_revenue * 12,
            'months_ahead': months_ahead
        }
    
    def update_property_forecasts(self, property):
        """Update AI forecasts for a property"""
        forecasts = {}
        
        # Generate forecasts for next 6 months
        for months in [1, 3, 6]:
            forecast = self.forecast_revenue(property, months)
            forecasts[f'{months}_month'] = forecast
        
        # Log predictions for model improvement
        AIModelPrediction.objects.create(
            model_type='occupancy_forecast',
            input_data={
                'property_id': property.id,
                'current_occupancy': property.occupancy_rate,
                'current_price': float(property.price),
                'demand_score': property.demand_score
            },
            prediction_result=forecasts,
            confidence_score=0.75
        )
        
        return forecasts
    
    def train_model(self):
        """Train the occupancy forecasting model"""
        # This would be implemented with historical occupancy data
        self.is_trained = False
        logger.info("Occupancy forecasting model initialized with rule-based scoring")
