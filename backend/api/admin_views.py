from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Count, Sum, Avg, Q, F
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal
import logging

from .models import Property, Tenant, Payment, MaintenanceRequest, AIModelPrediction, TenantPreference, TenantBehavior

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """
    Get comprehensive dashboard statistics
    """
    try:
        user = request.user
        if not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # User statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        admin_users = User.objects.filter(is_staff=True).count()
        tenant_users = total_users - admin_users
        
        # Property statistics
        total_properties = Property.objects.count()
        occupied_properties = Property.objects.filter(status='occupied').count()
        available_properties = Property.objects.filter(status='available').count()
        occupancy_rate = (occupied_properties / total_properties * 100) if total_properties > 0 else 0
        
        # Financial statistics
        current_month = timezone.now().replace(day=1)
        monthly_revenue = Payment.objects.filter(
            status='paid',
            payment_date__gte=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        last_month_revenue = Payment.objects.filter(
            status='paid',
            payment_date__gte=current_month - timedelta(days=30),
            payment_date__lt=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        revenue_growth = ((monthly_revenue - last_month_revenue) / last_month_revenue * 100) if last_month_revenue > 0 else 0
        
        # Maintenance statistics
        pending_maintenance = MaintenanceRequest.objects.filter(status='pending').count()
        in_progress_maintenance = MaintenanceRequest.objects.filter(status='in_progress').count()
        
        # AI predictions
        high_risk_tenants = Tenant.objects.filter(
            behavior_risk_score__gt=7.0
        ).count()
        
        return Response({
            'totalUsers': total_users,
            'activeUsers': active_users,
            'adminUsers': admin_users,
            'tenantUsers': tenant_users,
            'totalProperties': total_properties,
            'occupiedProperties': occupied_properties,
            'availableProperties': available_properties,
            'occupancyRate': round(occupancy_rate, 1),
            'monthlyRevenue': float(monthly_revenue),
            'revenueGrowth': round(revenue_growth, 1),
            'pendingMaintenance': pending_maintenance,
            'inProgressMaintenance': in_progress_maintenance,
            'highRiskTenants': high_risk_tenants,
        })
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        return Response({
            'error': 'Failed to fetch dashboard statistics',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ai_insights(request):
    """
    Get AI-powered insights and predictions
    """
    try:
        user = request.user
        if not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Payment risk analysis
        high_risk_count = Tenant.objects.filter(
            behavior_risk_score__gt=7.0
        ).count()
        
        medium_risk_count = Tenant.objects.filter(
            behavior_risk_score__gt=4.0,
            behavior_risk_score__lte=7.0
        ).count()
        
        payment_risk = 'High' if high_risk_count > 5 else 'Medium' if high_risk_count > 2 else 'Low'
        
        # Revenue forecasting (simplified)
        current_month = timezone.now().replace(day=1)
        current_revenue = Payment.objects.filter(
            status='paid',
            payment_date__gte=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Predict next month based on trends
        revenue_forecast = float(current_revenue * 1.05)  # 5% growth assumption
        
        # Price optimization analysis
        avg_occupancy = Property.objects.aggregate(
            avg_price=Avg('price'),
            avg_occupancy=Avg(F('price') * 0.8)  # Simplified occupancy calculation
        )
        
        price_optimization = 8  # Simplified AI recommendation
        
        # Tenant performance insights
        top_performers = Tenant.objects.filter(
            payment_reliability_score__gt=8.0
        ).count()
        
        at_risk_tenants = Tenant.objects.filter(
            behavior_risk_score__gt=6.0,
            payment_reliability_score__lt=6.0
        ).count()
        
        # Maintenance predictions
        urgent_maintenance = MaintenanceRequest.objects.filter(
            priority_score__gt=7.0,
            status='pending'
        ).count()
        
        return Response({
            'paymentRisk': payment_risk,
            'highRiskCount': high_risk_count,
            'mediumRiskCount': medium_risk_count,
            'revenueForecast': revenue_forecast,
            'priceOptimization': price_optimization,
            'topPerformers': top_performers,
            'atRiskTenants': at_risk_tenants,
            'urgentMaintenance': urgent_maintenance,
            'recommendations': [
                'Consider increasing rent by 5-8% for high-demand properties',
                'Focus on retaining top-performing tenants',
                'Implement early payment incentives for at-risk tenants',
                'Schedule preventive maintenance for high-priority issues'
            ]
        })
        
    except Exception as e:
        logger.error(f"Error fetching AI insights: {str(e)}")
        return Response({
            'error': 'Failed to fetch AI insights',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_management(request):
    """
    Get comprehensive user management data
    """
    try:
        user = request.user
        if not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.all().annotate(
            user_type=Case(
                When(is_staff=True, then=Value('admin')),
                default=Value('tenant'),
                output_field=CharField(),
            )
        ).values(
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'is_active', 'date_joined', 'last_login'
        )
        
        # Add tenant-specific data
        user_list = []
        for user_data in users:
            user_dict = dict(user_data)
            
            # Get tenant data if applicable
            try:
                tenant = Tenant.objects.get(email=user_data['email'])
                user_dict.update({
                    'user_type': 'tenant',
                    'property_name': tenant.property.name if tenant.property else None,
                    'credit_score': tenant.credit_score,
                    'payment_reliability_score': tenant.payment_reliability_score,
                    'behavior_risk_score': tenant.behavior_risk_score,
                    'late_payment_count': tenant.late_payment_count,
                    'active': tenant.active,
                    'risk_score': int(tenant.behavior_risk_score * 10)  # Convert to percentage
                })
            except Tenant.DoesNotExist:
                if user_data['is_staff']:
                    user_dict.update({
                        'user_type': 'admin',
                        'property_name': 'All Properties',
                        'risk_score': 0
                    })
                else:
                    user_dict.update({
                        'user_type': 'unknown',
                        'property_name': None,
                        'risk_score': 50
                    })
            
            user_list.append(user_dict)
        
        return Response({
            'users': user_list,
            'total_count': len(user_list),
            'active_count': sum(1 for u in user_list if u.get('active', True)),
            'admin_count': sum(1 for u in user_list if u['user_type'] == 'admin'),
            'tenant_count': sum(1 for u in user_list if u['user_type'] == 'tenant')
        })
        
    except Exception as e:
        logger.error(f"Error fetching user management data: {str(e)}")
        return Response({
            'error': 'Failed to fetch user data',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_action(request, user_id, action):
    """
    Perform user management actions (suspend, activate, delete)
    """
    try:
        user = request.user
        if not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        target_user = User.objects.get(id=user_id)
        
        if action == 'suspend':
            target_user.is_active = False
            target_user.save()
            
            # Also suspend tenant record if exists
            try:
                tenant = Tenant.objects.get(email=target_user.email)
                tenant.active = False
                tenant.save()
            except Tenant.DoesNotExist:
                pass
            
            message = 'User suspended successfully'
            
        elif action == 'activate':
            target_user.is_active = True
            target_user.save()
            
            # Also activate tenant record if exists
            try:
                tenant = Tenant.objects.get(email=target_user.email)
                tenant.active = True
                tenant.save()
            except Tenant.DoesNotExist:
                pass
            
            message = 'User activated successfully'
            
        elif action == 'delete':
            # Don't allow deletion of admin users
            if target_user.is_staff:
                return Response({'error': 'Cannot delete admin users'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Delete tenant record first
            try:
                tenant = Tenant.objects.get(email=target_user.email)
                tenant.delete()
            except Tenant.DoesNotExist:
                pass
            
            target_user.delete()
            message = 'User deleted successfully'
            
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': message
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error performing user action: {str(e)}")
        return Response({
            'error': 'Failed to perform user action',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def system_activity(request):
    """
    Get recent system activity logs
    """
    try:
        user = request.user
        if not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Simulated activity data (in production, this would come from actual logs)
        activities = [
            {
                'id': 1,
                'type': 'user',
                'title': 'New User Registration',
                'description': 'John Doe registered as tenant',
                'timestamp': timezone.now() - timedelta(hours=2),
                'status': 'success'
            },
            {
                'id': 2,
                'type': 'payment',
                'title': 'Payment Received',
                'description': 'Monthly rent payment from Jane Smith',
                'timestamp': timezone.now() - timedelta(hours=4),
                'status': 'success'
            },
            {
                'id': 3,
                'type': 'maintenance',
                'title': 'Maintenance Request',
                'description': 'New plumbing issue reported at Property A',
                'timestamp': timezone.now() - timedelta(hours=6),
                'status': 'warning'
            },
            {
                'id': 4,
                'type': 'user',
                'title': 'User Suspended',
                'description': 'Admin suspended user due to policy violation',
                'timestamp': timezone.now() - timedelta(hours=8),
                'status': 'warning'
            },
            {
                'id': 5,
                'type': 'payment',
                'title': 'Late Payment Alert',
                'description': 'AI detected high risk of late payment',
                'timestamp': timezone.now() - timedelta(hours=12),
                'status': 'warning'
            }
        ]
        
        return Response({
            'activities': activities,
            'total_count': len(activities)
        })
        
    except Exception as e:
        logger.error(f"Error fetching system activity: {str(e)}")
        return Response({
            'error': 'Failed to fetch system activity',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def analytics_data(request):
    """
    Get comprehensive analytics data for charts and reports
    """
    try:
        user = request.user
        if not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Revenue trends (last 6 months)
        revenue_data = []
        for i in range(6):
            month_start = (timezone.now() - timedelta(days=30*i)).replace(day=1)
            month_end = month_start + timedelta(days=32)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            
            revenue = Payment.objects.filter(
                status='paid',
                payment_date__gte=month_start,
                payment_date__lte=month_end
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            revenue_data.append({
                'month': month_start.strftime('%b'),
                'revenue': float(revenue)
            })
        
        revenue_data.reverse()
        
        # Occupancy trends
        occupancy_data = []
        for i in range(6):
            month_start = (timezone.now() - timedelta(days=30*i)).replace(day=1)
            month_end = month_start + timedelta(days=32)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            
            total_props = Property.objects.count()
            occupied_props = Property.objects.filter(
                status='occupied',
                updated_at__gte=month_start,
                updated_at__lte=month_end
            ).count()
            
            occupancy_rate = (occupied_props / total_props * 100) if total_props > 0 else 0
            
            occupancy_data.append({
                'month': month_start.strftime('%b'),
                'occupancy': round(occupancy_rate, 1)
            })
        
        occupancy_data.reverse()
        
        # Tenant performance distribution
        tenant_performance = {
            'excellent': Tenant.objects.filter(payment_reliability_score__gt=8.0).count(),
            'good': Tenant.objects.filter(payment_reliability_score__gt=6.0, payment_reliability_score__lte=8.0).count(),
            'average': Tenant.objects.filter(payment_reliability_score__gt=4.0, payment_reliability_score__lte=6.0).count(),
            'poor': Tenant.objects.filter(payment_reliability_score__lte=4.0).count()
        }
        
        # Property performance
        property_performance = []
        for prop in Property.objects.all()[:10]:  # Top 10 properties
            total_revenue = Payment.objects.filter(
                property=prop,
                status='paid'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            property_performance.append({
                'name': prop.name,
                'revenue': float(total_revenue),
                'occupancy': 100 if prop.status == 'occupied' else 0,
                'price': float(prop.price)
            })
        
        return Response({
            'revenue_trends': revenue_data,
            'occupancy_trends': occupancy_data,
            'tenant_performance': tenant_performance,
            'property_performance': property_performance
        })
        
    except Exception as e:
        logger.error(f"Error fetching analytics data: {str(e)}")
        return Response({
            'error': 'Failed to fetch analytics data',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def system_configuration(request):
    """
    Update system configuration settings
    """
    try:
        user = request.user
        if not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        config_data = request.data
        
        # In a real implementation, this would update a configuration model
        # For now, we'll just return success
        
        return Response({
            'success': True,
            'message': 'System configuration updated successfully',
            'updated_settings': config_data
        })
        
    except Exception as e:
        logger.error(f"Error updating system configuration: {str(e)}")
        return Response({
            'error': 'Failed to update system configuration',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
