from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from .models import Property, Tenant, Payment, MaintenanceRequest, Announcement
from .serializers import PropertySerializer, TenantSerializer, PaymentSerializer, MaintenanceRequestSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
import logging

from .permissions import IsOwnerOrAdmin, IsStaffUser, IsSuperAdmin

logger = logging.getLogger(__name__)

class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer

    def get_queryset(self):
        user = self.request.user
        if user and user.is_staff:
            return Property.objects.all().order_by('-id')
        return Property.objects.filter(owner=user).order_by('-id')

    def perform_create(self, serializer):
        # default owner to request.user
        serializer.save(owner=self.request.user)

class TenantViewSet(viewsets.ModelViewSet):
    serializer_class = TenantSerializer

    def get_queryset(self):
        user = self.request.user
        if user and user.is_staff:
            return Tenant.objects.all().order_by('-id')
        # if tenant user, return that tenant record
        return Tenant.objects.filter(user=user).order_by('-id')

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], url_path='create-user', permission_classes=[IsAdminUser])
    def create_user(self, request, pk=None):
        """Admin action: create an associated Django user for this tenant and set password."""
        tenant = self.get_object()
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if tenant.user:
            return Response({'detail': 'User already exists for this tenant.'}, status=status.HTTP_400_BAD_REQUEST)
        email = tenant.email
        password = request.data.get('password') or User.objects.make_random_password()
        user = User.objects.create_user(username=email, email=email, password=password)
        tenant.user = user
        tenant.save()
        # Optionally: send email here
        return Response({'email': email, 'password': password})

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if user and user.is_staff:
            return Payment.objects.all().order_by('-id')
        # payments for tenants that belong to this user
        return Payment.objects.filter(tenant__user=user).order_by('-id')

class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user and user.is_staff:
            return MaintenanceRequest.objects.all().order_by('-id')
        return MaintenanceRequest.objects.filter(tenant__user=user).order_by('-id')

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import EmailTokenObtainPairSerializer

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    # Return authenticated user info
    if request.user and request.user.is_authenticated:
        user = request.user

        # Determine user type based on staff/superuser status and tenant record
        if user.is_superuser:
            user_type = 'super_admin'
        elif user.is_staff:
            user_type = 'admin'
        else:
            user_type = 'tenant'
        
        # Check if user has a tenant record
        try:
            tenant = Tenant.objects.get(email=user.email)
            user_type = 'tenant'
        except Tenant.DoesNotExist:
            if not user.is_staff:
                user_type = 'user'  # Regular user without tenant record
        
        response_data = {
            'email': user.email,
            'full_name': user.get_full_name(),
            'id': user.id,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'user_type': user_type,
        }
        
        # Add tenant-specific data if user is tenant
        if user_type == 'tenant':
            try:
                tenant = Tenant.objects.get(email=user.email)
                response_data.update({
                    'tenant_id': tenant.id,
                    'property_id': tenant.property.id if tenant.property else None,
                    'property_name': tenant.property.name if tenant.property else None,
                    'active': tenant.active,
                    'credit_score': tenant.credit_score,
                    'payment_reliability_score': tenant.payment_reliability_score
                })
            except Tenant.DoesNotExist:
                response_data['tenant_error'] = 'Tenant record not found'
        
        return Response(response_data)
    return Response(
        {
            'email': None,
            'full_name': None,
            'id': None,
            'is_staff': False,
            'is_superuser': False,
            'user_type': None,
        },
        status=status.HTTP_401_UNAUTHORIZED,
    )


@api_view(['POST'])
@permission_classes([IsStaffUser])
def create_tenant_user(request):
    """
    Create a new tenant user and assign to a property
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'property_id']
        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'{field} is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if User.objects.filter(email=data['email']).exists():
            return Response({
                'error': 'User with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if property exists
        try:
            property = Property.objects.get(id=data['property_id'])
        except Property.DoesNotExist:
            return Response({
                'error': 'Property not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        with transaction.atomic():
            # Create Django user linked to this tenant account.
            # Only staff (admins/landlords) can create full tenant users.
            user = User.objects.create_user(
                username=data['email'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                is_staff=False,
                is_superuser=False
            )
            
            # Create tenant record
            tenant = Tenant.objects.create(
                user=user,
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                phone=data.get('phone', ''),
                property=property,
                active=True,
                credit_score=700,  # Default credit score
                payment_reliability_score=8.0,
                behavior_risk_score=2.0,
                tenant_satisfaction_score=7.5,
                late_payment_count=0,
                total_payments_made=0
            )
            
            # Generate JWT tokens so the tenant can log in immediately
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            
            return Response({
                'success': True,
                'message': 'Tenant user created successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': 'tenant',
                    'full_name': f"{user.first_name} {user.last_name}"
                },
                'tenant': {
                    'id': tenant.id,
                    'property_id': tenant.property.id,
                    'property_name': tenant.property.name,
                    'active': tenant.active
                },
                'access': access_token,
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        logger.error(f"Error creating tenant user: {str(e)}")
        return Response({
            'error': 'Failed to create tenant user',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def create_admin_user(request):
    """
    Create a new admin user (superuser)
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'{field} is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if User.objects.filter(email=data['email']).exists():
            return Response({
                'error': 'User with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Create Django superuser.
            # This endpoint is restricted to existing superusers only
            user = User.objects.create_superuser(
                username=data['email'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name']
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            
            return Response({
                'success': True,
                'message': 'Admin user created successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': 'admin',
                    'full_name': f"{user.first_name} {user.last_name}",
                    'is_superuser': user.is_superuser
                },
                'access': access_token,
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        logger.error(f"Error creating admin user: {str(e)}")
        return Response({
            'error': 'Failed to create admin user',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_properties(request):
    """
    Get list of available properties for tenant assignment
    """
    try:
        properties = Property.objects.filter(available=True).values(
            'id', 'name', 'location', 'property_type', 'price', 
            'bedrooms', 'bathrooms', 'square_feet'
        )
        
        return Response({
            'properties': list(properties)
        })
        
    except Exception as e:
        logger.error(f"Error getting available properties: {str(e)}")
        return Response({
            'error': 'Failed to get properties',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Announcement API Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def announcements(request):
    """Get all announcements or create new announcement"""
    from django.utils import timezone
    from django.db import models
    
    if request.method == 'GET':
        # Filter announcements based on user role
        user = request.user
        announcements = Announcement.objects.filter(is_active=True)
        
        # Filter by target audience
        if user.is_staff:
            # Admins can see all announcements
            pass
        else:
            # Tenants only see announcements targeted at them or all users
            announcements = announcements.filter(
                models.Q(target_audience='all') | models.Q(target_audience='tenants')
            )
        
        # Filter out expired announcements
        announcements = announcements.filter(
            models.Q(expires_at__isnull=True) | models.Q(expires_at__gt=timezone.now())
        )
        
        serializer_data = []
        for announcement in announcements:
            serializer_data.append({
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'announcement_type': announcement.announcement_type,
                'target_audience': announcement.target_audience,
                'author': announcement.author.get_full_name() or announcement.author.email,
                'created_at': announcement.created_at,
                'updated_at': announcement.updated_at,
                'expires_at': announcement.expires_at,
            })
        
        return Response(serializer_data)
    
    elif request.method == 'POST':
        # Only admins can create announcements
        if not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        announcement = Announcement.objects.create(
            title=data.get('title'),
            content=data.get('content'),
            announcement_type=data.get('announcement_type', 'general'),
            author=request.user,
            target_audience=data.get('target_audience', 'all'),
            expires_at=data.get('expires_at')
        )
        
        return Response({
            'id': announcement.id,
            'title': announcement.title,
            'content': announcement.content,
            'announcement_type': announcement.announcement_type,
            'target_audience': announcement.target_audience,
            'author': announcement.author.get_full_name() or announcement.author.email,
            'created_at': announcement.created_at,
            'message': 'Announcement created successfully'
        }, status=status.HTTP_201_CREATED)
