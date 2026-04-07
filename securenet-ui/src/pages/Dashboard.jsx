import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiActivity, FiShield, FiAlertTriangle, FiCpu, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { getRequest } from '../utils/api';

const Dashboard = () => {
  const [animatedStats, setAnimatedStats] = useState({
    totalTraffic: 0,
    threatsDetected: 0,
    activeAlerts: 0,
    systemStatus: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  const [backendData, setBackendData] = useState({
    logs: [],
    alerts: [],
    traffic: []
  });

  // Fetch data from all endpoints
  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      setError(null);
      
      // Fetch data from all three endpoints
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
      console.error('Error fetching dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  // Calculate stats from backend data using useMemo
  const targetStats = useMemo(() => ({
    totalTraffic: backendData.traffic.length,
    threatsDetected: backendData.logs.length,
    activeAlerts: backendData.alerts.filter(alert => !alert.dismissed).length,
    systemStatus: Math.max(0, 100 - (backendData.alerts.filter(alert => alert.risk === 'CRITICAL').length * 5))
  }), [backendData]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Animated number increment
  useEffect(() => {
    if (dataLoading) return;
    
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const timer = setInterval(() => {
      setAnimatedStats(prev => {
        const newStats = {};
        Object.keys(targetStats).forEach(key => {
          const diff = targetStats[key] - prev[key];
          if (Math.abs(diff) > 1) {
            newStats[key] = prev[key] + Math.ceil(diff / 10);
          } else {
            newStats[key] = targetStats[key];
          }
        });
        return newStats;
      });
    }, interval);

    // Stop loading after animation
    setTimeout(() => setIsLoading(false), duration);

    return () => clearInterval(timer);
  }, [targetStats, dataLoading]);

  const stats = [
    { 
      title: 'Total Traffic', 
      value: animatedStats.totalTraffic.toLocaleString(), 
      unit: 'packets/sec',
      icon: FiActivity,
      color: 'neon-blue',
      change: '+12%' 
    },
    { 
      title: 'Threats Detected', 
      value: animatedStats.threatsDetected, 
      unit: 'today',
      icon: FiShield,
      color: 'neon-red', 
      change: '+3' 
    },
    { 
      title: 'Active Alerts', 
      value: animatedStats.activeAlerts, 
      unit: 'critical',
      icon: FiAlertTriangle,
      color: 'neon-yellow', 
      change: '-1' 
    },
    { 
      title: 'System Status', 
      value: animatedStats.systemStatus, 
      unit: '%',
      icon: FiCpu,
      color: 'neon-green', 
      change: '+2%' 
    },
  ];

  // Transform backend data for charts
  const trafficData = useMemo(() => {
    if (!backendData.traffic.length) {
      // Default fallback data
      return [
        { time: '00:00', traffic: 1200, threats: 2 },
        { time: '04:00', traffic: 1800, threats: 1 },
        { time: '08:00', traffic: 2400, threats: 4 },
        { time: '12:00', traffic: 2800, threats: 3 },
        { time: '16:00', traffic: 2200, threats: 5 },
        { time: '20:00', traffic: 1900, threats: 2 },
        { time: '23:59', traffic: 2847, threats: 3 },
      ];
    }

    // Group traffic by hour from backend data
    const hourlyTraffic = {};
    backendData.traffic.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!hourlyTraffic[timeLabel]) {
        hourlyTraffic[timeLabel] = { traffic: 0, threats: 0 };
      }
      
      hourlyTraffic[timeLabel].traffic += 1;
      if (entry.status === 'blocked' || entry.status === 'flagged') {
        hourlyTraffic[timeLabel].threats += 1;
      }
    });

    // Convert to array format for Recharts
    return Object.entries(hourlyTraffic).map(([time, data]) => ({
      time,
      traffic: data.traffic,
      threats: data.threats
    })).sort((a, b) => a.time.localeCompare(b.time));
  }, [backendData.traffic]);

  const attackData = useMemo(() => {
    if (!backendData.logs.length) {
      // Default fallback data
      return [
        { type: 'Malware', count: 45, severity: 8 },
        { type: 'Phishing', count: 32, severity: 6 },
        { type: 'DDoS', count: 28, severity: 9 },
        { type: 'SQL Inject', count: 15, severity: 7 },
        { type: 'XSS', count: 22, severity: 5 },
      ];
    }

    // Group logs by attack type
    const attackCounts = {};
    backendData.logs.forEach(log => {
      const attackType = log.attackType || 'Unknown';
      if (!attackCounts[attackType]) {
        attackCounts[attackType] = { count: 0, severity: 0 };
      }
      attackCounts[attackType].count += 1;
      
      // Calculate average severity
      const severityMap = { 'LOW': 2, 'MEDIUM': 5, 'HIGH': 7, 'CRITICAL': 9 };
      const severity = severityMap[log.riskLevel] || 5;
      attackCounts[attackType].severity = (attackCounts[attackType].severity + severity) / 2;
    });

    // Convert to array format for Recharts
    return Object.entries(attackCounts).map(([type, data]) => ({
      name: type,
      count: data.count,
      severity: Math.round(data.severity)
    })).sort((a, b) => b.count - a.count);
  }, [backendData.logs]);

  const recentAlerts = [
    { id: 1, type: 'critical', message: 'Brute force attack detected from IP 192.168.1.105', time: '2 min ago', source: 'Firewall' },
    { id: 2, type: 'warning', message: 'Unusual login pattern detected for user admin', time: '5 min ago', source: 'Auth System' },
    { id: 3, type: 'info', message: 'System backup completed successfully', time: '15 min ago', source: 'Backup Service' },
    { id: 4, type: 'critical', message: 'Malware signature blocked in real-time', time: '1 hour ago', source: 'Antivirus' },
    { id: 5, type: 'warning', message: 'High CPU usage detected on server-03', time: '2 hours ago', source: 'Monitor' },
  ];

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'text-neon-red border-neon-red bg-neon-red/10';
      case 'warning': return 'text-neon-yellow border-neon-yellow bg-neon-yellow/10';
      case 'info': return 'text-neon-blue border-neon-blue bg-neon-blue/10';
      default: return 'text-gray-400 border-gray-400 bg-gray-400/10';
    }
  };

  const ShimmerEffect = () => (
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-neon-red/10 border border-neon-red/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiAlertTriangle className="text-neon-red" size={20} />
              <div>
                <p className="text-neon-red font-semibold">Error Loading Dashboard</p>
                <p className="text-gray-300 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1 bg-neon-red/20 border border-neon-red/30 rounded-lg 
                         text-neon-red hover:bg-neon-red/30 transition-all duration-300 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {dataLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="glass-card p-6 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-gray-600 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-600 rounded-full animate-pulse"></div>
              </div>
              <div className="h-8 w-16 bg-gray-600 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-20 bg-gray-600 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      {!dataLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`
                glass-card p-6 relative overflow-hidden transition-all duration-300 
                hover:scale-105 hover:shadow-2xl hover:shadow-${stat.color}/30
                ${isLoading ? 'animate-pulse' : ''}
              `}
            >
              {isLoading && <ShimmerEffect />}
              
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}/20 border border-${stat.color}/30`}>
                  <Icon size={20} className={`text-${stat.color}`} />
                </div>
                <span className={`text-xs font-semibold text-neon-green neon-text`}>
                  {stat.change}
                </span>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-400 mb-1">{stat.title}</h3>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-3xl font-bold neon-text text-${stat.color}`}>
                    {stat.value}
                  </span>
                  <span className="text-xs text-gray-500">{stat.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* AI Detection Panel */}
      {!dataLoading && !error && (
        <div className="glass-card p-6 neon-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-4 h-4 bg-neon-green rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 bg-neon-green rounded-full animate-ping"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-neon-green neon-text">AI Detection: ACTIVE</h3>
                <p className="text-sm text-gray-400">Advanced threat intelligence running</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Accuracy</div>
              <div className="text-2xl font-bold text-neon-green neon-text">99.7%</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {!dataLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Line Chart */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Network Traffic Overview</h3>
          <div className="h-64 cyber-grid-bg rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 245, 255, 0.1)" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(11, 15, 25, 0.9)', 
                    border: '1px solid rgba(0, 245, 255, 0.3)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="traffic" 
                  stroke="#00F5FF" 
                  strokeWidth={2}
                  dot={{ fill: '#00F5FF', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Traffic (packets/sec)"
                />
                <Line 
                  type="monotone" 
                  dataKey="threats" 
                  stroke="#FF3B3B" 
                  strokeWidth={2}
                  dot={{ fill: '#FF3B3B', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Threats"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Attack Types Distribution</h3>
          <div className="h-64 cyber-grid-bg rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 245, 255, 0.1)" />
                <XAxis dataKey="type" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(11, 15, 25, 0.9)', 
                    border: '1px solid rgba(0, 245, 255, 0.3)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  fill="#22FF88" 
                  name="Occurrences"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="severity" 
                  fill="#FFC857" 
                  name="Severity (1-10)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {!dataLoading && !error && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Alerts</h3>
            <button className="text-sm text-neon-blue hover:text-neon-blue/80 transition-colors">
              View All →
            </button>
          </div>
          
          <div className="space-y-2">
            {recentAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`
                p-4 rounded-lg border transition-all duration-300 cursor-pointer
                hover:bg-white/5 hover:scale-[1.02] hover:shadow-lg
                ${getAlertColor(alert.type)}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${getAlertColor(alert.type).split(' ')[0].replace('text-', 'bg-')} animate-pulse`}></div>
                    <span className="text-xs font-semibold uppercase tracking-wider">{alert.type}</span>
                    <span className="text-xs text-gray-500">• {alert.source}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">{alert.message}</p>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
                <button className="ml-4 text-gray-400 hover:text-white transition-colors">
                  <FiAlertTriangle size={16} />
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
