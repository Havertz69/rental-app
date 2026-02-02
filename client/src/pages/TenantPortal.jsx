import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isPast, differenceInDays } from 'date-fns';
import { 
  Home, FileText, DollarSign, Wrench, MessageSquare, Bell,
  Calendar, Clock, CheckCircle2, AlertTriangle, Send, Plus,
  ChevronRight, User, Building2, Phone, Mail, LogOut, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import TenantLeaseDetails from '@/components/tenant-portal/TenantLeaseDetails';
import TenantPayment from '@/components/tenant-portal/TenantPayment';
import TenantMaintenance from '@/components/tenant-portal/TenantMaintenance';
import TenantMessages from '@/components/tenant-portal/TenantMessages';
import TenantAnnouncements from '@/components/tenant-portal/TenantAnnouncements';

export default function TenantPortal() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await api.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: tenantProfile, isLoading: loadingTenant } = useQuery({
    queryKey: ['tenant-profile', user?.email],
    queryFn: async () => {
      const tenants = await api.entities.Tenant.filter({ email: user.email, status: 'active' });
      return tenants[0] || null;
    },
    enabled: !!user?.email
  });

  const propertyId = tenantProfile?.property ?? tenantProfile?.property_id;
  const { data: property } = useQuery({
    queryKey: ['tenant-property', propertyId],
    queryFn: () => api.entities.Property.filter({ id: propertyId }),
    enabled: !!propertyId,
    select: (data) => Array.isArray(data) ? data[0] : data
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['tenant-payments', tenantProfile?.id],
    queryFn: () => api.entities.Payment.filter({ tenant: tenantProfile.id }),
    enabled: !!tenantProfile?.id
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['tenant-maintenance', tenantProfile?.id],
    queryFn: () => api.entities.MaintenanceRequest.filter({ tenant: tenantProfile.id }),
    enabled: !!tenantProfile?.id
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['tenant-announcements', propertyId],
    queryFn: async () => {
      const allAnnouncements = await api.entities.Announcement.list();
      return allAnnouncements.filter(a =>
        !a.property_id || a.property_id === propertyId
      );
    },
    enabled: !!propertyId
  });

  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['tenant-unread-messages', tenantProfile?.id],
    queryFn: async () => {
      const messages = await api.entities.Message.filter({ 
        tenant_id: tenantProfile.id,
        sender_role: 'landlord',
        read: false
      });
      return messages;
    },
    enabled: !!tenantProfile?.id
  });

  if (loadingTenant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!tenantProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <Home className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">No Active Lease Found</h1>
          <p className="text-slate-500 mb-6">
            We couldn't find an active lease associated with your email ({user?.email}). 
            Please contact your property manager if you believe this is an error.
          </p>
          <Button variant="outline" onClick={() => api.auth.logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'late');
  const activeMaintenanceCount = maintenanceRequests.filter(m => 
    m.status !== 'completed' && m.status !== 'cancelled'
  ).length;
  const urgentAnnouncements = announcements.filter(a => a.priority === 'urgent');
  const leaseEndDays = tenantProfile.lease_end ? 
    differenceInDays(new Date(tenantProfile.lease_end), new Date()) : null;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'lease', label: 'Lease', icon: FileText },
    { id: 'payments', label: 'Payments', icon: DollarSign, badge: pendingPayments.length },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, badge: activeMaintenanceCount },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages.length },
    { id: 'announcements', label: 'Announcements', icon: Bell, badge: urgentAnnouncements.length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900">Tenant Portal</h1>
            <p className="text-xs text-slate-500">{property?.name}</p>
          </div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <nav className="p-4 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                    activeTab === item.id 
                      ? 'bg-violet-50 text-violet-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <Badge className="bg-violet-500">{item.badge}</Badge>
                  )}
                </button>
              ))}
              <button
                onClick={() => api.auth.logout()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 min-h-screen bg-white border-r border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Tenant Portal</h1>
              <p className="text-sm text-slate-500">{property?.name}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              {tenantProfile.profile_image ? (
                <img src={tenantProfile.profile_image} alt="" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                  <User className="w-6 h-6 text-violet-500" />
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">
                  {tenantProfile.first_name} {tenantProfile.last_name}
                </p>
                <p className="text-sm text-slate-500">Unit {tenantProfile.unit_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/20' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <Badge className={activeTab === item.id ? 'bg-white/20 text-white' : 'bg-violet-500 text-white'}>
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 mt-6">
            <button
              onClick={() => api.auth.logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Welcome back, {tenantProfile.first_name}!
                </h2>
                <p className="text-slate-500">Here's an overview of your tenancy</p>
              </div>

              {/* Alerts */}
              {(urgentAnnouncements.length > 0 || leaseEndDays !== null && leaseEndDays < 60) && (
                <div className="space-y-3">
                  {urgentAnnouncements.map(a => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-rose-900">{a.title}</p>
                        <p className="text-sm text-rose-700">{a.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {leaseEndDays !== null && leaseEndDays < 60 && leaseEndDays > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900">Lease Expiring Soon</p>
                        <p className="text-sm text-amber-700">
                          Your lease expires in {leaseEndDays} days. Contact your property manager to discuss renewal.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">${tenantProfile.monthly_rent?.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">Monthly Rent</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{pendingPayments.length}</p>
                  <p className="text-sm text-slate-500">Pending Payments</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                    <Wrench className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{activeMaintenanceCount}</p>
                  <p className="text-sm text-slate-500">Active Requests</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
                    <Calendar className="w-5 h-5 text-violet-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {leaseEndDays !== null ? (leaseEndDays > 0 ? leaseEndDays : 'Expired') : 'N/A'}
                  </p>
                  <p className="text-sm text-slate-500">Days Until Lease End</p>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Wrench className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Submit Maintenance Request</h3>
                  <p className="text-sm text-slate-500">Report an issue with your unit</p>
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">View Payment History</h3>
                  <p className="text-sm text-slate-500">Check your payment records</p>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Contact Property Manager</h3>
                  <p className="text-sm text-slate-500">Send a message directly</p>
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {payments.slice(0, 3).map(payment => (
                    <div key={payment.id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        payment.status === 'paid' ? 'bg-emerald-100' : 'bg-amber-100'
                      }`}>
                        <DollarSign className={`w-5 h-5 ${
                          payment.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {payment.payment_type === 'rent' ? 'Rent Payment' : payment.payment_type}
                        </p>
                        <p className="text-sm text-slate-500">
                          {payment.due_date ? format(new Date(payment.due_date), 'MMM d, yyyy') : 'No due date'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">${payment.amount?.toLocaleString()}</p>
                        <Badge className={payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {payments.length === 0 && (
                    <p className="text-center text-slate-500 py-4">No payment history yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lease' && (
            <TenantLeaseDetails tenant={tenantProfile} property={property} />
          )}

          {activeTab === 'payments' && (
            <TenantPayment tenant={tenantProfile} payments={payments} />
          )}

          {activeTab === 'maintenance' && (
            <TenantMaintenance tenant={tenantProfile} property={property} requests={maintenanceRequests} />
          )}

          {activeTab === 'messages' && (
            <TenantMessages tenant={tenantProfile} property={property} />
          )}

          {activeTab === 'announcements' && (
            <TenantAnnouncements announcements={announcements} />
          )}
        </main>
      </div>
    </div>
  );
}