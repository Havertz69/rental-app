import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const RevenueChart = ({ data = [], title = "Revenue Overview" }) => {
  // Calculate analytics
  const totalRevenue = data.reduce((sum, item) => sum + (item.amount || 0), 0);
  const averageRevenue = data.length > 0 ? totalRevenue / data.length : 0;
  
  // Find trend (compare last 3 months to previous 3 months)
  const recentMonths = data.slice(-3);
  const previousMonths = data.slice(-6, -3);
  const recentTotal = recentMonths.reduce((sum, item) => sum + (item.amount || 0), 0);
  const previousTotal = previousMonths.reduce((sum, item) => sum + (item.amount || 0), 0);
  const trend = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0;
  
  const maxRevenue = Math.max(...data.map(item => item.amount || 0), 1);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">Monthly revenue trends</p>
        </div>
        <div className="flex items-center gap-2">
          {trend > 0 ? (
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{trend.toFixed(1)}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-rose-600">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">{trend.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <p className="text-2xl font-bold text-slate-900">KES {totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Total Revenue</p>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <p className="text-2xl font-bold text-slate-900">KES {averageRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Monthly Average</p>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <p className="text-2xl font-bold text-slate-900">{data.length}</p>
          <p className="text-xs text-slate-500 mt-1">Months</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Monthly Revenue</span>
          <span>KES {maxRevenue.toLocaleString()}</span>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-16 text-sm text-slate-600">
                {item.month}
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.amount / maxRevenue) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className={`h-full rounded-full ${
                    item.amount > averageRevenue 
                      ? 'bg-emerald-500' 
                      : item.amount > averageRevenue * 0.8 
                        ? 'bg-amber-500' 
                        : 'bg-rose-500'
                  }`}
                />
              </div>
              <div className="w-24 text-right text-sm font-medium text-slate-900">
                KES {(item.amount || 0).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-xs text-slate-600">Above Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-xs text-slate-600">Near Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
          <span className="text-xs text-slate-600">Below Average</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueChart;
