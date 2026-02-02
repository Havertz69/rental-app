from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from api.models import Property, Tenant, Payment
from ai_services.ai_manager import ai_service

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_recommendations(request):
    """Get property recommendations for a tenant"""
    tenant_id = request.GET.get('tenant_id')
    
    if not tenant_id:
        return Response({'error': 'tenant_id parameter required'}, status=400)
    
    try:
        tenant = get_object_or_404(Tenant, id=tenant_id)
        properties = Property.objects.filter(available=True)
        
        recommendations = ai_service.get_tenant_recommendations(tenant, properties)
        
        return Response({
            'tenant_id': tenant_id,
            'recommendations': recommendations,
            'total_matches': len(recommendations)
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_payment_prediction(request):
    """Update payment prediction for a specific payment"""
    payment_id = request.data.get('payment_id')
    
    if not payment_id:
        return Response({'error': 'payment_id required'}, status=400)
    
    try:
        payment = get_object_or_404(Payment, id=payment_id)
        ai_service.update_payment_predictions(payment)
        
        return Response({
            'payment_id': payment_id,
            'late_payment_probability': payment.late_payment_probability,
            'days_overdue_predicted': payment.days_overdue_predicted,
            'payment_risk_score': payment.payment_risk_score
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_property_pricing(request):
    """Update AI pricing for a property"""
    property_id = request.data.get('property_id')
    
    if not property_id:
        return Response({'error': 'property_id required'}, status=400)
    
    try:
        property = get_object_or_404(Property, id=property_id)
        ai_service.update_property_pricing(property)
        
        return Response({
            'property_id': property_id,
            'current_price': float(property.price),
            'suggested_price': float(property.suggested_price),
            'demand_score': property.demand_score,
            'price_difference': float(property.suggested_price - property.price),
            'price_difference_percent': ((property.suggested_price - property.price) / property.price) * 100
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_property_forecasts(request):
    """Update occupancy and revenue forecasts for a property"""
    property_id = request.data.get('property_id')
    
    if not property_id:
        return Response({'error': 'property_id required'}, status=400)
    
    try:
        property = get_object_or_404(Property, id=property_id)
        forecasts = ai_service.update_property_forecasts(property)
        
        return Response({
            'property_id': property_id,
            'forecasts': forecasts
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_risk_scores(request):
    """Update risk scores for tenant or property"""
    tenant_id = request.data.get('tenant_id')
    property_id = request.data.get('property_id')
    
    if not tenant_id and not property_id:
        return Response({'error': 'tenant_id or property_id required'}, status=400)
    
    try:
        result = {}
        
        if tenant_id:
            tenant = get_object_or_404(Tenant, id=tenant_id)
            ai_service.update_risk_scores(tenant=tenant)
            result['tenant'] = {
                'tenant_id': tenant_id,
                'risk_score': tenant.behavior_risk_score
            }
        
        if property_id:
            property = get_object_or_404(Property, id=property_id)
            ai_service.update_risk_scores(property=property)
            result['property'] = {
                'property_id': property_id,
                'risk_score': property.risk_score
            }
        
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request):
    """Get comprehensive AI-powered dashboard analytics"""
    try:
        analytics = ai_service.get_dashboard_analytics()
        return Response(analytics)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_risk_assessment(request):
    """Get detailed risk assessment for a tenant"""
    tenant_id = request.GET.get('tenant_id')
    
    if not tenant_id:
        return Response({'error': 'tenant_id parameter required'}, status=400)
    
    try:
        tenant = get_object_or_404(Tenant, id=tenant_id)
        risk_assessment = ai_service.risk_assessment.calculate_tenant_risk_score(tenant)
        
        return Response({
            'tenant_id': tenant_id,
            'risk_assessment': risk_assessment
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def property_risk_assessment(request):
    """Get detailed risk assessment for a property"""
    property_id = request.GET.get('property_id')
    
    if not property_id:
        return Response({'error': 'property_id parameter required'}, status=400)
    
    try:
        property = get_object_or_404(Property, id=property_id)
        risk_assessment = ai_service.risk_assessment.calculate_property_risk_score(property)
        
        return Response({
            'property_id': property_id,
            'risk_assessment': risk_assessment
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)
