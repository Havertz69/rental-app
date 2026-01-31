import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

const FinancialSummary = ({ payments = [], properties = [] }) => {
  // Calculate financial metrics
  const currentMonth = new Date();
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  const currentMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.created_date);
    return paymentDate >= monthStart && paymentDate <= monthEnd;
  });
  
  const paidPayments = payments.filter(p => p.status === 'paid');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const latePayments = payments.filter(p => p.status === 'late');
  
  const currentMonthRevenue = currentMonthPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const totalCollected = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOverdue = latePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  // Calculate monthly potential income
  const monthlyPotential = properties.reduce((sum, p) => sum + (p.monthly_rent || 0), 0);
  const collectionRate = monthlyPotential > 0 ? (currentMonthRevenue / monthlyPotential) * 100 : 0;
  
  // Payment method breakdown
  const paymentMethods = paidPayments.reduce((acc, p) => {
    acc[p.payment_method] = (acc[p.payment_method] || 0) + (p.amount || 0);
    return acc;
  }, {});
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Financial Summary</h3>
          <p className="text-sm text-slate-500 mt-1">Revenue and payment analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <span className="text-sm text-slate-600">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-50 rounded-xl p-4 border border-emerald-200"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-xs text-emerald-700 font-medium">Collected</span>
          </div>
          <p className="text-xl font-bold text-emerald-700">KES {totalCollected.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 mt-1">{paidPayments.length} payments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 rounded-xl p-4 border border-amber-200"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span className="text-xs text-amber-700 font-medium">Pending</span>
          </div>
          <p className="text-xl font-bold text-amber-700">KES {totalPending.toLocaleString()}</p>
          <p className="text-xs text-amber-600 mt-1">{pendingPayments.length} payments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-rose-50 rounded-xl p-4 border border-rose-200"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-rose-600" />
            <span className="text-xs text-rose-700 font-medium">Overdue</span>
          </div>
          <p className="text-xl font-bold text-rose-700">KES {totalOverdue.toLocaleString()}</p>
          <p className="text-xs text-rose-600 mt-1">{latePayments.length} payments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 rounded-xl p-4 border border-blue-200"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">Collection Rate</span>
          </div>
          <p className="text-xl font-bold text-blue-700">{collectionRate.toFixed(1)}%</p>
          <p className="text-xs text-blue-600 mt-1">This month</p>
        </motion.div>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Payment Methods</h4>
        <div className="space-y-2">
          {Object.entries(paymentMethods).map(([method, amount], index) => (
            <motion.div
              key={method}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-900 capitalize">
                  {method.replace('_', ' ')}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">KES {amount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">
                  {((amount / totalCollected) * 100).toFixed(1)}% of total
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Monthly Performance</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <p className="text-lg font-bold text-slate-900">KES {currentMonthRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Current Month</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <p className="text-lg font-bold text-slate-900">KES {monthlyPotential.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Potential Income</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialSummary;
