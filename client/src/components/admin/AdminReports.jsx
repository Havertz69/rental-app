import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, Filter, Search,
  TrendingUp, TrendingDown, DollarSign, Users,
  Building2, CreditCard, Wrench, AlertTriangle,
  BarChart3, PieChart, Activity, Eye, Edit
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { formatCurrency } from '@/utils/currency';

const AdminReports = () => {
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [searchTerm, setSearchTerm] = useState('');

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'occupancy', label: 'Occupancy', icon: Building2 },
    { id: 'tenants', label: 'Tenant Performance', icon: Users },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'compliance', label: 'Compliance', icon: FileText },
  ];

  const generateReport = (reportType) => {
    // Simulate report generation
    console.log(`Generating ${reportType} report...`);
  };

  const renderOverviewReport = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Executive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(1250000)}</p>
            <p className="text-xs text-blue-100">↑ 15% YoY</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-sm">Occupancy Rate</p>
            <p className="text-2xl font-bold">92.5%</p>
            <p className="text-xs text-blue-100">↑ 3% YoY</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-sm">Active Tenants</p>
            <p className="text-2xl font-bold">156</p>
            <p className="text-xs text-blue-100">↑ 8% YoY</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-sm">Maintenance Issues</p>
            <p className="text-2xl font-bold">23</p>
            <p className="text-xs text-blue-100">↓ 12% YoY</p>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Revenue Growth</p>
                <p className="text-sm text-gray-500">Year over year comparison</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">+15.3%</p>
              <p className="text-sm text-gray-500">vs last year</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Tenant Retention</p>
                <p className="text-sm text-gray-500">12-month retention rate</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">87.2%</p>
              <p className="text-sm text-gray-500">industry avg: 75%</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Wrench className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Maintenance Response</p>
                <p className="text-sm text-gray-500">Average resolution time</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-600">2.3 days</p>
              <p className="text-sm text-gray-500">↓ 0.5 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h5 className="font-medium text-blue-900">Revenue Forecast</h5>
            </div>
            <p className="text-sm text-blue-800 mb-2">
              AI predicts 8% revenue growth next quarter based on current trends and market analysis.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <span className="font-medium">Confidence:</span>
              <div className="flex-1 bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span>85%</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h5 className="font-medium text-amber-900">Risk Alert</h5>
            </div>
            <p className="text-sm text-amber-800 mb-2">
              3 high-risk tenants identified with 70%+ probability of late payment.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <span className="font-medium">Action Required:</span>
              <span>Proactive outreach recommended</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderFinancialReport = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Revenue Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analysis</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{formatCurrency(1250000)}</p>
            <p className="text-sm text-green-600">Total Revenue</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(45000)}</p>
            <p className="text-sm text-blue-600">Outstanding</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-700">96.4%</p>
            <p className="text-sm text-amber-600">Collection Rate</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Revenue trend chart would be displayed here</p>
        </div>
      </div>

      {/* Payment Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Analysis</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">On-Time Payments</p>
              <p className="text-sm text-gray-500">Payments received by due date</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-600">89.2%</p>
              <p className="text-sm text-gray-500">↑ 3% from last month</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Late Payments</p>
              <p className="text-sm text-gray-500">Payments received after due date</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-amber-600">7.1%</p>
              <p className="text-sm text-gray-500">↓ 2% from last month</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Default Rate</p>
              <p className="text-sm text-gray-500">Unpaid payments over 90 days</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-red-600">3.7%</p>
              <p className="text-sm text-gray-500">↓ 1% from last month</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTenantPerformanceReport = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Tenant Performance Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Tenant Performance Analysis</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">45</p>
            <p className="text-sm text-green-600">Excellent</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">78</p>
            <p className="text-sm text-blue-600">Good</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <Users className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-700">25</p>
            <p className="text-sm text-amber-600">Average</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <Users className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-700">8</p>
            <p className="text-sm text-red-600">Poor</p>
          </div>
        </div>

        {/* Top Performers */}
        <div className="mb-6">
          <h5 className="font-medium text-gray-900 mb-3">Top Performing Tenants</h5>
          <div className="space-y-2">
            {[
              { name: 'John Smith', score: 98, onTime: '100%', property: 'Property A' },
              { name: 'Sarah Johnson', score: 95, onTime: '100%', property: 'Property B' },
              { name: 'Michael Brown', score: 92, onTime: '98%', property: 'Property C' },
            ].map((tenant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">{tenant.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-sm text-gray-500">{tenant.property}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{tenant.score}%</p>
                  <p className="text-xs text-gray-500">{tenant.onTime} on-time</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Tenants */}
        <div>
          <h5 className="font-medium text-gray-900 mb-3">At-Risk Tenants (AI Identified)</h5>
          <div className="space-y-2">
            {[
              { name: 'Robert Davis', risk: 85, issues: '3 late payments', property: 'Property D' },
              { name: 'Lisa Wilson', risk: 78, issues: '2 maintenance complaints', property: 'Property E' },
              { name: 'James Taylor', risk: 72, issues: '1 payment dispute', property: 'Property F' },
            ].map((tenant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">{tenant.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-sm text-gray-500">{tenant.property}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{tenant.risk}% Risk</p>
                  <p className="text-xs text-red-500">{tenant.issues}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeReport) {
      case 'overview':
        return renderOverviewReport();
      case 'financial':
        return renderFinancialReport();
      case 'tenants':
        return renderTenantPerformanceReport();
      default:
        return renderOverviewReport();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
              <button
                onClick={() => generateReport(activeReport)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeReport === report.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <report.icon className="w-5 h-5" />
                <span className="font-medium">{report.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminReports;
