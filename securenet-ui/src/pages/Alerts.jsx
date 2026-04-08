import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Activity, Filter, Search, RefreshCw } from 'lucide-react';
import AlertTable from '../components/AlertTable';
import { getRequest } from '../api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for development
  const mockAlerts = [
    {
      id: 1,
      type: 'DDoS',
      source: '192.168.1.100',
      message: 'Distributed Denial of Service attack detected from multiple sources',
      severity: 'high',
      timestamp: '2024-01-15 14:32:15',
      target: 'Web Server',
      duration: '5 minutes'
    },
    {
      id: 2,
      type: 'SQL Injection',
      source: '10.0.0.1',
      message: 'SQL injection attempt blocked in user authentication',
      severity: 'medium',
      timestamp: '2024-01-15 14:28:42',
      target: 'Database Server',
      duration: '2 minutes'
    },
    {
      id: 3,
      type: 'XSS',
      source: '172.16.0.1',
      message: 'Cross-site scripting attempt detected and blocked',
      severity: 'medium',
      timestamp: '2024-01-15 14:15:33',
      target: 'Web Application',
      duration: '1 minute'
    },
    {
      id: 4,
      type: 'Port Scan',
      source: '203.0.113.42',
      message: 'Port scanning activity detected on multiple ports',
      severity: 'low',
      timestamp: '2024-01-15 14:05:18',
      target: 'Firewall',
      duration: '3 minutes'
    },
    {
      id: 5,
      type: 'Brute Force',
      source: '198.51.100.42',
      message: 'Multiple failed login attempts detected',
      severity: 'medium',
      timestamp: '2024-01-15 13:45:22',
      target: 'SSH Server',
      duration: '10 minutes'
    },
  ];

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAlerts(mockAlerts);
      } catch (err) {
        setError(err.message || 'Failed to fetch alerts');
        console.error('Alerts fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // Set up real-time updates
    const interval = setInterval(() => {
      // Simulate new alerts
      const newAlert = {
        id: Date.now(),
        type: ['DDoS', 'SQL Injection', 'XSS', 'Port Scan', 'Brute Force'][Math.floor(Math.random() * 5)],
        source: `192.168.1.${Math.floor(Math.random() * 255)}`,
        message: 'New security threat detected',
        severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        timestamp: 'Just now',
        target: 'System',
        duration: 'Ongoing'
      };

      if (Math.random() > 0.8) {
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    // Refetch alerts
    setAlerts(mockAlerts);
  };

  const handleExport = () => {
    // Export alerts to CSV
    const csv = [
      ['ID', 'Type', 'Source', 'Message', 'Severity', 'Timestamp'],
      ...alerts.map(alert => [
        alert.id,
        alert.type,
        alert.source,
        alert.message,
        alert.severity,
        alert.timestamp
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Security Alerts
          </h1>
          <p className="text-gray-400">
            Real-time threat detection and monitoring
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-neon-red rounded-full animate-pulse"></div>
            <span className="text-neon-red font-medium">
              {alerts.filter(a => a.severity === 'high').length} Critical
            </span>
          </div>
          
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 p-3 glass-card rounded-lg hover:bg-white/10 transition-all"
          >
            <RefreshCw size={18} className="text-neon-blue" />
            <span className="text-sm text-gray-300">Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert Table */}
      <AlertTable
        alerts={alerts}
        loading={loading}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Alert Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Alerts</span>
              <span className="text-2xl font-bold text-neon-blue">
                {alerts.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">High Severity</span>
              <span className="text-2xl font-bold text-neon-red">
                {alerts.filter(a => a.severity === 'high').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Medium Severity</span>
              <span className="text-2xl font-bold text-neon-yellow">
                {alerts.filter(a => a.severity === 'medium').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Low Severity</span>
              <span className="text-2xl font-bold text-neon-green">
                {alerts.filter(a => a.severity === 'low').length}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, index) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  alert.severity === 'high' ? 'bg-danger/10 border-danger' :
                  alert.severity === 'medium' ? 'bg-warning/10 border-warning' :
                  'bg-safe/10 border-safe'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle size={16} className={
                        alert.severity === 'high' ? 'text-neon-red' :
                        alert.severity === 'medium' ? 'text-neon-yellow' : 'text-neon-green'
                      } />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {alert.type}
                      </span>
                      <span className="text-xs text-gray-500">• {alert.source}</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      {alert.message}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {alert.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
