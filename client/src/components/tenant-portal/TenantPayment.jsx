import React from 'react';
import { format } from 'date-fns';
import { DollarSign, CheckCircle2, Clock, AlertTriangle, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function TenantPayments({ tenant, payments }) {
  const sortedPayments = [...payments].sort((a, b) => 
    new Date(b.due_date || b.created_date) - new Date(a.due_date || a.created_date)
  );

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending' || p.status === 'late')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'paid':
        return { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700', iconColor: 'text-emerald-600' };
      case 'pending':
        return { icon: Clock, color: 'bg-amber-100 text-amber-700', iconColor: 'text-amber-600' };
      case 'late':
        return { icon: AlertTriangle, color: 'bg-rose-100 text-rose-700', iconColor: 'text-rose-600' };
      default:
        return { icon: DollarSign, color: 'bg-slate-100 text-slate-700', iconColor: 'text-slate-600' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Payment History</h2>
        <p className="text-slate-500">Track all your rent payments and transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-slate-100"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">KES {totalPaid.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Total Paid</p>
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
          <p className="text-2xl font-bold text-slate-900">KES {pendingAmount.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Pending Amount</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-slate-100"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">KES {tenant?.monthly_rent?.toLocaleString() || 0}</p>
          <p className="text-sm text-slate-500">Monthly Rent</p>
        </motion.div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">All Payments</h3>
        </div>

        {sortedPayments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">No payment records yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedPayments.map((payment, index) => {
              const config = getStatusConfig(payment.status);
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${config.color.split(' ')[0]} flex items-center justify-center`}>
                      <StatusIcon className={`w-6 h-6 ${config.iconColor}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 capitalize">
                          {payment.payment_type || 'Payment'}
                        </p>
                        <Badge className={config.color}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Due: {payment.due_date ? format(new Date(payment.due_date), 'MMM d, yyyy') : 'N/A'}
                        </span>
                        {payment.paid_date && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid: {format(new Date(payment.paid_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900">KES {payment.amount?.toLocaleString()}</p>
                      {payment.payment_method && (
                        <p className="text-sm text-slate-500 flex items-center justify-end gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {payment.payment_method.replace('_', ' ')}
                        </p>
                      )}
                    </div>
                  </div>
                  {payment.notes && (
                    <p className="mt-2 text-sm text-slate-500 pl-16">{payment.notes}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}