import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, Plus, Search, AlertTriangle, Clock, CheckCircle2, 
  MoreVertical, Edit, Trash2, Calendar, MapPin
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import MaintenanceForm from '@/components/forms/MaintenanceForm.jsx';
import { toast } from 'react-hot-toast';

export default function Maintenance() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
      setShowForm(true);
    }
  }, []);

  const { data: maintenance = [], isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.MaintenanceRequest.filter({ owner_id: userData.email }, '-created_date');
    },
    enabled: !!user
  });

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

  const getPropertyName = (propertyId) => {
    return properties.find(p => p.id === propertyId)?.name || 'Unknown';
  };

  const getTenantName = (tenantId) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.first_name} ${tenant.last_name}` : '';
  };

  const filteredRequests = maintenance.filter(m => {
    const matchesSearch = 
      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getPropertyName(m.property_id).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || m.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Stats
  const openRequests = maintenance.filter(m => m.status !== 'completed' && m.status !== 'cancelled');
  const emergencyCount = openRequests.filter(m => m.priority === 'emergency').length;
  const inProgressCount = maintenance.filter(m => m.status === 'in_progress').length;
  const completedThisMonth = maintenance.filter(m => {
    if (m.status !== 'completed' || !m.completed_date) return false;
    const completedDate = new Date(m.completed_date);
    const now = new Date();
    return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
  }).length;

  const handleDelete = async (request) => {
    if (confirm('Are you sure you want to delete this request?')) {
      await base44.entities.MaintenanceRequest.delete(request.id);
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Request deleted');
    }
  };

  const handleUpdateStatus = async (request, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completed_date = format(new Date(), 'yyyy-MM-dd');
    }
    await base44.entities.MaintenanceRequest.update(request.id, updates);
    queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    toast.success('Status updated');
  };

  const handleFormSave = () => {
    queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    setEditingRequest(null);
  };

  const priorityConfig = {
    emergency: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertTriangle },
    high: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle },
    medium: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    low: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock }
  };

  const statusConfig = {
    submitted: { color: 'bg-violet-100 text-violet-700', label: 'Submitted' },
    in_progress: { color: 'bg-blue-100 text-blue-700', label: 'In Progress' },
    scheduled: { color: 'bg-amber-100 text-amber-700', label: 'Scheduled' },
    completed: { color: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
    cancelled: { color: 'bg-slate-100 text-slate-700', label: 'Cancelled' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Maintenance</h1>
            <p className="text-slate-500 mt-1">Track and manage maintenance requests</p>
          </div>
          <Button 
            onClick={() => { setEditingRequest(null); setShowForm(true); }}
            className="bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Open Requests</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{openRequests.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <p className="text-sm text-slate-500">Emergency</p>
            <p className="text-3xl font-bold text-rose-600 mt-1">{emergencyCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Completed This Month</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{completedThisMonth}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-600"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-600"
            >
              <option value="all">All Priority</option>
              <option value="emergency">Emergency</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Wrench className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No requests found</h3>
            <p className="text-slate-500 mb-6">Create a new maintenance request</p>
            <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-5 h-5 mr-2" />
              New Request
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRequests.map((request, index) => {
                const priority = priorityConfig[request.priority] || priorityConfig.medium;
                const status = statusConfig[request.status] || statusConfig.submitted;
                const PriorityIcon = priority.icon;
                
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className={`bg-white rounded-2xl p-6 border hover:shadow-lg transition-all duration-300 ${
                      request.priority === 'emergency' ? 'border-rose-200' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Priority Icon */}
                      <div className={`p-3 rounded-xl flex-shrink-0 ${
                        request.priority === 'emergency' ? 'bg-rose-100' : 
                        request.priority === 'high' ? 'bg-amber-100' : 'bg-slate-100'
                      }`}>
                        <Wrench className={`w-6 h-6 ${
                          request.priority === 'emergency' ? 'text-rose-600' : 
                          request.priority === 'high' ? 'text-amber-600' : 'text-slate-600'
                        }`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{request.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-slate-500 flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {getPropertyName(request.property_id)}
                              </span>
                              {getTenantName(request.tenant_id) && (
                                <span className="text-sm text-slate-400">
                                  • {getTenantName(request.tenant_id)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className={`${priority.color} border`}>
                              <PriorityIcon className="w-3 h-3 mr-1" />
                              {request.priority}
                            </Badge>
                            <Badge variant="outline" className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                        </div>

                        {request.description && (
                          <p className="text-slate-600 mt-3 line-clamp-2">{request.description}</p>
                        )}

                        {/* Images Preview */}
                        {request.images?.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {request.images.slice(0, 3).map((img, i) => (
                              <img 
                                key={i} 
                                src={img} 
                                alt="" 
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ))}
                            {request.images.length > 3 && (
                              <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-sm text-slate-500">
                                +{request.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Created {format(new Date(request.created_date), 'MMM d, yyyy')}
                            </span>
                            {request.scheduled_date && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Clock className="w-4 h-4" />
                                Scheduled {format(new Date(request.scheduled_date), 'MMM d')}
                              </span>
                            )}
                            {request.cost > 0 && (
                              <span className="font-medium text-slate-900">
                                Cost: ${request.cost.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {request.status === 'submitted' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(request, 'in_progress')}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                Start Work
                              </Button>
                            )}
                            {request.status === 'in_progress' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(request, 'completed')}
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-slate-100 rounded-lg">
                                  <MoreVertical className="w-4 h-4 text-slate-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setEditingRequest(request); setShowForm(true); }}>
                                  <Edit className="w-4 h-4 mr-2" />Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(request)} className="text-rose-600">
                                  <Trash2 className="w-4 h-4 mr-2" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <MaintenanceForm
        request={editingRequest}
        open={showForm}
        onClose={() => { setShowForm(false); setEditingRequest(null); }}
        onSave={handleFormSave}
      />
    </div>
  );
}
