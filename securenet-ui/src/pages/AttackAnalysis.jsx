import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Shield, 
  AlertTriangle,
  Activity,
  Globe,
  RefreshCw
} from 'lucide-react';
import { BarChart, AttackBarChart } from '../components/Charts/BarChart';
import { getRequest } from '../api';

const AttackAnalysis = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attackData, setAttackData] = useState({
    timeline: [],
    patterns: [],
    topAttackers: [],
    heatmap: [],
    predictions: []
  });

  // Mock data for development
  const mockData = {
    timeline: [
      { timestamp: '2024-01-15 14:30:00', type: 'DDoS', severity: 'high', source: '192.168.1.100', target: 'Web Server', blocked: true },
      { timestamp: '2024-01-15 14:25:00', type: 'SQL Injection', severity: 'medium', source: '10.0.0.1', target: 'Database', blocked: true },
      { timestamp: '2024-01-15 14:20:00', type: 'XSS', severity: 'medium', source: '172.16.0.1', target: 'Web App', blocked: true },
      { timestamp: '2024-01-15 14:15:00', type: 'Port Scan', severity: 'low', source: '203.0.113.42', target: 'Firewall', blocked: false },
      { timestamp: '2024-01-15 14:10:00', type: 'Brute Force', severity: 'medium', source: '198.51.100.42', target: 'SSH Server', blocked: true },
    ],
    patterns: [
      { type: 'DDoS', count: 45, trend: 'up', percentage: 12 },
      { type: 'SQL Injection', count: 30, trend: 'down', percentage: -8 },
      { type: 'XSS', count: 25, trend: 'up', percentage: 5 },
      { type: 'Brute Force', count: 20, trend: 'stable', percentage: 0 },
      { type: 'Port Scan', count: 15, trend: 'down', percentage: -6 },
    ],
    topAttackers: [
      { ip: '192.168.1.100', country: 'US', attacks: 156, lastSeen: '2 hours ago', severity: 'high' },
      { ip: '203.0.113.42', country: 'JP', attacks: 89, lastSeen: '5 hours ago', severity: 'medium' },
      { ip: '172.16.0.1', country: 'DE', attacks: 67, lastSeen: '1 day ago', severity: 'medium' },
      { ip: '198.51.100.42', country: 'RU', attacks: 45, lastSeen: '3 days ago', severity: 'high' },
      { ip: '185.199.108.153', country: 'CN', attacks: 23, lastSeen: '1 week ago', severity: 'low' },
    ],
    heatmap: [
      { hour: '00:00', attacks: 5 },
      { hour: '04:00', attacks: 8 },
      { hour: '08:00', attacks: 15 },
      { hour: '12:00', attacks: 22 },
      { hour: '16:00', attacks: 18 },
      { hour: '20:00', attacks: 12 },
      { hour: '23:00', attacks: 6 },
    ],
    predictions: [
      { type: 'DDoS', probability: 85, timeWindow: 'Next 2 hours', confidence: 'High' },
      { type: 'SQL Injection', probability: 72, timeWindow: 'Next 6 hours', confidence: 'Medium' },
      { type: 'XSS', probability: 68, timeWindow: 'Next 4 hours', confidence: 'Medium' },
      { type: 'Brute Force', probability: 45, timeWindow: 'Next 8 hours', confidence: 'Low' },
    ]
  };

  useEffect(() => {
    const fetchAttackData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAttackData(mockData);
      } catch (err) {
        setError(err.message || 'Failed to fetch attack data');
        console.error('Attack data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttackData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setAttackData(prev => ({
        ...prev,
        timeline: [
          ...prev.timeline.slice(1),
          {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            type: ['DDoS', 'SQL Injection', 'XSS', 'Port Scan', 'Brute Force'][Math.floor(Math.random() * 5)],
            severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
            source: `192.168.1.${Math.floor(Math.random() * 255)}`,
            target: 'Web Server',
            blocked: Math.random() > 0.5
          }
        ],
        heatmap: prev.heatmap.map(item => ({
          ...item,
          attacks: Math.max(0, item.attacks + (Math.random() - 0.5) * 5)
        }))
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    // Refetch attack data
    setAttackData(mockData);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-neon-red';
      case 'medium':
        return 'text-neon-yellow';
      case 'low':
        return 'text-neon-green';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'High':
        return 'text-neon-green';
      case 'Medium':
        return 'text-neon-yellow';
      case 'Low':
        return 'text-neon-red';
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
            Attack Analysis
          </h1>
          <p className="text-gray-400">
            Deep insights into security threats and attack patterns
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

      {/* Attack Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Recent Attack Timeline
        </h3>
        
        <div className="space-y-3">
          {attackData.timeline.slice(0, 5).map((attack, index) => (
            <motion.div
              key={attack.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-lg border transition-all duration-300 hover:bg-white/5 ${
                attack.severity === 'high' ? 'bg-danger/10 border-danger' :
                attack.severity === 'medium' ? 'bg-warning/10 border-warning' :
                'bg-safe/10 border-safe'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle size={16} className={getSeverityColor(attack.severity)} />
                    <span className={`text-xs font-semibold uppercase tracking-wider text-gray-400`}>
                      {attack.type}
                    </span>
                    <span className="text-xs text-gray-500">• {attack.source}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">
                    {attack.message}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Target: {attack.target}</span>
                    <span>• {attack.timestamp}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {attack.blocked ? (
                    <div className="flex items-center space-x-1">
                      <Shield size={16} className="text-neon-green" />
                      <span className="text-sm text-neon-green">Blocked</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <Activity size={16} className="text-neon-yellow" />
                      <span className="text-sm text-neon-yellow">Active</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Attack Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Attack Patterns
          </h3>
          
          <div className="space-y-3">
            {attackData.patterns.map((pattern, index) => {
              const TrendIcon = getTrendIcon(pattern.trend);
              return (
                <motion.div
                  key={pattern.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 size={20} className="text-neon-blue" />
                    <div>
                      <div className="text-sm font-medium text-white">{pattern.type}</div>
                      <div className="text-xs text-gray-400">{pattern.count} attacks</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <TrendIcon size={16} className={pattern.trend === 'up' ? 'text-neon-green' : 'text-neon-red'} />
                    <span className={`text-sm font-medium ${pattern.trend === 'up' ? 'text-neon-green' : 'text-neon-red'}`}>
                      {pattern.percentage > 0 ? '+' : ''}{pattern.percentage}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Attackers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Top Attackers
          </h3>
          
          <div className="space-y-3">
            {attackData.topAttackers.map((attacker, index) => (
              <motion.div
                key={attacker.ip}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Globe size={20} className="text-neon-blue" />
                  <div>
                    <div className="text-sm font-medium text-white">{attacker.ip}</div>
                    <div className="text-xs text-gray-400">{attacker.country}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{attacker.attacks}</div>
                  <div className="text-xs text-gray-400">attacks</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(attacker.severity)}`}>
                    {attacker.severity}
                  </div>
                  <div className="text-xs text-gray-500">
                    {attacker.lastSeen}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Attack Heatmap (24 Hours)
        </h3>
        
        <div className="grid grid-cols-6 gap-2">
          {attackData.heatmap.map((hour, index) => (
            <motion.div
              key={hour.hour}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-3 rounded-lg text-center transition-all duration-300 hover:scale-105 ${
                hour.attacks > 15 ? 'bg-danger/20' :
                hour.attacks > 8 ? 'bg-warning/10' :
                hour.attacks > 3 ? 'bg-info/10' :
                'bg-safe/10'
              }`}
            >
              <div className="text-xs text-gray-400 mb-1">
                {hour.hour}
              </div>
              <div className={`text-lg font-bold neon-text ${
                hour.attacks > 15 ? 'text-neon-red' :
                hour.attacks > 8 ? 'text-neon-yellow' :
                hour.attacks > 3 ? 'text-neon-blue' : 'text-neon-green'
              }`}>
                {hour.attacks}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          AI Threat Predictions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attackData.predictions.map((prediction, index) => (
            <motion.div
              key={prediction.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-white">{prediction.type}</div>
                  <div className="text-xs text-gray-400">{prediction.timeWindow}</div>
                </div>
                
                <div className={`text-right px-3 py-1 rounded-full ${getConfidenceColor(prediction.confidence)}`}>
                  {prediction.probability}%
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Confidence</div>
                  <div className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AttackAnalysis;
