# Sample data creation script for AI features
# Run this in Django shell: python manage.py shell

from api.models import Property, Tenant, Payment, MaintenanceRequest
from django.contrib.auth.models import User
from decimal import Decimal
from datetime import datetime, timedelta
import random

# Create sample properties
properties_data = [
    {
        'name': 'Modern Downtown Apartment',
        'property_type': 'apartment',
        'location': 'Nairobi CBD',
        'price': Decimal('45000.00'),
        'bedrooms': 2,
        'bathrooms': 1,
        'square_feet': 800,
        'available': True
    },
    {
        'name': 'Student Hostel Block A',
        'property_type': 'hostel',
        'location': 'Kenyatta University',
        'price': Decimal('8000.00'),
        'bedrooms': 1,
        'bathrooms': 4,
        'square_feet': 200,
        'available': True
    },
    {
        'name': 'Luxury Studio',
        'property_type': 'studio',
        'location': 'Westlands',
        'price': Decimal('35000.00'),
        'bedrooms': 1,
        'bathrooms': 1,
        'square_feet': 400,
        'available': True
    }
]

# Create sample tenants
tenants_data = [
    {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john@example.com',
        'phone': '+254712345678',
        'budget_min': Decimal('30000.00'),
        'budget_max': Decimal('50000.00'),
        'preferred_property_type': 'apartment',
        'preferred_location': 'Nairobi',
        'credit_score': 750,
        'payment_reliability_score': 8.5
    },
    {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'email': 'jane@example.com',
        'phone': '+254712345679',
        'budget_min': Decimal('5000.00'),
        'budget_max': Decimal('10000.00'),
        'preferred_property_type': 'hostel',
        'preferred_location': 'Kenyatta',
        'credit_score': 680,
        'payment_reliability_score': 7.2
    }
]

print("Creating sample data...")
created_properties = []
for prop_data in properties_data:
    prop = Property.objects.create(**prop_data)
    created_properties.append(prop)
    print(f"Created property: {prop.name}")

created_tenants = []
for tenant_data in tenants_data:
    tenant = Tenant.objects.create(**tenant_data)
    created_tenants.append(tenant)
    print(f"Created tenant: {tenant.first_name} {tenant.last_name}")

# Create sample payments
for tenant in created_tenants:
    for i in range(3):  # 3 payments per tenant
        payment_date = datetime.now().date() - timedelta(days=random.randint(1, 90))
        due_date = payment_date + timedelta(days=30)
        
        status = random.choice(['paid', 'late', 'pending'])
        if status == 'paid':
            payment_date = due_date - timedelta(days=random.randint(1, 15))
        
        Payment.objects.create(
            tenant=tenant,
            property=random.choice(created_properties),
            amount=Decimal(str(random.randint(5000, 50000))),
            due_date=due_date,
            payment_date=payment_date if status == 'paid' else None,
            status=status
        )

print(f"Created {Payment.objects.count()} sample payments")
print("Sample data creation complete!")

# Test AI features
print("\n=== Testing AI Features ===")

from ai_services.ai_manager import ai_service

# Test tenant recommendations
print("\n1. Testing Tenant Recommendations:")
tenant = created_tenants[0]
recommendations = ai_service.get_tenant_recommendations(tenant)
for i, rec in enumerate(recommendations[:3], 1):
    print(f"  {i}. {rec['property_name']} - Match Score: {rec['match_score']:.2f}")

# Test payment predictions
print("\n2. Testing Payment Predictions:")
payment = Payment.objects.first()
ai_service.update_payment_predictions(payment)
print(f"  Late Payment Probability: {payment.late_payment_probability:.2f}")
print(f"  Predicted Days Overdue: {payment.days_overdue_predicted}")

# Test property pricing
print("\n3. Testing Dynamic Pricing:")
prop = created_properties[0]
ai_service.update_property_pricing(prop)
print(f"  Current Price: KES {prop.price}")
print(f"  Suggested Price: KES {prop.suggested_price}")
print(f"  Demand Score: {prop.demand_score:.2f}")

# Test risk assessment
print("\n4. Testing Risk Assessment:")
ai_service.update_risk_scores(tenant=tenant)
print(f"  Tenant Risk Score: {tenant.behavior_risk_score:.2f}")

ai_service.update_risk_scores(property=prop)
print(f"  Property Risk Score: {prop.risk_score:.2f}")

# Test dashboard analytics
print("\n5. Testing Dashboard Analytics:")
analytics = ai_service.get_dashboard_analytics()
print(f"  Total Properties: {analytics['total_properties']}")
print(f"  Total Tenants: {analytics['total_tenants']}")
print(f"  Average Occupancy: {analytics['average_occupancy_rate']:.2f}")
print(f"  AI Insights: {len(analytics['ai_insights'])} alerts")

print("\n=== AI Features Test Complete ===")
print("You can now test these endpoints in your browser or API client!")
print("\nAPI Endpoints to test:")
print("- GET http://localhost:8000/api/ai/tenant-recommendations/?tenant_id=1")
print("- POST http://localhost:8000/api/ai/update-payment-prediction/")
print("- POST http://localhost:8000/api/ai/update-property-pricing/")
print("- GET http://localhost:8000/api/ai/dashboard-analytics/")
