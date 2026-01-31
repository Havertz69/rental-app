import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

const priorityColors = {
  emergency: 'bg-rose-100 text-rose-700 border-rose-200',
  high: 'bg-amber-100 text-amber-700 border-amber-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200'
};

const statusIcons = {
  submitted: Clock,
  in_progress: Wrench,
  scheduled: Clock,
  completed: CheckCircle2,
  cancelled: AlertTriangle
};

export default function MaintenanceOverview({ requests }) {
  const activeRequests = requests ? requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled') : [];
  const emergencyCount = activeRequests.filter(r => r.priority === 'emergency').length;

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-8 h-8 text-emerald-600" />
        </div>
        <p className="text-slate-500">No maintenance requests</p>
        <p className="text-sm text-slate-400 mt-1">Everything is running smoothly</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Maintenance</h2>
          {emergencyCount > 0 && (
            <p className="text-sm text-rose-600 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-4 h-4" />
              {emergencyCount} emergency request{emergencyCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link 
          to={createPageUrl('Maintenance')}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="divide-y divide-slate-50">
        {activeRequests.slice(0, 4).map((request, index) => {
          const StatusIcon = statusIcons[request.status] || Clock;
          return (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg ${
                    request.priority === 'emergency' ? 'bg-rose-100' : 
                    request.priority === 'high' ? 'bg-amber-100' : 'bg-slate-100'
                  }`}>
                    <Wrench className={`w-4 h-4 ${
                      request.priority === 'emergency' ? 'text-rose-600' : 
                      request.priority === 'high' ? 'text-amber-600' : 'text-slate-600'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{request.title}</p>
                    <p className="text-sm text-slate-500 truncate">{request.property_name}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={priorityColors[request.priority] || priorityColors.medium}>
                    {request.priority}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <StatusIcon className="w-3 h-3" />
                    {request.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}