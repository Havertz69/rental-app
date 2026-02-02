import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Database, Cpu, HardDrive, Wifi, Camera, Key, Lock,
  RefreshCw, Settings, Bell, AlertTriangle, CheckCircle,
  Activity, Zap, TrendingUp, TrendingDown, BarChart3
} from 'lucide-react';

const AdminSystemSettings = () => {
  const [activeTab, setActiveTab] = useState('ai-settings');
  const [notifications, setNotifications] = useState([]);

  const tabs = [
    { id: 'ai-settings', label: 'AI Settings', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system-status', label: 'System Status', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'backup', label: 'Backup & Maintenance', icon: Database },
  ];

  const handleSettingChange = (setting, value) => {
    // Simulate setting change
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: `${setting} updated successfully`
    }]);
  };

  const renderAISettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Configuration</h3>
        
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Payment Risk Analysis</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Risk Threshold</p>
                  <p className="text-sm text-gray-500">Alert when risk exceeds this level</p>
                </div>
                <input
                  type="number"
                  defaultValue="70"
                  min="0"
                  max="100"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleSettingChange('Risk Threshold', e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Prediction Model</p>
                  <p className="text-sm text-gray-500">AI model for payment predictions</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Random Forest</option>
                  <option>Neural Network</option>
                  <option>Gradient Boosting</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Auto-Scoring</p>
                  <p className="text-sm text-gray-500">Automatically score tenant behavior</p>
                </div>
                <button
                  onClick={() => handleSettingChange('Auto-Scoring', 'enabled')}
                  className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Pricing Optimization</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Dynamic Pricing</p>
                  <p className="text-sm text-gray-500">Enable AI-powered pricing suggestions</p>
                </div>
                <button
                  onClick={() => handleSettingChange('Dynamic Pricing', 'enabled')}
                  className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Market Analysis</p>
                  <p className="text-sm text-gray-500">Analyze competitor pricing</p>
                </div>
                <button
                  onClick={() => handleSettingChange('Market Analysis', 'enabled')}
                  className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Price Adjustment Range</p>
                  <p className="text-sm text-gray-500">Maximum adjustment percentage</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="20"
                    defaultValue="10"
                    className="w-32"
                  />
                  <span className="text-sm text-gray-600">±10%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Tenant Behavior Analysis</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Behavior Tracking</p>
                  <p className="text-sm text-gray-500">Monitor tenant activity patterns</p>
                </div>
                <button
                  onClick={() => handleSettingChange('Behavior Tracking', 'enabled')}
                  className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Anomaly Detection</p>
                  <p className="text-sm text-gray-500">Detect unusual behavior patterns</p>
                </div>
                <button
                  onClick={() => handleSettingChange('Anomaly Detection', 'enabled')}
                  className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
        
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Payment Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Payment Reminders</p>
                  <p className="text-sm text-gray-500">Send automated reminders to tenants</p>
                </div>
                <button
                  onClick={() => handleSettingChange('Payment Reminders', 'enabled')}
                  className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Late Payment Alerts</p>
                  <p className="text-sm text-gray-500">Alert admin on late payments</p>
                </div>
                <button
                  onClick={() => handleSettingChange('Late Payment Alerts', 'enabled')}
                  className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Reminder Timing</p>
                  <p className="text-sm text-gray-500">Days before due date</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>3 days</option>
                  <option>5 days</option>
                  <option>7 days</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Maintenance Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">New Request Alerts</p>
                  <p className="text-sm text-gray-500">Notify on new maintenance requests</p>
                </div>
                <button
                  onClick={() => handleSettingChange('New Request Alerts', 'enabled')}
                  className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Completion Notifications</p>
                  <p className="text-sm text-gray-500">Notify when tasks are completed</p>
                </div>
                <button
                  onClick={() => handleSettingChange('Completion Notifications', 'enabled')}
                  className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                </button>
              </div>
            </div>
          </div>

          <div className="pb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">AI Alerts</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Risk Alerts</p>
                  <p className="text-sm text-gray-500">AI-detected high-risk situations</p>
                </div>
                <button
                  onClick={() => handleSettingChange('Risk Alerts', 'enabled')}
                  className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Anomaly Alerts</p>
                  <p className="text-sm text-gray-500">Unusual activity patterns</p>
                </div>
                <button
                  onClick={() => handleSettingChange('Anomaly Alerts', 'enabled')}
                  className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSystemStatus = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
            <Database className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900">Database</h4>
            <p className="text-sm text-green-600 mt-1">Operational</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Uptime:</span>
                <span className="text-green-600 font-medium">99.9%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Size:</span>
                <span className="text-gray-700">2.4 GB</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Connections:</span>
                <span className="text-gray-700">12/50</span>
              </div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
            <Cpu className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900">AI Services</h4>
            <p className="text-sm text-green-600 mt-1">Running</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Models:</span>
                <span className="text-green-600 font-medium">8 Active</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">CPU:</span>
                <span className="text-gray-700">45%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Memory:</span>
                <span className="text-gray-700">3.2 GB</span>
              </div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
            <HardDrive className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900">Storage</h4>
            <p className="text-sm text-green-600 mt-1">Healthy</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Used:</span>
                <span className="text-gray-700">45%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Available:</span>
                <span className="text-gray-700">55 GB</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Backup:</span>
                <span className="text-green-600 font-medium">Current</span>
              </div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
            <Wifi className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900">Network</h4>
            <p className="text-sm text-green-600 mt-1">Stable</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Latency:</span>
                <span className="text-gray-700">12ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Bandwidth:</span>
                <span className="text-gray-700">100 Mbps</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Optimal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8">
          <h4 className="text-md font-medium text-gray-900 mb-4">Performance Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Response Time</span>
                <TrendingDown className="w-4 h-4 text-green-600" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">Average: 245ms (Target: &lt; 300ms)</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Error Rate</span>
                <TrendingDown className="w-4 h-4 text-green-600" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '2%' }}></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">2% (Target: &lt; 5%)</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Throughput</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">1,250 req/min (Target: 1,500)</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">6.8 GB / 10 GB</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'ai-settings':
        return renderAISettings();
      case 'notifications':
        return renderNotifications();
      case 'system-status':
        return renderSystemStatus();
      default:
        return renderAISettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
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

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {notification.message}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminSystemSettings;
