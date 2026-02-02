import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Plus, Search, Calendar, CheckCircle, Clock, 
  AlertCircle, MoreVertical, Edit, Trash2, Download
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import PaymentForm from '@/components/forms/PaymentForm.jsx';
import { toast } from 'react-hot-toast';

export default function Payments() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await api.auth.me();
      setUser(userData);
    };
    loadUser();
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
      setShowForm(true);
    }
  }, []);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.Payment.filter({ owner_id: userData.email });
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

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.Property.filter({ owner_id: userData.email });
    },
    enabled: !!user
  });

  const getTenantName = (tenantId) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Unknown';
  };

  const getPropertyName = (propertyId) => {
    return properties.find(p => p.id === propertyId)?.name || 'Unknown';
  };

  const filteredPayments = payments.filter(p => {
    const tenantId = p.tenant ?? p.tenant_id;
    const matchesSearch = getTenantName(tenantId).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthlyPaid = payments
    .filter(p => p.status === 'paid' && p.paid_date && 
      isWithinInterval(new Date(p.paid_date), { start: monthStart, end: monthEnd }))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
  const overdue = payments.filter(p => p.status === 'late').reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleDelete = async (payment) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      await api.entities.Payment.delete(payment.id);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment deleted');
    }
  };

  const handleMarkPaid = async (payment) => {
    await api.entities.Payment.update(payment.id, {
      status: 'paid',
      payment_date: format(new Date(), 'yyyy-MM-dd')
    });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    toast.success('Payment marked as paid');
  };

  const handleFormSave = () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    setEditingPayment(null);
  };

  const statusConfig = {
    paid: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700', label: 'Paid' },
    pending: { icon: Clock, color: 'bg-amber-100 text-amber-700', label: 'Pending' },
    late: { icon: AlertCircle, color: 'bg-rose-100 text-rose-700', label: 'Late' },
    partial: { icon: Clock, color: 'bg-blue-100 text-blue-700', label: 'Partial' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
            <p className="text-slate-500 mt-1">Track rent payments and transactions</p>
          </div>
          <Button 
            onClick={() => { setEditingPayment(null); setShowForm(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Record Payment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">This Month</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">KES {monthlyPaid.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{format(currentMonth, 'MMMM yyyy')}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">KES {pending.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{payments.filter(p => p.status === 'pending').length} payments</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Overdue</p>
            <p className="text-3xl font-bold text-rose-600 mt-1">KES {overdue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{payments.filter(p => p.status === 'late').length} payments</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Total Collected</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              KES {payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">All time</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by tenant..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'paid', 'pending', 'late'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                } border border-slate-200`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Payments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded w-1/4 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <DollarSign className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No payments found</h3>
            <p className="text-slate-500 mb-6">Record your first payment</p>
            <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-5 h-5 mr-2" />
              Record Payment
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Tenant</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Property</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Due Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Type</th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {filteredPayments.map((payment, index) => {
                      const config = statusConfig[payment.status] || statusConfig.pending;
                      const StatusIcon = config.icon;
                      
                      return (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <p className="font-medium text-slate-900">{getTenantName(payment.tenant ?? payment.tenant_id)}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-slate-600">{getPropertyName(payment.property ?? payment.property_id)}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-900">KES {payment.amount?.toLocaleString()}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-slate-600">
                              {payment.due_date && format(new Date(payment.due_date), 'MMM d, yyyy')}
                            </p>
                            {payment.paid_date && (
                              <p className="text-xs text-emerald-600 mt-0.5">
                                Paid {format(new Date(payment.paid_date), 'MMM d')}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="outline" className={`${config.color} flex items-center gap-1 w-fit`}>
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-slate-500 capitalize">
                              {payment.payment_type?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {payment.status !== 'paid' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkPaid(payment)}
                                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Mark Paid
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setEditingPayment(payment); setShowForm(true); }}>
                                    <Edit className="w-4 h-4 mr-2" />Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(payment)} className="text-rose-600">
                                    <Trash2 className="w-4 h-4 mr-2" />Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <PaymentForm
        payment={editingPayment}
        open={showForm}
        onClose={() => { setShowForm(false); setEditingPayment(null); }}
        onSave={handleFormSave}
      />
    </div>
  );
}