from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Property, Tenant, Payment, MaintenanceRequest
from .serializers import PropertySerializer, TenantSerializer, PaymentSerializer, MaintenanceRequestSerializer

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().order_by('-id')
    serializer_class = PropertySerializer

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all().order_by('-id')
    serializer_class = TenantSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-id')
    serializer_class = PaymentSerializer

class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all().order_by('-id')
    serializer_class = MaintenanceRequestSerializer

@api_view(['GET'])
def me(request):
    # Simple stub: return authenticated user info if available; expand with real auth logic
    if request.user and request.user.is_authenticated:
        return Response({'email': request.user.email, 'full_name': request.user.get_full_name()})
    return Response({'email': None, 'full_name': None})
