import React from 'react';
import { format } from 'date-fns';
import { Bell, AlertTriangle, Info, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function TenantAnnouncements({ announcements }) {
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const priorityOrder = { urgent: 0, important: 1, normal: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'urgent':
        return { 
          icon: AlertTriangle, 
          color: 'bg-rose-100 text-rose-700', 
          iconColor: 'text-rose-600',
          border: 'border-rose-200'
        };
      case 'important':
        return { 
          icon: Megaphone, 
          color: 'bg-amber-100 text-amber-700', 
          iconColor: 'text-amber-600',
          border: 'border-amber-200'
        };
      default:
        return { 
          icon: Info, 
          color: 'bg-blue-100 text-blue-700', 
          iconColor: 'text-blue-600',
          border: 'border-slate-100'
        };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Announcements</h2>
        <p className="text-slate-500">Important updates from your property manager</p>
      </div>

      {sortedAnnouncements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">No announcements at this time</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAnnouncements.map((announcement, index) => {
            const config = getPriorityConfig(announcement.priority);
            const Icon = config.icon;

            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl border ${config.border} overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${config.color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${config.iconColor}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 text-lg">{announcement.title}</h3>
                        <Badge className={config.color}>
                          {announcement.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-slate-600 whitespace-pre-wrap">{announcement.content}</p>
                      
                      <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                        <span>
                          Posted: {format(new Date(announcement.created_date), 'MMMM d, yyyy')}
                        </span>
                        {announcement.expires_at && (
                          <span>
                            Expires: {format(new Date(announcement.expires_at), 'MMMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}