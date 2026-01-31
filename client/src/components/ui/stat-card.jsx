import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue: 'bg-blue-500 text-white',
    violet: 'bg-violet-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    amber: 'bg-amber-400 text-white'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-4">
      <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.blue}`}>
        {Icon ? <Icon className="w-5 h-5" /> : null}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {trend && (
          <div className="text-xs text-slate-400 mt-2">{trend.value}% {trend.isPositive ? '▲' : '▼'}</div>
        )}
      </div>
    </div>
  );
}
