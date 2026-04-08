import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Users,
  Cpu,
  Zap,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { StatCard } from '../components/Card';
import { LineChart } from '../components/Charts/LineChart';
import { PieChart } from '../components/Charts/PieChart';
import { getRequest } from '../api';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendData, setBackendData] = useState({
    logs: [],
    alerts: [],
    traffic: [],
    users: [],
    system: {}
  });

  // Mock data for development
  const mockData = {
    stats: [
      { 
        title: 'Total Attacks', 
        value: '2,847', 
        change: '+12%', 
        icon: AlertTriangle, 
        color: 'danger',
        trend: 'up'
      },
      { 
        title: 'Active IPs', 
        value: '156', 
        change: '+5%', 
        icon: Users, 
        color: 'warning',
        trend: 'up'
      },
      { 
        title: 'Network Load', 
        value: '67%', 
        change: '-3%', 
        icon: Activity, 
        color: 'info',
        trend: 'down'
      },
      { 
        title: 'System Status', 
        value: '98%', 
        change: '+2%', 
        icon: Shield, 
        color: 'success',
        trend: 'up'
      },
    ],
    trafficData: [
      { timestamp: '2024-01-15T00:00:00Z', inbound: 45, outbound: 38 },
      { timestamp: '2024-01-15T04:00:00Z', inbound: 52, outbound: 45 },
      { timestamp: '2024-01-15T08:00:00Z', inbound: 38, outbound: 32 },
      { timestamp: '2024-01-15T12:00:00Z', inbound: 65, outbound: 58 },
      { timestamp: '2024-01-15T16:00:00Z', inbound: 48, outbound: 42 },
      { timestamp: '2024-01-15T20:00:00Z', inbound: 42, outbound: 38 },
    ],
    attackData: [
      { name: 'DDoS', value: 45 },
      { name: 'SQL Injection', value: 30 },
      { name: 'XSS', value: 25 },
      { name: 'Brute Force', value: 20 },
      { name: 'Port Scan', value: 15 },
    ],
    protocolData: [
      { name: 'HTTP', value: 45, percentage: 45 },
      { name: 'HTTPS', value: 30, percentage: 30 },
      { name: 'FTP', value: 15, percentage: 15 },
      { name: 'SSH', value: 10, percentage: 10 },
    ],
    recentAlerts: [
      {
        id: 1,
        type: 'DDoS',
        source: '192.168.1.100',
        message: 'Distributed Denial of Service attack detected from multiple sources',
        severity: 'high',
        timestamp: '2 minutes ago'
      },
      {
        id: 2,
        type: 'SQL Injection',
        source: '10.0.0.1',
        message: 'SQL injection attempt blocked in user authentication',
        severity: 'medium',
        timestamp: '15 minutes ago'
      },
      {
        id: 3,
        type: 'XSS',
        source: '172.16.0.1',
        message: 'Cross-site scripting attempt detected and blocked',
        severity: 'medium',
        timestamp: '1 hour ago'
      },
      {
        id: 4,
        type: 'Port Scan',
        source: '203.0.113.42',
        message: 'Port scanning activity detected on multiple ports',
        severity: 'low',
        timestamp: '2 hours ago'
      },
    ]
  };

  // Calculate threat level
  const threatLevel = useMemo(() => {
    const highThreats = mockData.recentAlerts.filter(alert => alert.severity === 'high').length;
    const mediumThreats = mockData.recentAlerts.filter(alert => alert.severity === 'medium').length;
    
    if (highThreats > 0) return 'high';
    if (mediumThreats > 2) return 'medium';
    return 'low';
  }, [mockData.recentAlerts]);

  // Get threat level configuration
  const getThreatLevelConfig = () => {
    switch (threatLevel) {
      case 'high':
        return {
          bg: 'bg-danger/10',
          border: 'border-danger',
          text: 'text-neon-red',
          label: 'HIGH THREAT',
          icon: AlertTriangle
        };
      case 'medium':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning',
          text: 'text-neon-yellow',
          label: 'MEDIUM THREAT',
          icon: Shield
        };
      default:
        return {
          bg: 'bg-safe/10',
          border: 'border-safe',
          text: 'text-neon-green',
          label: 'LOW THREAT',
          icon: Shield
        };
    }
  };

  const threatConfig = getThreatLevelConfig();

  // Fetch data from backend
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [logsResponse, alertsResponse, trafficResponse] = await Promise.all([
        getRequest('/logs'),
        getRequest('/alerts'),
        getRequest('/traffic')
      ]);

      const logs = logsResponse.logs || logsResponse || [];
      const alerts = alertsResponse.alerts || alertsResponse || [];
      const traffic = trafficResponse.traffic || trafficResponse || [];

      setBackendData({ logs, alerts, traffic });
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setBackendData(prev => ({
        ...prev,
        traffic: prev.traffic.map(item => ({
          ...item,
          inbound: Math.max(20, item.inbound + (Math.random() - 0.5) * 10),
          outbound: Math.max(15, item.outbound + (Math.random() - 0.5) * 8)
        }))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Security Dashboard
          </h1>
          <p className="text-gray-400">
            Real-time network monitoring and threat detection
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="flex items-center space-x-2 p-3 glass-card rounded-lg hover:bg-white/10 transition-all"
        >
          <RefreshCw size={18} className="text-neon-blue" />
          <span className="text-sm text-gray-300">Refresh</span>
        </motion.button>
      </div>

      {/* Threat Level Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`glass-card p-6 border-2 ${threatConfig.bg} ${threatConfig.border}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${threatConfig.bg} ${threatConfig.border}`}
            >
              <threatConfig.icon 
                size={24} 
                className={threatConfig.text} 
              />
            </motion.div>
            
            <div>
              <h3 className={`text-lg font-semibold ${threatConfig.text} mb-1`}>
                {threatConfig.label}
              </h3>
              <p className="text-sm text-gray-400">
                {threatLevel === 'high' && 'Immediate action required'}
                {threatLevel === 'medium' && 'Monitor closely'}
                {threatLevel === 'low' && 'System operating normally'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${threatConfig.text} neon-text`}>
              {mockData.recentAlerts.length}
            </div>
            <div className="text-xs text-gray-400">
              Active Threats
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockData.stats.map((stat, index) => (
          <StatCard
            key={index}
            {...stat}
            loading={isLoading}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <LineChart
          title="Network Traffic"
          subtitle="Real-time traffic monitoring"
          data={mockData.trafficData}
          height={300}
          lines={[
            {
              name: 'Inbound',
              dataKey: 'inbound',
              color: '#22ff88'
            },
            {
              name: 'Outbound',
              dataKey: 'outbound',
              color: '#00f5ff'
            }
          ]}
        />

        {/* Attack Distribution */}
        <PieChart
          title="Attack Distribution"
          subtitle="Security threats by type"
          data={mockData.attackData}
          height={300}
          colors={['#ff3b3b', '#ffc857', '#00f5ff', '#22ff88']}
        />
      </div>

      {/* Recent Alerts Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Recent Alerts
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neon-red rounded-full animate-pulse"></div>
            <span className="text-sm text-neon-red font-medium">
              {mockData.recentAlerts.filter(a => a.severity === 'high').length} Critical
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {mockData.recentAlerts.slice(0, 5).map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:bg-white/5 ${
                alert.severity === 'high' ? 'bg-danger/10 border-danger' :
                alert.severity === 'medium' ? 'bg-warning/10 border-warning' :
                'bg-safe/10 border-safe'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle size={16} className={
                      alert.severity === 'high' ? 'text-neon-red' :
                      alert.severity === 'medium' ? 'text-neon-yellow' : 'text-neon-green'
                    } />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {alert.type}
                    </span>
                    <span className="text-xs text-gray-500">• {alert.source}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">
                    {alert.message}
                  </p>
                  <span className="text-xs text-gray-500">
                    {alert.timestamp}
                  </span>
                </div>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  alert.severity === 'high' ? 'bg-danger/20' :
                  alert.severity === 'medium' ? 'bg-warning/20' : 'bg-safe/20'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === 'high' ? 'bg-neon-red' :
                    alert.severity === 'medium' ? 'bg-neon-yellow' : 'bg-neon-green'
                  } animate-pulse`}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button className="btn-secondary">
            View All Alerts
          </button>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            System Status
          </h3>
          <div className="flex items-center space-x-2">
            <Cpu size={20} className="text-neon-green" />
            <span className="text-sm text-neon-green font-medium">
              All Systems Operational
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-safe/10 rounded-lg border border-safe/30">
            <div className="text-2xl font-bold text-neon-green mb-1">
              99.9%
            </div>
            <div className="text-sm text-gray-400">
              Uptime
            </div>
          </div>
          
          <div className="text-center p-4 bg-info/10 rounded-lg border border-info/30">
            <div className="text-2xl font-bold text-neon-blue mb-1">
              150ms
            </div>
            <div className="text-sm text-gray-400">
              Response Time
            </div>
          </div>
          
          <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/30">
            <div className="text-2xl font-bold text-neon-yellow mb-1">
              2.8TB
            </div>
            <div className="text-sm text-gray-400">
              Data Processed
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
