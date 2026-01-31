import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Plus, Search, Mail, Phone, Calendar, Home, 
  MoreVertical, Edit, Trash2, DollarSign
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format, differenceInDays, isPast } from 'date-fns';
import TenantForm from '@/components/forms/TenantForm.jsx';
import { toast } from 'react-hot-toast';

export default function Tenants() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const userData = await base44.auth.me();
      return base44.entities.Tenant.filter({ owner_id: userData.email }, '-created_date');
    },
    enabled: !!user
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const userData = await base44.auth.me();
      return base44.entities.Property.filter({ owner_id: userData.email });
    },
    enabled: !!user
  });

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = 
      `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (tenant) => {
    if (confirm('Are you sure you want to delete this tenant?')) {
      await base44.entities.Tenant.delete(tenant.id);
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant deleted');
    }
  };

  const handleFormSave = () => {
    queryClient.invalidateQueries({ queryKey: ['tenants'] });
    setEditingTenant(null);
  };

  const getLeaseStatus = (tenant) => {
    if (!tenant.lease_end) return null;
    const daysUntilEnd = differenceInDays(new Date(tenant.lease_end), new Date());
    
    if (isPast(new Date(tenant.lease_end))) {
      return { label: 'Expired', color: 'bg-rose-100 text-rose-700' };
    }
    if (daysUntilEnd <= 30) {
      return { label: `Expires in ${daysUntilEnd} days`, color: 'bg-amber-100 text-amber-700' };
    }
    return null;
  };

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    past: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tenants</h1>
            <p className="text-slate-500 mt-1">Manage your tenants and leases</p>
          </div>
          <Button 
            onClick={() => { setEditingTenant(null); setShowForm(true); }}
            className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Tenant
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Total Tenants</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{tenants.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Active Leases</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {tenants.filter(t => t.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Monthly Revenue</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              ${tenants.filter(t => t.status === 'active').reduce((sum, t) => sum + (t.monthly_rent || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'active', 'pending', 'past'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status 
                    ? 'bg-violet-100 text-violet-700' 
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                } border border-slate-200`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tenants List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No tenants found</h3>
            <p className="text-slate-500 mb-6">Add your first tenant to get started</p>
            <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-5 h-5 mr-2" />
              Add Tenant
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTenants.map((tenant, index) => {
                const property = properties.find(p => p.id === tenant.property_id);
                const leaseStatus = getLeaseStatus(tenant);
                
                return (
                  <motion.div
                    key={tenant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative">
                          {tenant.profile_image ? (
                            <img 
                              src={tenant.profile_image} 
                              alt="" 
                              className="w-16 h-16 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
                              <span className="text-2xl font-bold text-violet-600">
                                {tenant.first_name?.[0]}{tenant.last_name?.[0]}
                              </span>
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            tenant.status === 'active' ? 'bg-emerald-500' : 
                            tenant.status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {tenant.first_name} {tenant.last_name}
                            </h3>
                            <Badge variant="outline" className={statusColors[tenant.status]}>
                              {tenant.status}
                            </Badge>
                            {leaseStatus && (
                              <Badge variant="outline" className={leaseStatus.color}>
                                {leaseStatus.label}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {tenant.email}
                            </span>
                            {tenant.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {tenant.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Property & Lease Info */}
                      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                        <div className="text-sm">
                          <p className="text-slate-500 flex items-center gap-1">
                            <Home className="w-4 h-4" />
                            {property?.name || 'No property'}
                            {tenant.unit_number && ` • Unit ${tenant.unit_number}`}
                          </p>
                          {tenant.lease_start && tenant.lease_end && (
                            <p className="text-slate-400 flex items-center gap-1 mt-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(tenant.lease_start), 'MMM d, yyyy')} - {format(new Date(tenant.lease_end), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="flex items-center gap-1 text-lg font-bold text-slate-900">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            {tenant.monthly_rent?.toLocaleString() || 0}
                            <span className="text-sm font-normal text-slate-400">/mo</span>
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                              <MoreVertical className="w-5 h-5 text-slate-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingTenant(tenant); setShowForm(true); }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(tenant)} className="text-rose-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <TenantForm
        tenant={editingTenant}
        open={showForm}
        onClose={() => { setShowForm(false); setEditingTenant(null); }}
        onSave={handleFormSave}
      />
    </div>
  );
}