import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, Users, DollarSign, Wrench, 
  FileText, MessageSquare, Menu, X, LogOut, ChevronDown,
  Bell, Settings, User, Megaphone, Home
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: 'Properties', icon: Building2 },
  { name: 'Tenants', href: 'Tenants', icon: Users },
  { name: 'Payments', href: 'Payments', icon: DollarSign },
  { name: 'Maintenance', href: 'Maintenance', icon: Wrench },
  { name: 'Documents', href: 'Documents', icon: FileText },
  { name: 'Messages', href: 'Messages', icon: MessageSquare },
  { name: 'Announcements', href: 'Announcements', icon: Megaphone },
  { name: 'AI Assistant', href: 'Assistant', icon: MessageSquare, highlight: true },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await api.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    api.auth.logout();
  };

  // TenantPortal has its own layout
  if (currentPageName === 'TenantPortal') {
    return children;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">RentWise</h1>
              <p className="text-xs text-slate-400">Property Management</p>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = currentPageName === item.href;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.href)}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/20' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="font-medium">{item.name}</span>
                {item.highlight && !isActive && (
                  <Badge className="ml-auto bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs px-2 py-0">
                    AI
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-violet-600">
                    {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-100 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>

          <div className="flex-1 lg:flex-none">
            <h2 className="text-lg font-semibold text-slate-900 lg:hidden">
              {navigation.find(n => n.href === currentPageName)?.name || 'RentWise'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-violet-600">
                      {user?.full_name?.[0] || 'U'}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}