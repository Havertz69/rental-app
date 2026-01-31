import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Wrench, FileText, DollarSign, MessageSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const actions = [
  {
    title: 'Add Property',
    description: 'List a new property',
    icon: Plus,
    href: 'Properties?action=add',
    color: 'bg-gradient-to-br from-emerald-400 to-emerald-600'
  },
  {
    title: 'New Tenant',
    description: 'Add a tenant',
    icon: Users,
    href: 'Tenants?action=add',
    color: 'bg-gradient-to-br from-blue-400 to-blue-600'
  },
  {
    title: 'Record Payment',
    description: 'Log rent payment',
    icon: DollarSign,
    href: 'Payments?action=add',
    color: 'bg-gradient-to-br from-violet-400 to-violet-600'
  },
  {
    title: 'Maintenance',
    description: 'Create request',
    icon: Wrench,
    href: 'Maintenance?action=add',
    color: 'bg-gradient-to-br from-amber-400 to-amber-600'
  },
  {
    title: 'AI Assistant',
    description: 'Chat with RentWise',
    icon: MessageSquare,
    href: 'Assistant',
    color: 'bg-gradient-to-br from-rose-400 to-rose-600'
  },
  {
    title: 'Documents',
    description: 'Manage files',
    icon: FileText,
    href: 'Documents',
    color: 'bg-gradient-to-br from-slate-400 to-slate-600'
  }
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            to={createPageUrl(action.href)}
            className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-lg hover:scale-105 transition-all duration-300 group"
          >
            <div className={`${action.color} p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">{action.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{action.description}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}