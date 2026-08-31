import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import OrganizationSwitcher from '../components/OrganizationSwitcher';
import MonitoringControl from '../components/MonitoringControl';
import HealthIndicator from '../components/HealthIndicator';
import RoleGuard from '../components/RoleGuard';
import { useRealtimeAlerts } from '../hooks/useRealtimeAlerts';

/**
 * Enterprise SOC Dashboard
 * 
 * Enhanced dashboard with organization switching, monitoring controls,
 * health indicators, and role-based content.
 */
const EnterpriseDashboard = () => {
  const { user } = useAuth();
  const [currentOrgId, setCurrentOrgId] = useState(null);
  const alerts = useRealtimeAlerts();

  useEffect(() => {
    if (user?.org_id) {
      setCurrentOrgId(user.org_id);
    }
  }, [user]);

  const handleOrgChange = (org) => {
    setCurrentOrgId(org.id);
  };

  const getSeverityColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const recentAlerts = alerts.slice(0, 5);
  const criticalAlerts = alerts.filter(a => a.risk_level === 'critical').length;
  const highAlerts = alerts.filter(a => a.risk_level === 'high').length;
  const totalAlerts = alerts.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">SecureNet SOC</h1>
              <OrganizationSwitcher 
                currentOrgId={currentOrgId} 
                onOrgChange={handleOrgChange}
              />
            </div>
            <div className="flex items-center space-x-4">
              <HealthIndicator />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.email}</p>
                  <p className="text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{totalAlerts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Critical</p>
                <p className="text-3xl font-bold text-red-600">{criticalAlerts}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">High Risk</p>
                <p className="text-3xl font-bold text-orange-600">{highAlerts}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Threats</p>
                <p className="text-3xl font-bold text-purple-600">
                  {alerts.filter(a => a.status === 'open').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monitoring Control */}
            <RoleGuard permission="monitoring.start">
              <MonitoringControl orgId={currentOrgId} />
            </RoleGuard>

            {/* Recent Alerts */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Recent Alerts</h2>
              </div>
              <div className="p-6">
                {recentAlerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent alerts</p>
                ) : (
                  <div className="space-y-4">
                    {recentAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.risk_level)}`}>
                              {alert.risk_level?.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">{alert.attack_type}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {alert.source_ip} → {alert.destination_ip}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <RoleGuard permission="alert.view">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View
                          </button>
                        </RoleGuard>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <RoleGuard permission="report.create">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-700 font-medium">Generate Report</span>
                  </button>
                </RoleGuard>

                <RoleGuard permission="alert.export">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-700 font-medium">Export Alerts</span>
                  </button>
                </RoleGuard>

                <RoleGuard permission="siem.configure">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700 font-medium">SIEM Export</span>
                  </button>
                </RoleGuard>

                <RoleGuard permission="audit.view">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-gray-700 font-medium">View Audit Logs</span>
                  </button>
                </RoleGuard>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ML Model</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Ready
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Threat Intel</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Background Jobs</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Running
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnterpriseDashboard;
