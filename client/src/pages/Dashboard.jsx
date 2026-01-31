import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, Users, CreditCard, Wrench, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import StatCard from '@/components/ui/stat-card.jsx';
import QuickActions from '@/components/dashboard/QuickActions.jsx';
import RecentActivity from '@/components/dashboard/RecentActivity.jsx';
import UpcomingPayments from '@/components/dashboard/UpcomingPayments.jsx';
import MaintenanceOverview from '@/components/dashboard/MaintenanceOverview';
import RevenueChart from '@/components/charts/RevenueChart';
import PropertyPerformanceChart from '@/components/charts/PropertyPerformanceChart';
import FinancialSummary from '@/components/charts/FinancialSummary';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
    const userData = await api.auth.me();
    return api.entities.Property.filter({ owner_id: userData.email });
    },
    enabled: !!user
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.Tenant.filter({ owner_id: userData.email });
    },
    enabled: !!user
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.Payment.filter({ owner_id: userData.email });
    },
    enabled: !!user
  });

  const { data: monthlyRevenueData = [] } = useQuery({
    queryKey: ['monthlyRevenue'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.Payment.getMonthlyRevenue(userData.email, 6);
    },
    enabled: !!user
  });

  const { data: revenueStats = {} } = useQuery({
    queryKey: ['revenueStats'],
    queryFn: async () => {
      const userData = await api.auth.me();
      const currentMonth = new Date();
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      return api.entities.Payment.getRevenueStats(userData.email, startDate, endDate);
    },
    enabled: !!user
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.Payment.getPaymentMethodsBreakdown(userData.email);
    },
    enabled: !!user
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.MaintenanceRequest.filter({ owner_id: userData.email }, '-created_date');
    },
    enabled: !!user
  });

  // Calculate stats
  const activeTenants = tenants.filter(t => t.status === 'active');
  const occupiedProperties = properties.filter(p => p.status === 'occupied');
  const occupancyRate = properties.length > 0 
    ? Math.round((occupiedProperties.length / properties.length) * 100) 
    : 0;

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const monthlyRevenue = payments
    .filter(p => p.status === 'paid' && p.paid_date && 
      isWithinInterval(new Date(p.paid_date), { start: monthStart, end: monthEnd }))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingMaintenance = maintenance.filter(m => 
    m.status !== 'completed' && m.status !== 'cancelled'
  );

  // Prepare upcoming payments
  const upcomingPayments = payments
    .filter(p => p.status !== 'paid')
    .map(payment => {
      const tenant = tenants.find(t => t.id === payment.tenant_id);
      const property = properties.find(p => p.id === payment.property_id);
      return {
        ...payment,
        tenant_name: tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Unknown',
        property_name: property?.name || 'Unknown'
      };
    })
    .slice(0, 5);

  // Prepare maintenance overview
  const maintenanceWithProperty = maintenance.map(m => ({
    ...m,
    property_name: properties.find(p => p.id === m.property_id)?.name || 'Unknown'
  }));

  // Build recent activity
  const recentActivity = [
    ...payments.slice(0, 5).map(p => ({
      id: `payment-${p.id}`,
      type: 'payment',
      title: `${tenants.find(t => t.id === p.tenant_id)?.first_name || 'Unknown'} - KES ${p.amount}`,
      description: properties.find(prop => prop.id === p.property_id)?.name || '',
      date: p.created_date,
      status: p.status
    })),
    ...maintenance.slice(0, 5).map(m => ({
      id: `maintenance-${m.id}`,
      type: 'maintenance',
      title: m.title,
      description: properties.find(p => p.id === m.property_id)?.name || '',
      date: m.created_date,
      status: m.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  const handleMarkPaid = async (paymentId) => {
    await api.entities.Payment.update(paymentId, { 
      status: 'paid', 
      paid_date: format(new Date(), 'yyyy-MM-dd') 
    });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    toast.success('Payment marked as paid');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening with your properties today.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Properties"
            value={properties.length}
            subtitle={`${occupancyRate}% occupied`}
            icon={Building2}
            color="blue"
          />
          <StatCard
            title="Active Tenants"
            value={activeTenants.length}
            subtitle="Across all properties"
            icon={Users}
            color="violet"
          />
          <StatCard
            title="Monthly Revenue"
            value={`KES ${monthlyRevenue.toLocaleString()}`}
            subtitle={format(currentMonth, 'MMMM yyyy')}
            icon={CreditCard}
            color="emerald"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Open Requests"
            value={pendingMaintenance.length}
            subtitle="Maintenance tickets"
            icon={Wrench}
            color="amber"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <QuickActions />
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Analytics & Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={monthlyRevenueData} />
            <PropertyPerformanceChart properties={properties} payments={payments} />
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mb-8">
          <FinancialSummary payments={payments} properties={properties} paymentMethods={paymentMethods} revenueStats={revenueStats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <UpcomingPayments payments={upcomingPayments} onMarkPaid={handleMarkPaid} />
            <RecentActivity activities={recentActivity} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <MaintenanceOverview requests={maintenanceWithProperty} />
            
            {/* Property Overview */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Property Status</h2>
              <div className="space-y-3">
                {properties.slice(0, 4).map(property => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">{property.name}</p>
                      <p className="text-sm text-slate-500">{property.address}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property.status === 'occupied' ? 'bg-emerald-100 text-emerald-700' :
                      property.status === 'available' ? 'bg-blue-100 text-blue-700' :
                      property.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                ))}
                {properties.length === 0 && (
                  <div className="text-center py-6 text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No properties yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}