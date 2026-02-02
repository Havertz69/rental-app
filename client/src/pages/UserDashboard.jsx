import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  Home, Calendar, Bell, MessageSquare, User, Settings, 
  LogOut, Bed, Bath, Square, MapPin, Phone, Mail,
  CreditCard, FileText, HelpCircle, ChevronRight,
  Building2, Users, DollarSign, Wrench, AlertCircle,
  CheckCircle, Clock, TrendingUp, Star
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/currency';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await api.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: tenantData } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: async () => {
      const userData = await api.auth.me();
      // Get tenant profile for current user
      const tenants = await api.entities.Tenant.filter({ email: userData.email });
      return tenants[0] || null;
    },
    enabled: !!user
  });

  const { data: property } = useQuery({
    queryKey: ['my-property'],
    queryFn: async () => {
      if (!tenantData?.property) return null;
      return await api.entities.Property.get(tenantData.property);
    },
    enabled: !!tenantData?.property
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['my-payments'],
    queryFn: async () => {
      if (!tenantData) return [];
      return await api.entities.Payment.filter({ tenant: tenantData.id });
    },
    enabled: !!tenantData
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ['my-maintenance'],
    queryFn: async () => {
      if (!tenantData) return [];
      return await api.entities.MaintenanceRequest.filter({ tenant: tenantData.id });
    },
    enabled: !!tenantData
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['user-announcements'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('authTokens');
        const response = await fetch('http://localhost:8000/api/announcements/', {
          headers: {
            'Authorization': `Bearer ${JSON.parse(token)?.access}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Announcements endpoint not available');
        }
        return response.json();
      } catch (error) {
        console.log('Announcements API not available, using mock data');
        return [];
      }
    },
    enabled: true
  });

  const handleLogout = () => {
    // Use AuthContext logout
    window.location.href = '/login';
  };

  const upcomingPayments = payments?.filter(p => p.status !== 'paid') || [];
  const recentMaintenance = maintenance?.filter(m => m.status !== 'completed') || [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">My Portal</h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    User
                  </span>
                </div>
                <p className="text-sm text-gray-500">Welcome back, {user?.full_name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="w-5 h-5" />
                {announcements?.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'room', label: 'My Room', icon: Building2 },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'announcements', label: 'Announcements', icon: Bell },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
                  </h2>
                  <p className="text-blue-100">
                    {property ? `Living at ${property.name}` : 'Find your perfect space'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1">
                    {format(new Date(), 'MMMM d')}
                  </div>
                  <p className="text-blue-100 text-sm">{format(new Date(), 'EEEE')}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Your Space</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{property?.name || 'Not Assigned'}</h3>
                <p className="text-gray-600 mt-1">
                  {property?.location || 'No location specified'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Monthly Rent</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {property ? formatCurrency(property.price) : 'N/A'}
                </h3>
                <p className="text-gray-600 mt-1">Due on 1st of each month</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Bell className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">Updates</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{announcements?.length || 0}</h3>
                <p className="text-gray-600 mt-1">New announcements</p>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {upcomingPayments?.slice(0, 3).map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <CreditCard className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Payment Due</p>
                        <p className="text-sm text-gray-500">
                          {payment.due_date ? format(new Date(payment.due_date), 'MMM d') : 'No due date'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                      <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    </div>
                  </motion.div>
                ))}
                {(!upcomingPayments || upcomingPayments.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>All caught up!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Room Details Tab */}
        {activeTab === 'room' && property && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              {/* Property Image */}
              <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-white" />
                </div>
              </div>
              
              {/* Property Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{property.name}</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{property.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Bed className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Bedrooms</p>
                      <p className="font-medium text-gray-900">{property.bedrooms}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Bath className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Bathrooms</p>
                      <p className="font-medium text-gray-900">{property.bathrooms || 1}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Square className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Size</p>
                      <p className="font-medium text-gray-900">{property.square_feet || 0} sq ft</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Rent Details</h3>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(property.price)}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Monthly rent payment due on the 1st of each month
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment History</h3>
              
              <div className="space-y-4">
                {payments?.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          payment.status === 'paid' 
                            ? 'bg-green-100' 
                            : payment.status === 'late'
                            ? 'bg-red-100'
                            : 'bg-amber-100'
                        }`}>
                          {payment.status === 'paid' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : payment.status === 'late' ? (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{payment.status}</p>
                          <p className="text-sm text-gray-500">
                            {payment.payment_date 
                              ? format(new Date(payment.payment_date), 'MMM d, yyyy')
                              : 'No date'
                            }
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                    </div>
                  </motion.div>
                ))}
                {(!payments || payments.length === 0) && (
                  <div className="text-center py-12 text-gray-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-2" />
                    <p>No payment history available</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Maintenance Requests</h3>
              
              <div className="space-y-4">
                {recentMaintenance?.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity:1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            request.status === 'completed'
                              ? 'bg-green-100'
                              : request.status === 'in_progress'
                              ? 'bg-blue-100'
                              : 'bg-amber-100'
                          }`}>
                            <Wrench className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {request.status.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.created_at 
                                ? format(new Date(request.created_at), 'MMM d, yyyy')
                                : 'No date'
                              }
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2">{request.issue_description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {(!recentMaintenance || recentMaintenance.length === 0) && (
                  <div className="text-center py-12 text-gray-400">
                    <Wrench className="w-12 h-12 mx-auto mb-2" />
                    <p>No maintenance requests</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Announcements</h3>
              
              <div className="space-y-4">
                {announcements?.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-blue-200 bg-blue-50 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        announcement.announcement_type === 'emergency' ? 'bg-red-100' :
                        announcement.announcement_type === 'maintenance' ? 'bg-yellow-100' :
                        announcement.announcement_type === 'payment' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        <Bell className={`w-4 h-4 ${
                          announcement.announcement_type === 'emergency' ? 'text-red-600' :
                          announcement.announcement_type === 'maintenance' ? 'text-yellow-600' :
                          announcement.announcement_type === 'payment' ? 'text-green-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            announcement.announcement_type === 'emergency' ? 'bg-red-100 text-red-800' :
                            announcement.announcement_type === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            announcement.announcement_type === 'payment' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {announcement.announcement_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>By: {announcement.author}</span>
                          <span>{announcement.created_at 
                            ? format(new Date(announcement.created_at), 'MMM d, yyyy')
                            : 'No date'
                          }</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {(!announcements || announcements.length === 0) && (
                  <div className="text-center py-12 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-2" />
                    <p>No announcements at this time</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
    </ErrorBoundary>
  );
};

export default UserDashboard;
