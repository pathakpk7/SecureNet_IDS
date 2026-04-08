import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Plus, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { getRequest } from '../api';

const Firewall = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firewallData, setFirewallData] = useState({
    rules: [],
    status: 'active',
    logs: [],
    stats: {
      blocked: 0,
      allowed: 0,
      total: 0
    }
  });

  // Mock data for development
  const mockData = {
    rules: [
      {
        id: 1,
        name: 'Block DDoS Attacks',
        type: 'block',
        protocol: 'TCP',
        port: '80',
        source: 'any',
        destination: 'any',
        action: 'drop',
        enabled: true,
        priority: 'high',
        description: 'Block all incoming DDoS traffic on port 80',
        created: '2024-01-15 10:00:00',
        lastTriggered: '2024-01-15 14:32:15',
        triggered: 156
      },
      {
        id: 2,
        name: 'Block SQL Injection',
        type: 'block',
        protocol: 'TCP',
        port: '3306',
        source: 'any',
        destination: 'any',
        action: 'drop',
        enabled: true,
        priority: 'high',
        description: 'Block SQL injection attempts on database port',
        created: '2024-01-15 09:30:00',
        lastTriggered: '2024-01-15 14:28:42',
        triggered: 89
      },
      {
        id: 3,
        name: 'Allow HTTPS Traffic',
        type: 'allow',
        protocol: 'TCP',
        port: '443',
        source: 'any',
        destination: 'any',
        action: 'accept',
        enabled: true,
        priority: 'medium',
        description: 'Allow secure HTTPS traffic on port 443',
        created: '2024-01-15 08:00:00',
        lastTriggered: '2024-01-15 14:15:33',
        triggered: 2341
      },
      {
        id: 4,
        name: 'Block Suspicious IPs',
        type: 'block',
        protocol: 'any',
        port: 'any',
        source: '192.168.1.0/24',
        destination: 'any',
        action: 'drop',
        enabled: true,
        priority: 'medium',
        description: 'Block traffic from suspicious IP ranges',
        created: '2024-01-15 11:45:00',
        lastTriggered: '2024-01-15 14:05:18',
        triggered: 45
      },
      {
        id: 5,
        name: 'Allow SSH from Admin',
        type: 'allow',
        protocol: 'TCP',
        port: '22',
        source: '192.168.1.50',
        destination: 'any',
        action: 'accept',
        enabled: true,
        priority: 'low',
        description: 'Allow SSH access from admin workstation',
        created: '2024-01-15 07:00:00',
        lastTriggered: '2024-01-15 13:30:45',
        triggered: 12
      },
    ],
    logs: [
      {
        id: 1,
        timestamp: '2024-01-15 14:32:15',
        type: 'BLOCK',
        rule: 'Block DDoS Attacks',
        source: '192.168.1.100',
        destination: 'Web Server',
        details: 'Dropped packet - DDoS pattern detected',
        severity: 'high'
      },
      {
        id: 2,
        timestamp: '2024-01-15 14:28:42',
        type: 'BLOCK',
        rule: 'Block SQL Injection',
        source: '10.0.0.1',
        destination: 'Database',
        details: 'SQL injection attempt blocked - rule #2',
        severity: 'high'
      },
      {
        id: 3,
        timestamp: '2024-01-15 14:15:33',
        type: 'ALLOW',
        rule: 'Allow HTTPS Traffic',
        source: '203.0.113.42',
        destination: 'Web Application',
        details: 'HTTPS connection established - rule #3',
        severity: 'low'
      },
      {
        id: 4,
        timestamp: '2024-01-15 14:05:18',
        type: 'BLOCK',
        rule: 'Block Suspicious IPs',
        source: '198.51.100.42',
        destination: 'Firewall',
        details: 'Traffic blocked from suspicious IP - rule #4',
        severity: 'medium'
      },
    ],
    stats: {
      blocked: 156,
      allowed: 2341,
      total: 2497
    }
  };

  useEffect(() => {
    const fetchFirewallData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setFirewallData(mockData);
      } catch (err) {
        setError(err.message || 'Failed to fetch firewall data');
        console.error('Firewall data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFirewallData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      // Simulate real-time firewall data updates
      setFirewallData(prev => ({
        ...prev,
        logs: [
          ...prev.logs.slice(1),
          Math.random() > 0.7 ? {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            type: Math.random() > 0.5 ? 'BLOCK' : 'ALLOW',
            rule: prev.rules[Math.floor(Math.random() * prev.rules.length)]?.name || 'Unknown',
            source: `192.168.1.${Math.floor(Math.random() * 255)}`,
            destination: 'Web Server',
            details: Math.random() > 0.5 ? 'Malicious pattern detected' : 'Normal traffic',
            severity: Math.random() > 0.5 ? 'high' : 'low'
          } : null
        ].filter(Boolean),
        stats: {
          ...prev.stats,
          blocked: prev.stats.blocked + (Math.random() > 0.8 ? 1 : 0),
          allowed: prev.stats.allowed + (Math.random() > 0.3 ? 2 : 0),
          total: prev.stats.total + 1
        }
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    // Refetch firewall data
    setFirewallData(mockData);
  };

  const handleToggleRule = (ruleId) => {
    setFirewallData(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    }));
  };

  const handleAddRule = () => {
    const newRule = {
      id: Date.now(),
      name: 'New Firewall Rule',
      type: 'block',
      protocol: 'TCP',
      port: '8080',
      source: 'any',
      destination: 'any',
      action: 'drop',
      enabled: false,
      priority: 'medium',
      description: 'Block traffic on port 8080',
      created: new Date().toISOString(),
      lastTriggered: null,
      triggered: 0
    };

    setFirewallData(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
  };

  const handleDeleteRule = (ruleId) => {
    setFirewallData(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId)
    }));
  };

  const getRuleTypeColor = (type) => {
    switch (type) {
      case 'block':
        return 'text-red-500';
      case 'allow':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'BLOCK':
        return 'text-red-500';
      case 'ALLOW':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  const getLogSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Firewall Management
          </h1>
          <p className="text-gray-400">
            Configure and monitor firewall rules and traffic
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <Shield size={20} className={`${
              firewallData.status === 'active' ? 'text-neon-green' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              firewallData.status === 'active' ? 'text-neon-green' : 'text-gray-400'
            }`}>
              {firewallData.status.toUpperCase()}
            </span>
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
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Firewall Statistics
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-blue neon-text">
                {firewallData.stats.total}
              </div>
              <div className="text-sm text-gray-400">
                Total Rules
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-green neon-text">
                {firewallData.stats.allowed}
              </div>
              <div className="text-sm text-gray-400">
                Allowed Traffic
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-red neon-text">
                {firewallData.stats.blocked}
              </div>
              <div className="text-sm text-gray-400">
                Blocked Traffic
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Traffic Analysis
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Success Rate</span>
              <span className="text-2xl font-bold text-neon-green">
                {((firewallData.stats.allowed / firewallData.stats.total) * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Block Rate</span>
              <span className="text-2xl font-bold text-neon-red">
                {((firewallData.stats.blocked / firewallData.stats.total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Firewall Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Firewall Rules
          </h3>
          
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={handleAddRule}
              className="btn-primary"
            >
              <Plus size={18} />
              <span>Add Rule</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Rule
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Protocol
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Port
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Source
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Destination
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Priority
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Triggered
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {firewallData.rules.map((rule, index) => (
                <motion.tr
                  key={rule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all duration-300"
                >
                  <td className="py-3 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule.id)}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 bg-gray-600 rounded-full transition-colors duration-200 relative ${
                        rule.enabled ? 'bg-green-500' : 'bg-gray-600'
                      }`}>
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                            rule.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></div>
                      </div>
                    </label>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${getRuleTypeColor(rule.type)}`}>
                      {rule.name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300">
                      {rule.protocol}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300">
                      {rule.port}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300">
                      {rule.source}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300">
                      {rule.destination}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${getPriorityColor(rule.priority)}`}>
                      {rule.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300">
                      {rule.triggered}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Lock size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Recent Firewall Logs
        </h3>
        
        <div className="space-y-2">
          {firewallData.logs.slice(0, 10).map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-lg border transition-all duration-300 hover:bg-white/5 ${getLogSeverityColor(log.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle size={16} className={getLogSeverityColor(log.type)} />
                  <span className={`text-xs font-semibold uppercase tracking-wider text-gray-400`}>
                    {log.type}
                  </span>
                  <span className="text-xs text-gray-500">• {log.source}</span>
                </div>
                <p className="text-sm text-gray-300 mb-1">
                  {log.details}
                </p>
                <span className="text-xs text-gray-500">
                  {log.timestamp}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <button className="btn-secondary">
            View All Logs
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Firewall;
