import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorBoundary from '../components/ErrorBoundary';
import { formatCurrency } from '../utils/currency';
import { api } from '../api/apiClient';
import { format } from 'date-fns';
import { 
  Users, Building2, CreditCard, Wrench, Shield, BarChart3, Settings,
  Bell, Search, Filter, Plus, Edit, Trash2, Eye, Download, Upload,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock,
  Calendar, DollarSign, Home, FileText, Activity, Zap, Lock,
  Database, Cpu, HardDrive, Wifi, Camera, Key, LogOut,
  Menu, X, ChevronDown, ChevronRight, RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    announcement_type: 'general',
    target_audience: 'all',
    expires_at: ''
  });
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    user_type: 'tenant',
    password: '',
    confirm_password: '',
    phone: '',
    property_id: '',
    budget_min: '',
    budget_max: '',
    preferred_property_type: 'apartment',
    preferred_location: ''
  });
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [newProperty, setNewProperty] = useState({
    name: '',
    property_type: 'apartment',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    description: '',
    amenities: ''
  });
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard/stats/');
        if (!response.ok) {
          throw new Error('Stats endpoint not available');
        }
        return response.json();
      } catch (error) {
        console.log('Stats API not available, using mock data');
        return {
          totalUsers: 0,
          totalProperties: 0,
          totalRevenue: 0,
          activeTenants: 0
        };
      }
    }
  });

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const tokens = localStorage.getItem('authTokens');
        if (!tokens) return [];
        
        const response = await fetch('http://localhost:8000/api/users/', {
          headers: {
            'Authorization': `Bearer ${JSON.parse(tokens).access}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Users endpoint not available');
        }
        return response.json();
      } catch (error) {
        console.log('Users API not available, using mock data');
        return [];
      }
    }
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      try {
        const tokens = localStorage.getItem('authTokens');
        if (!tokens) return [];
        
        const response = await fetch('http://localhost:8000/api/properties/', {
          headers: {
            'Authorization': `Bearer ${JSON.parse(tokens).access}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
        return [];
      } catch (error) {
        console.log('Properties API not available, using mock data');
        return [];
      }
    }
  });

  const { data: recentActivity = [], isLoading: activityLoading, error: activityError } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: async () => {
      try {
        const response = await fetch('http://localhost:8000/api/activity/recent/');
        if (!response.ok) {
          throw new Error('Activity endpoint not available');
        }
        return response.json();
      } catch (error) {
        console.log('Activity API not available, using mock data');
        return [];
      }
    }
  });

  const { data: aiInsights, isLoading: aiLoading, error: aiError } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      try {
        const response = await fetch('http://localhost:8000/api/ai/insights/');
        if (!response.ok) {
          throw new Error('AI insights endpoint not available');
        }
        return response.json();
      } catch (error) {
        console.log('AI insights API not available, using mock data');
        return {
          recommendations: [],
          predictions: [],
          alerts: []
        };
      }
    }
  });

  // Fetch announcements
  const { data: announcementsData = [], refetch: refetchAnnouncements } = useQuery({
    queryKey: ['announcements'],
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
    }
  });

  // Create announcement function
  const createAnnouncement = async () => {
    try {
      const token = localStorage.getItem('authTokens');
      const response = await fetch('http://localhost:8000/api/announcements/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(token)?.access}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAnnouncement)
      });
      
      if (response.ok) {
        setShowAnnouncementModal(false);
        setNewAnnouncement({
          title: '',
          content: '',
          announcement_type: 'general',
          target_audience: 'all',
          expires_at: ''
        });
        refetchAnnouncements();
        alert('Announcement created successfully!');
      } else {
        alert('Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Error creating announcement');
    }
  };

  // Create user function
  const createUser = async () => {
    if (newUser.password !== newUser.confirm_password) {
      alert('Passwords do not match');
      return;
    }

    if (newUser.user_type === 'tenant' && !newUser.property_id) {
      alert('Please select a property for the tenant');
      return;
    }

    try {
      const token = localStorage.getItem('authTokens');
      const endpoint = newUser.user_type === 'admin' ? '/api/auth/create-admin/' : '/api/auth/create-tenant/';
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(token)?.access}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          password: newUser.password,
          phone: newUser.phone,
          ...(newUser.user_type === 'tenant' && {
            property_id: newUser.property_id,
            budget_min: newUser.budget_min || null,
            budget_max: newUser.budget_max || null,
            preferred_property_type: newUser.preferred_property_type,
            preferred_location: newUser.preferred_location
          })
        })
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setNewUser({
          first_name: '',
          last_name: '',
          email: '',
          user_type: 'tenant',
          password: '',
          confirm_password: '',
          phone: '',
          property_id: '',
          budget_min: '',
          budget_max: '',
          preferred_property_type: 'apartment',
          preferred_location: ''
        });
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        alert('User created successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    }
  };

  // Create property function
  const createProperty = async () => {
    try {
      const token = localStorage.getItem('authTokens');
      const response = await fetch('http://localhost:8000/api/properties/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(token)?.access}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newProperty.name,
          property_type: newProperty.property_type,
          location: newProperty.location,
          price: parseFloat(newProperty.price),
          bedrooms: parseInt(newProperty.bedrooms),
          bathrooms: parseInt(newProperty.bathrooms),
          square_feet: parseInt(newProperty.square_feet),
          description: newProperty.description,
          amenities: newProperty.amenities.split(',').map(a => a.trim()).filter(a => a)
        })
      });
      
      if (response.ok) {
        setShowPropertyModal(false);
        setNewProperty({
          name: '',
          property_type: 'apartment',
          location: '',
          price: '',
          bedrooms: '',
          bathrooms: '',
          square_feet: '',
          description: '',
          amenities: ''
        });
        queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
        alert('Property created successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create property');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Error creating property');
    }
  };

  // Update property function
  const updateProperty = async (propertyId, updates) => {
    try {
      const token = localStorage.getItem('authTokens');
      const response = await fetch(`http://localhost:8000/api/properties/${propertyId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${JSON.parse(token)?.access}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
        alert('Property updated successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Error updating property');
    }
  };

  // Delete property function
  const deleteProperty = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      const token = localStorage.getItem('authTokens');
      const response = await fetch(`http://localhost:8000/api/properties/${propertyId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${JSON.parse(token)?.access}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
        alert('Property deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property');
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'leases', label: 'Lease Management', icon: FileText },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'system', label: 'System Settings', icon: Settings },
  ];

  const handleUserAction = async (userId, action) => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/${action}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: `User ${action}d successfully`
        }]);
      }
    } catch (error) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Failed to ${action} user`
      }]);
    }
  };

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Users</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{dashboardStats?.totalUsers || 0}</h3>
          <p className="text-sm text-green-600 mt-1">↑ 12% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Properties</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{dashboardStats?.totalProperties || 0}</h3>
          <p className="text-sm text-green-600 mt-1">↑ 8% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Monthly Revenue</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatCurrency(dashboardStats?.monthlyRevenue || 0)}
          </h3>
          <p className="text-sm text-green-600 mt-1">↑ 15% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Occupancy Rate</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{dashboardStats?.occupancyRate || 0}%</h3>
          <p className="text-sm text-amber-600 mt-1">↓ 2% from last month</p>
        </motion.div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">AI Insights & Predictions</h3>
          <Zap className="w-6 h-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h4 className="font-semibold mb-2">Payment Risk</h4>
            <p className="text-2xl font-bold">{aiInsights?.paymentRisk || 'Low'}</p>
            <p className="text-sm text-blue-100">3 high-risk tenants identified</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h4 className="font-semibold mb-2">Revenue Forecast</h4>
            <p className="text-2xl font-bold">{formatCurrency(aiInsights?.revenueForecast || 0)}</p>
            <p className="text-sm text-blue-100">Next 30 days</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h4 className="font-semibold mb-2">Optimal Pricing</h4>
            <p className="text-2xl font-bold">+{aiInsights?.priceOptimization || 8}%</p>
            <p className="text-sm text-blue-100">Recommended increase</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
        <div className="space-y-3">
          {recentActivity?.slice(0, 5).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'user' ? 'bg-blue-100' :
                  activity.type === 'payment' ? 'bg-green-100' :
                  activity.type === 'maintenance' ? 'bg-amber-100' : 'bg-gray-100'
                }`}>
                  {activity.type === 'user' ? <Users className="w-4 h-4 text-blue-600" /> :
                   activity.type === 'payment' ? <CreditCard className="w-4 h-4 text-green-600" /> :
                   activity.type === 'maintenance' ? <Wrench className="w-4 h-4 text-amber-600" /> :
                   <Activity className="w-4 h-4 text-gray-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {format(new Date(activity.timestamp), 'MMM d, HH:mm')}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activity.status === 'success' ? 'bg-green-100 text-green-700' :
                  activity.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {activity.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderUserManagement = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create User
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.filter(user => 
                user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.user_type === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.user_type === 'tenant' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.property_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            user.risk_score > 70 ? 'bg-red-500' :
                            user.risk_score > 40 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${user.risk_score || 0}%` }}
                        />
                      </div>
                      <span className="text-sm">{user.risk_score || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-amber-600 hover:text-amber-900 mr-3">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUserAction(user.id, user.active ? 'suspend' : 'activate')}
                      className={`${user.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                    >
                      {user.active ? <Lock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New User</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={newUser.confirm_password}
                    onChange={(e) => setNewUser({...newUser, confirm_password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                  <select
                    value={newUser.user_type}
                    onChange={(e) => setNewUser({...newUser, user_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tenant">Tenant</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              {newUser.user_type === 'tenant' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Property</label>
                    <select
                      value={newUser.property_id}
                      onChange={(e) => setNewUser({...newUser, property_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a property</option>
                      {properties?.map(property => (
                        <option key={property.id} value={property.id}>
                          {property.name} - ${property.location} (${property.property_type})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget</label>
                      <input
                        type="number"
                        value={newUser.budget_min}
                        onChange={(e) => setNewUser({...newUser, budget_min: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Minimum budget"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget</label>
                      <input
                        type="number"
                        value={newUser.budget_max}
                        onChange={(e) => setNewUser({...newUser, budget_max: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Maximum budget"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Property Type</label>
                      <select
                        value={newUser.preferred_property_type}
                        onChange={(e) => setNewUser({...newUser, preferred_property_type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="apartment">Apartment</option>
                        <option value="bedsitter">Bedsitter</option>
                        <option value="hostel">Student Hostel</option>
                        <option value="studio">Studio</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                      <input
                        type="text"
                        value={newUser.preferred_location}
                        onChange={(e) => setNewUser({...newUser, preferred_location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Preferred location"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderSystemSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* System Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">AI Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Payment Risk Threshold</p>
                  <p className="text-sm text-gray-500">Alert when risk exceeds this level</p>
                </div>
                <input
                  type="number"
                  defaultValue="70"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Price Optimization</p>
                  <p className="text-sm text-gray-500">Enable AI pricing suggestions</p>
                </div>
                <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Predictive Analytics</p>
                  <p className="text-sm text-gray-500">Generate AI forecasts</p>
                </div>
                <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Notification Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Payment Reminders</p>
                  <p className="text-sm text-gray-500">Send automated reminders</p>
                </div>
                <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Maintenance Alerts</p>
                  <p className="text-sm text-gray-500">Notify on new requests</p>
                </div>
                <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Security Alerts</p>
                  <p className="text-sm text-gray-500">Suspicious activity notifications</p>
                </div>
                <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Database className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Database</h4>
            <p className="text-sm text-green-600">Operational</p>
            <p className="text-xs text-gray-500">99.9% uptime</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Cpu className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">AI Services</h4>
            <p className="text-sm text-green-600">Running</p>
            <p className="text-xs text-gray-500">All models active</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HardDrive className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Storage</h4>
            <p className="text-sm text-green-600">Healthy</p>
            <p className="text-xs text-gray-500">45% used</p>
          </div>
        </div>
      </div>

      {/* Backup & Maintenance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Backup & Maintenance</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Last Backup</p>
                <p className="text-sm text-gray-500">Daily at 2:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">Completed 2 hours ago</span>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Manual Backup
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-gray-900">System Maintenance</p>
                <p className="text-sm text-gray-500">Scheduled for next week</p>
              </div>
            </div>
            <button className="px-3 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700">
              Reschedule
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderAnnouncements = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
        <button
          onClick={() => setShowAnnouncementModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {announcementsData.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
              <p className="text-gray-500 mb-4">Create your first announcement to communicate with users</p>
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Announcement
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {announcementsData.map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                      <p className="text-gray-600 mt-1">{announcement.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Type: {announcement.announcement_type}</span>
                        <span>Audience: {announcement.target_audience}</span>
                        <span>By: {announcement.author}</span>
                        <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      announcement.target_audience === 'all' ? 'bg-gray-100 text-gray-800' :
                      announcement.target_audience === 'tenants' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {announcement.target_audience}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Announcement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter announcement title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter announcement content"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newAnnouncement.announcement_type}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, announcement_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="payment">Payment</option>
                    <option value="policy">Policy</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={newAnnouncement.target_audience}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, target_audience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="tenants">Tenants Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createAnnouncement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderProperties = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Property Management</h2>
        <button
          onClick={() => setShowPropertyModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  property.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {property.available ? 'Available' : 'Occupied'}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description || 'No description available'}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Type</span>
                  <span className="text-sm font-medium capitalize">{property.property_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Location</span>
                  <span className="text-sm font-medium">{property.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Price</span>
                  <span className="text-sm font-bold text-green-600">${property.price}/month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Size</span>
                  <span className="text-sm font-medium">
                    {property.bedrooms} bed, {property.bathrooms} bath, {property.square_feet} sqft
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  View Details
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  Edit
                </button>
                <button 
                  onClick={() => deleteProperty(property.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {properties?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-500 mb-4">Add your first property to get started</p>
            <button
              onClick={() => setShowPropertyModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Property
            </button>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Property</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                <input
                  type="text"
                  value={newProperty.name}
                  onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter property name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    value={newProperty.property_type}
                    onChange={(e) => setNewProperty({...newProperty, property_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="bedsitter">Bedsitter</option>
                    <option value="hostel">Student Hostel</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newProperty.location}
                    onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($/month)</label>
                  <input
                    type="number"
                    value={newProperty.price}
                    onChange={(e) => setNewProperty({...newProperty, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Monthly rent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={newProperty.bedrooms}
                    onChange={(e) => setNewProperty({...newProperty, bedrooms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Number of bedrooms"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={newProperty.bathrooms}
                    onChange={(e) => setNewProperty({...newProperty, bathrooms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Number of bathrooms"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                  <input
                    type="number"
                    value={newProperty.square_feet}
                    onChange={(e) => setNewProperty({...newProperty, square_feet: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Total square feet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                  <input
                    type="text"
                    value={newProperty.amenities}
                    onChange={(e) => setNewProperty({...newProperty, amenities: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., WiFi, Parking, Pool (comma separated)"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProperty.description}
                  onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter property description"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPropertyModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProperty}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Property
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUserManagement();
      case 'properties':
        return renderProperties();
      case 'announcements':
        return renderAnnouncements();
      case 'system':
        return renderSystemSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Administrator
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">System Control Center</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {notification.message}
          </motion.div>
        ))}
      </div>
    </div>
      </ErrorBoundary>
  );
};

export default AdminDashboard;
