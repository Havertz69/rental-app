import React, { useState } from 'react';

function SimpleAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                Admin Dashboard
              </h1>
              <span style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: '#dbeafe',
                color: '#1e40af'
              }}>
                Administrator
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              System Control Center
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          minHeight: 'calc(100vh - 73px)'
        }}>
          <nav style={{ padding: '16px 0' }}>
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'User Management', icon: '👥' },
              { id: 'properties', label: 'Properties', icon: '🏢' },
              { id: 'payments', label: 'Payments', icon: '💳' },
              { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
              { id: 'reports', label: 'Reports', icon: '📈' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: 'none',
                  backgroundColor: activeTab === item.id ? '#eff6ff' : 'transparent',
                  color: activeTab === item.id ? '#1e40af' : '#374151',
                  fontSize: '14px',
                  fontWeight: activeTab === item.id ? '500' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '24px' }}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
                Dashboard Overview
              </h2>
              
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                  { label: 'Total Users', value: '0', icon: '👥', color: '#3b82f6' },
                  { label: 'Properties', value: '0', icon: '🏢', color: '#10b981' },
                  { label: 'Revenue', value: '$0', icon: '💰', color: '#f59e0b' },
                  { label: 'Active Tenants', value: '0', icon: '🏠', color: '#8b5cf6' }
                ].map((stat, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{stat.label}</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Welcome Message */}
              <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
                  Welcome to Admin Dashboard! 🎉
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                  The navigation is working! You can now access the admin dashboard.
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  ✅ Navigation Working
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h3>
              <p style={{ color: '#6b7280' }}>
                This section is ready for implementation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SimpleAdminDashboard;
