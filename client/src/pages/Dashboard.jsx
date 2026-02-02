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
import { formatCurrency, formatWholeNumber } from '@/utils/currency';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await api.auth.me();
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
    queryFn: () => api.entities.MaintenanceRequest.filter({}),
    enabled: !!user
  });

  // Defensive defaults: some backend endpoints may return null instead of an empty array.
  const safeProperties = properties ?? [];
  const safeTenants = tenants ?? [];
  const safePayments = payments ?? [];
  const safeMaintenance = maintenance ?? []; 

  // Calculate stats
  const activeTenants = safeTenants.filter(t => t?.status === 'active');
  const occupiedProperties = safeProperties.filter(p => p?.status === 'occupied');
  const occupancyRate = safeProperties.length > 0 
    ? Math.round((occupiedProperties.length / safeProperties.length) * 100) 
    : 0;

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const monthlyRevenue = safePayments
    .filter(p => p?.status === 'paid' && (p.paid_date || p.payment_date) &&
      isWithinInterval(new Date(p.paid_date || p.payment_date), { start: monthStart, end: monthEnd }))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const pendingMaintenance = safeMaintenance.filter(m => 
    m?.status !== 'completed' && m?.status !== 'cancelled'
  );

  // Prepare upcoming payments (tenant/property may be IDs from API)
  const upcomingPayments = safePayments
    .filter(p => p?.status !== 'paid')
    .map(payment => {
      const tenantId = payment.tenant?.id ?? payment.tenant;
      const propertyId = payment.property?.id ?? payment.property;
      const tenant = safeTenants.find(t => t.id === tenantId);
      const property = safeProperties.find(p => p.id === propertyId);
      return {
        ...payment,
        due_date: payment.due_date ?? payment.payment_date,
        tenant_name: tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Unknown',
        property_name: property?.name || 'Unknown'
      };
    })
    .slice(0, 5);

  const maintenanceWithProperty = safeMaintenance.map(m => {
    const propId = m.property?.id ?? m.property;
    return { ...m, property_name: safeProperties.find(p => p.id === propId)?.name || 'Unknown' };
  });

  const recentActivity = [
    ...safePayments.slice(0, 5).map(p => {
      const t = safeTenants.find(t => t.id === (p.tenant?.id ?? p.tenant));
      const prop = safeProperties.find(prop => prop.id === (p.property?.id ?? p.property));
      return {
        id: `payment-${p.id}`,
        type: 'payment',
        title: `${t?.first_name || 'Unknown'} - ${formatCurrency(p.amount)}`,
        description: prop?.name || '',
        date: p.created_date ?? p.payment_date,
        status: p.status
      };
    }),
    ...safeMaintenance.slice(0, 5).map(m => {
      const prop = safeProperties.find(p => p.id === (m.property?.id ?? m.property));
      return {
        id: `maintenance-${m.id}`,
        type: 'maintenance',
        title: m.title ?? m.issue_description ?? '',
        description: prop?.name || '',
        date: m.created_date ?? m.created_at,
        status: m.status
      };
    })
  ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 8);

  const handleMarkPaid = async (paymentId) => {
    await api.entities.Payment.update(paymentId, {
      status: 'paid',
      payment_date: format(new Date(), 'yyyy-MM-dd')
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
            value={formatWholeNumber(monthlyRevenue)}
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
            <PropertyPerformanceChart properties={safeProperties} payments={safePayments} />
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mb-8">
          <FinancialSummary payments={safePayments} properties={safeProperties} paymentMethods={paymentMethods} revenueStats={revenueStats} />
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
                {safeProperties.slice(0, 4).map(property => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">{property.name}</p>
                      <p className="text-sm text-slate-500">{property.address ?? property.location}</p>
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
                {safeProperties.length === 0 && (
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