import React from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Users, CreditCard } from 'lucide-react';

const PropertyPerformanceChart = ({ properties = [], payments = [] }) => {
  // Calculate performance metrics for each property
  const propertyMetrics = properties.map(property => {
    const propertyPayments = payments.filter(p => (p.property ?? p.property_id) === property.id && p.status === 'paid');
    const totalRevenue = propertyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const occupancyRate = property.status === 'occupied' ? 100 : 0;
    
    return {
      ...property,
      totalRevenue,
      occupancyRate,
      paymentCount: propertyPayments.length,
      averageRent: propertyPayments.length > 0 ? totalRevenue / propertyPayments.length : 0
    };
  });

  // Sort by revenue
  const sortedProperties = propertyMetrics.sort((a, b) => b.totalRevenue - a.totalRevenue);
  const topPerformer = sortedProperties[0];
  const totalPropertiesRevenue = propertyMetrics.reduce((sum, p) => sum + p.totalRevenue, 0);
  
  const maxRevenue = Math.max(...propertyMetrics.map(p => p.totalRevenue), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Property Performance</h3>
          <p className="text-sm text-slate-500 mt-1">Revenue by property</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Building2 className="w-4 h-4" />
          <span>{properties.length} Properties</span>
        </div>
      </div>

      {/* Top Performer */}
      {topPerformer && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">🏆 Top Performer</p>
              <p className="text-lg font-semibold text-slate-900">{topPerformer.name}</p>
              <p className="text-sm text-slate-600">{topPerformer.address}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">KES {topPerformer.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Bars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Property</span>
          <span>KES {maxRevenue.toLocaleString()}</span>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{property.name}</p>
                  <p className="text-sm font-bold text-slate-900">KES {property.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    {property.paymentCount} payments
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {property.occupancyRate}% occupied
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    KES {property.averageRent.toLocaleString()} avg
                  </span>
                </div>
                <div className="mt-2 bg-slate-100 rounded-full h-2 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(property.totalRevenue / maxRevenue) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`h-full rounded-full ${
                      property.totalRevenue === maxRevenue 
                        ? 'bg-emerald-500' 
                        : property.totalRevenue > maxRevenue * 0.7 
                          ? 'bg-blue-500' 
                          : 'bg-slate-400'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100">
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <p className="text-xl font-bold text-slate-900">KES {totalPropertiesRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Total Portfolio Revenue</p>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <p className="text-xl font-bold text-slate-900">
            KES {properties.length > 0 ? Math.round(totalPropertiesRevenue / properties.length).toLocaleString() : 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Average Per Property</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyPerformanceChart;
