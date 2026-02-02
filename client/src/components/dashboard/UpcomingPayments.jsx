import React from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays, isPast } from 'date-fns';
import { Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/currency';

export default function UpcomingPayments({ payments, onMarkPaid }) {
  const getStatusInfo = (payment) => {
    const dueDate = new Date(payment.due_date || payment.payment_date || 0);
    const daysUntilDue = differenceInDays(dueDate, new Date());
    
    if (payment.status === 'paid') {
      return { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Paid' };
    }
    if (isPast(dueDate)) {
      return { color: 'bg-rose-100 text-rose-700', icon: AlertCircle, label: 'Overdue' };
    }
    if (daysUntilDue <= 5) {
      return { color: 'bg-amber-100 text-amber-700', icon: Clock, label: `Due in ${daysUntilDue} days` };
    }
    return { color: 'bg-slate-100 text-slate-700', icon: Calendar, label: `Due ${format(dueDate, 'MMM d')}` };
  };

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <p className="text-slate-500">All caught up!</p>
        <p className="text-sm text-slate-400 mt-1">No pending payments</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Upcoming Payments</h2>
      </div>
      <div className="divide-y divide-slate-50">
        {payments.slice(0, 5).map((payment, index) => {
          const statusInfo = getStatusInfo(payment);
          const StatusIcon = statusInfo.icon;
          
          return (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{payment.tenant_name}</p>
                  <p className="text-sm text-slate-500">{payment.property_name}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold text-slate-900">{formatCurrency(payment.amount)}</p>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </span>
                </div>
                {payment.status !== 'paid' && onMarkPaid && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkPaid(payment.id)}
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    Mark Paid
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}