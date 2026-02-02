#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Property, Tenant

def create_test_users():
    print("Creating test users...")
    
    # Create admin user
    if not User.objects.filter(email='admin@test.com').exists():
        admin_user = User.objects.create_superuser(
            username='admin@test.com',
            email='admin@test.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print("✅ Created admin user: admin@test.com / admin123")
    else:
        print("ℹ️ Admin user already exists")
    
    # Create test property
    if not Property.objects.filter(name='Test Property').exists():
        property = Property.objects.create(
            name='Test Property',
            location='123 Test Street',
            property_type='apartment',
            price=1000.00,
            bedrooms=2,
            bathrooms=1,
            square_feet=800,
            available=True
        )
        print("✅ Created test property")
    else:
        property = Property.objects.get(name='Test Property')
        print("ℹ️ Test property already exists")
    
    # Create test tenant user
    if not User.objects.filter(email='tenant@test.com').exists():
        tenant_user = User.objects.create_user(
            username='tenant@test.com',
            email='tenant@test.com',
            password='tenant123',
            first_name='Test',
            last_name='Tenant',
            is_staff=False
        )
        
        # Create tenant record
        tenant = Tenant.objects.create(
            user=tenant_user,
            first_name='Test',
            last_name='Tenant',
            email='tenant@test.com',
            phone='555-1234',
            property=property,
            active=True,
            credit_score=700,
            payment_reliability_score=8.0,
            behavior_risk_score=2.0,
            tenant_satisfaction_score=7.5,
            late_payment_count=0,
            total_payments_made=0
        )
        print("✅ Created tenant user: tenant@test.com / tenant123")
    else:
        print("ℹ️ Tenant user already exists")
    
    print("\n🎉 Test users created successfully!")
    print("\n📋 Login Credentials:")
    print("🔐 ADMIN: admin@test.com / admin123")
    print("👤 TENANT: tenant@test.com / tenant123")
    print("\n🌐 Visit: http://localhost:5174")

if __name__ == '__main__':
    create_test_users()
