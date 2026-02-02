import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import logging

from api.models import Tenant, Payment, AIModelPrediction

logger = logging.getLogger(__name__)

class PaymentPredictionAI:
    """AI-powered payment prediction system"""
    
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def prepare_payment_features(self, tenant, payment):
        """Prepare features for payment prediction"""
        # Tenant historical behavior
        total_payments = Payment.objects.filter(tenant=tenant).count()
        late_payments = Payment.objects.filter(
            tenant=tenant, 
            status__in=['late', 'overdue']
        ).count()
        
        # Calculate payment reliability
        if total_payments > 0:
            on_time_rate = (total_payments - late_payments) / total_payments
        else:
            on_time_rate = 0.5  # Default for new tenants
            
        # Amount relative to tenant's typical payments
        avg_payment = Payment.objects.filter(
            tenant=tenant, 
            status='paid'
        ).aggregate(models.Avg('amount'))['amount__avg'] or payment.amount
        
        amount_ratio = float(payment.amount) / float(avg_payment)
        
        # Time-based features
        days_until_due = (payment.due_date - datetime.now().date()).days
        
        features = [
            float(total_payments),
            float(late_payments),
            on_time_rate,
            tenant.credit_score,
            tenant.payment_reliability_score,
            tenant.behavior_risk_score,
            amount_ratio,
            float(days_until_due),
            float(payment.amount)
        ]
        
        return np.array(features).reshape(1, -1)
    
    def predict_late_payment(self, tenant, payment):
        """Predict probability of late payment"""
        features = self.prepare_payment_features(tenant, payment)
        
        if not self.is_trained:
            return self._rule_based_prediction(tenant, payment)
            
        try:
            probability = self.model.predict_proba(features)[0][1]
            return float(probability)
        except Exception as e:
            logger.error(f"Error predicting late payment: {e}")
            return self._rule_based_prediction(tenant, payment)
    
    def _rule_based_prediction(self, tenant, payment):
        """Fallback rule-based prediction"""
        probability = 0.0
        
        # Historical payment behavior (40% weight)
        total_payments = Payment.objects.filter(tenant=tenant).count()
        if total_payments > 0:
            late_payments = Payment.objects.filter(
                tenant=tenant, 
                status__in=['late', 'overdue']
            ).count()
            late_rate = late_payments / total_payments
            probability += late_rate * 0.4
        else:
            probability += 0.2  # Default risk for new tenants
            
        # Credit score (25% weight)
        if tenant.credit_score > 700:
            probability += 0.05
        elif tenant.credit_score > 600:
            probability += 0.15
        else:
            probability += 0.25
            
        # Payment reliability score (20% weight)
        probability += (1.0 - tenant.payment_reliability_score / 10.0) * 0.2
        
        # Amount relative to typical (15% weight)
        avg_payment = Payment.objects.filter(
            tenant=tenant, 
            status='paid'
        ).aggregate(models.Avg('amount'))['amount__avg'] or payment.amount
        
        if float(payment.amount) > float(avg_payment) * 1.2:
            probability += 0.15
            
        return min(probability, 1.0)
    
    def predict_days_overdue(self, tenant, payment):
        """Predict how many days payment will be overdue"""
        late_prob = self.predict_late_payment(tenant, payment)
        
        if late_prob < 0.3:
            return 0
        elif late_prob < 0.6:
            return 7  # 1 week
        elif late_prob < 0.8:
            return 14  # 2 weeks
        else:
            return 30  # 1 month
    
    def update_payment_predictions(self, payment):
        """Update AI predictions for a payment"""
        if not payment.tenant:
            return
            
        late_prob = self.predict_late_payment(payment.tenant, payment)
        days_overdue = self.predict_days_overdue(payment.tenant, payment)
        risk_score = late_prob * 10.0  # Scale to 0-10
        
        # Update payment record
        payment.late_payment_probability = late_prob
        payment.days_overdue_predicted = days_overdue
        payment.payment_risk_score = risk_score
        payment.save()
        
        # Log prediction for model improvement
        AIModelPrediction.objects.create(
            model_type='payment_prediction',
            input_data={
                'tenant_id': payment.tenant.id,
                'payment_id': payment.id,
                'amount': float(payment.amount),
                'due_date': payment.due_date.isoformat()
            },
            prediction_result={
                'late_payment_probability': late_prob,
                'days_overdue_predicted': days_overdue,
                'risk_score': risk_score
            },
            confidence_score=1.0 - abs(late_prob - 0.5)  # Higher confidence for extreme predictions
        )
    
    def train_model(self):
        """Train the payment prediction model"""
        # This would be implemented with historical payment data
        self.is_trained = False
        logger.info("Payment prediction model initialized with rule-based scoring")
