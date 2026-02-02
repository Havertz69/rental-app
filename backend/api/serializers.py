from rest_framework import serializers
from .models import Property, Tenant, Payment, MaintenanceRequest


class PropertySerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    monthly_rent = serializers.DecimalField(source='price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Property
        fields = ['id', 'name', 'location', 'price', 'bedrooms', 'available', 'status', 'address', 'monthly_rent']

    def get_status(self, obj):
        return 'available' if obj.available else 'occupied'

    def get_address(self, obj):
        return obj.location or ''


class TenantSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Tenant
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'property', 'active', 'status', 'user']

    def get_status(self, obj):
        return 'active' if obj.active else 'inactive'


class PaymentSerializer(serializers.ModelSerializer):
    due_date = serializers.DateField(source='payment_date', read_only=True)
    paid_date = serializers.SerializerMethodField()
    created_date = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'tenant', 'property', 'amount', 'payment_date', 'status', 'created_at', 'due_date', 'paid_date', 'created_date']

    def get_paid_date(self, obj):
        return obj.payment_date if obj.status == 'paid' else None


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField(read_only=True)
    created_date = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = ['id', 'tenant', 'property', 'issue_description', 'status', 'created_at', 'title', 'created_date']

    def get_title(self, obj):
        return obj.issue_description or ''

    def _get_issue_description(self, validated_data):
        desc = validated_data.get('issue_description')
        if desc:
            return desc
        return self.initial_data.get('title', '') or self.initial_data.get('description', '')

    def create(self, validated_data):
        validated_data['issue_description'] = self._get_issue_description(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'issue_description' not in validated_data and ('title' in self.initial_data or 'description' in self.initial_data):
            validated_data['issue_description'] = self.initial_data.get('title', '') or self.initial_data.get('description', '') or instance.issue_description
        return super().update(instance, validated_data)


# Custom token serializer to allow login with email
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # accept either 'email' or 'username' as input
        email = attrs.get('email') or attrs.get('username')
        # if 'email' wasn't provided in serializer fields, check the raw request data
        if not email and hasattr(self, 'context') and self.context.get('request'):
            email = self.context['request'].data.get('email') or email
        password = attrs.get('password')
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
            username = user.get_username()
        except User.DoesNotExist:
            username = email
        # set username in attrs so parent class works
        attrs['username'] = username
        data = super().validate(attrs)
        data['email'] = getattr(self.user, 'email', None)
        data['is_staff'] = getattr(self.user, 'is_staff', False)
        return data
