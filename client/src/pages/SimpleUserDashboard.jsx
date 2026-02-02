import React, { useState } from 'react';

function SimpleUserDashboard() {
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
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            👤
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                User Dashboard
              </h1>
              <span style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: '#d1fae5',
                color: '#065f46'
              }}>
                User
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Your Rental Portal
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
              { id: 'my-rentals', label: 'My Rentals', icon: '🏠' },
              { id: 'payments', label: 'Payments', icon: '💳' },
              { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
              { id: 'documents', label: 'Documents', icon: '📄' },
              { id: 'profile', label: 'Profile', icon: '👤' },
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
                  backgroundColor: activeTab === item.id ? '#ecfdf5' : 'transparent',
                  color: activeTab === item.id ? '#065f46' : '#374151',
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
                Welcome to Your Dashboard! 🎉
              </h2>
              
              {/* User Info Card */}
              <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '32px',
                  color: 'white'
                }}>
                  👤
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                  User Portal Active
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                  Your role-based dashboard is working perfectly!
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

              {/* Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {[
                  { label: 'View Rentals', icon: '🏠', color: '#10b981' },
                  { label: 'Make Payment', icon: '💳', color: '#3b82f6' },
                  { label: 'Request Maintenance', icon: '🔧', color: '#f59e0b' },
                  { label: 'Update Profile', icon: '👤', color: '#8b5cf6' }
                ].map((action, index) => (
                  <button
                    key={index}
                    style={{
                      backgroundColor: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>{action.icon}</span>
                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#374151' }}>
                      {action.label}
                    </span>
                  </button>
                ))}
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
                {activeTab.charAt(0).toUpperCase() + activeTab.replace('-', ' ').slice(1)} Section
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

export default SimpleUserDashboard;
