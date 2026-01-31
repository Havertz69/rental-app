import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DollarSign, Wrench, Home, User, FileText } from 'lucide-react';

const iconMap = {
  payment: DollarSign,
  maintenance: Wrench,
  property: Home,
  tenant: User,
  document: FileText
};

const colorMap = {
  payment: 'bg-emerald-100 text-emerald-600',
  maintenance: 'bg-amber-100 text-amber-600',
  property: 'bg-blue-100 text-blue-600',
  tenant: 'bg-violet-100 text-violet-600',
  document: 'bg-slate-100 text-slate-600'
};

export default function RecentActivity({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500">No recent activity</p>
        <p className="text-sm text-slate-400 mt-1">Your activity will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
      </div>
      <div className="divide-y divide-slate-50">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.type] || FileText;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl ${colorMap[activity.type] || 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{activity.title}</p>
                  <p className="text-sm text-slate-500 truncate">{activity.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    {activity.date ? format(new Date(activity.date), 'MMM d, h:mm a') : ''}
                  </p>
                  {activity.status && (
                    <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block
                      ${activity.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : ''}
                      ${activity.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                      ${activity.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                      ${activity.status === 'submitted' ? 'bg-violet-100 text-violet-700' : ''}
                    `}>
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}