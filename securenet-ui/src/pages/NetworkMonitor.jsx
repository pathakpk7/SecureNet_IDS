import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Globe, Zap, RefreshCw } from 'lucide-react';
import { LineChart, TrafficChart } from '../components/Charts/LineChart';
import { PieChart, ProtocolChart } from '../components/Charts/PieChart';
import { getRequest } from '../api';

const NetworkMonitor = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkData, setNetworkData] = useState({
    traffic: [],
    protocols: [],
    connections: [],
    bandwidth: []
  });

  // Mock data for development
  const mockData = {
    traffic: [
      { timestamp: '2024-01-15T00:00:00Z', inbound: 45, outbound: 38, total: 83 },
      { timestamp: '2024-01-15T01:00:00Z', inbound: 52, outbound: 45, total: 97 },
      { timestamp: '2024-01-15T02:00:00Z', inbound: 38, outbound: 32, total: 70 },
      { timestamp: '2024-01-15T03:00:00Z', inbound: 65, outbound: 58, total: 123 },
      { timestamp: '2024-01-15T04:00:00Z', inbound: 48, outbound: 42, total: 90 },
      { timestamp: '2024-01-15T05:00:00Z', inbound: 42, outbound: 38, total: 80 },
    ],
    protocols: [
      { name: 'HTTP', value: 45, percentage: 45 },
      { name: 'HTTPS', value: 30, percentage: 30 },
      { name: 'FTP', value: 15, percentage: 15 },
      { name: 'SSH', value: 10, percentage: 10 },
    ],
    connections: [
      { ip: '192.168.1.100', country: 'US', status: 'active', protocol: 'HTTPS', bandwidth: '15.2 MB/s' },
      { ip: '10.0.0.1', country: 'CN', status: 'active', protocol: 'HTTP', bandwidth: '8.7 MB/s' },
      { ip: '172.16.0.1', country: 'DE', status: 'suspicious', protocol: 'SSH', bandwidth: '2.1 MB/s' },
      { ip: '203.0.113.42', country: 'JP', status: 'active', protocol: 'HTTP', bandwidth: '12.3 MB/s' },
      { ip: '185.199.108.153', country: 'RU', status: 'blocked', protocol: 'HTTP', bandwidth: '0 MB/s' },
    ],
    bandwidth: [
      { time: '00:00', inbound: 45, outbound: 38 },
      { time: '04:00', inbound: 52, outbound: 45 },
      { time: '08:00', inbound: 38, outbound: 32 },
      { time: '12:00', inbound: 65, outbound: 58 },
      { time: '16:00', inbound: 48, outbound: 42 },
      { time: '20:00', inbound: 42, outbound: 38 },
    ]
  };

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setNetworkData(mockData);
      } catch (err) {
        setError(err.message || 'Failed to fetch network data');
        console.error('Network data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworkData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setNetworkData(prev => ({
        ...prev,
        traffic: prev.traffic.map(item => ({
          ...item,
          inbound: Math.max(20, item.inbound + (Math.random() - 0.5) * 10),
          outbound: Math.max(15, item.outbound + (Math.random() - 0.5) * 8),
          total: item.inbound + item.outbound
        }))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    // Refetch network data
    setNetworkData(mockData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-neon-green';
      case 'suspicious':
        return 'text-neon-yellow';
      case 'blocked':
        return 'text-neon-red';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active':
        return 'bg-safe/10';
      case 'suspicious':
        return 'bg-warning/10';
      case 'blocked':
        return 'bg-danger/10';
      default:
        return 'bg-gray-600/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Network Monitor
          </h1>
          <p className="text-gray-400">
            Real-time network traffic analysis and monitoring
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity size={24} className="text-neon-blue" />
            <h3 className="text-lg font-semibold text-white">
              Active Connections
            </h3>
          </div>
          <div className="text-3xl font-bold text-neon-blue neon-text">
            {networkData.connections.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-gray-400">
            Currently active
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap size={24} className="text-neon-yellow" />
            <h3 className="text-lg font-semibold text-white">
              Suspicious Activity
            </h3>
          </div>
          <div className="text-3xl font-bold text-neon-yellow neon-text">
            {networkData.connections.filter(c => c.status === 'suspicious').length}
          </div>
          <div className="text-sm text-gray-400">
            Requires attention
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Globe size={24} className="text-neon-green" />
            <h3 className="text-lg font-semibold text-white">
              Total Bandwidth
            </h3>
          </div>
          <div className="text-3xl font-bold text-neon-green neon-text">
            156.7 MB/s
          </div>
          <div className="text-sm text-gray-400">
            Combined usage
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Traffic Chart */}
        <TrafficChart data={networkData.traffic} />

        {/* Protocol Distribution */}
        <ProtocolChart data={networkData.protocols} />
      </div>

      {/* Active Connections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">
          Active Connections
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  IP Address
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Country
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Protocol
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Bandwidth
                </th>
              </tr>
            </thead>
            <tbody>
              {networkData.connections.map((connection, index) => (
                <motion.tr
                  key={connection.ip}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all duration-300"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-neon-blue">
                      {connection.ip}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300">
                      {connection.country}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${getStatusColor(connection.status)}`}>
                      {connection.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300">
                      {connection.protocol}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300">
                      {connection.bandwidth}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Bandwidth Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">
          Bandwidth Usage
        </h3>
        
        <div className="h-64 cyber-grid-bg rounded-lg p-2">
          <svg className="w-full h-full" viewBox="0 0 300 200">
            {/* Grid lines */}
            {[...Array(6)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 40}
                x2="300"
                y2={i * 40}
                stroke="rgba(0, 245, 255, 0.1)"
                strokeWidth="1"
              />
            ))}
            
            {/* Inbound bandwidth */}
            <polyline
              fill="none"
              stroke="#22ff88"
              strokeWidth="2"
              points={networkData.bandwidth.map((item, index) => 
                `${index * 50},${200 - item.inbound * 2}`
              ).join(' ')}
            />
            
            {/* Outbound bandwidth */}
            <polyline
              fill="none"
              stroke="#00f5ff"
              strokeWidth="2"
              points={networkData.bandwidth.map((item, index) => 
                `${index * 50},${200 - item.outbound * 2}`
              ).join(' ')}
            />
            
            {/* Legend */}
            <text x="10" y="20" fill="#22ff88" fontSize="12">
              Inbound
            </text>
            <text x="10" y="40" fill="#00f5ff" fontSize="12">
              Outbound
            </text>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default NetworkMonitor;
