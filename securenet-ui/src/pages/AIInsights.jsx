import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  RefreshCw,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { LineChart, PerformanceChart } from '../components/Charts/LineChart';
import { PieChart, SeverityChart } from '../components/Charts/PieChart';
import { getRequest } from '../api';

const AIInsights = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiData, setAiData] = useState({
    confidence: 0,
    patterns: [],
    anomalies: [],
    predictions: [],
    modelStatus: 'active'
  });

  // Mock data for development
  const mockData = {
    confidence: 87.5,
    patterns: [
      { type: 'DDoS Pattern', confidence: 92, frequency: 45 },
      { type: 'SQL Injection Pattern', confidence: 88, frequency: 30 },
      { type: 'Port Scan Pattern', confidence: 85, frequency: 25 },
      { type: 'Brute Force Pattern', confidence: 90, frequency: 20 },
      { type: 'XSS Pattern', confidence: 82, frequency: 15 },
    ],
    anomalies: [
      {
        id: 1,
        type: 'Unusual Traffic Spike',
        severity: 'medium',
        description: 'Traffic increased by 300% from baseline',
        timestamp: '2024-01-15 14:32:15',
        confidence: 75
      },
      {
        id: 2,
        type: 'Suspicious User Behavior',
        severity: 'high',
        description: 'Multiple failed login attempts from different IP ranges',
        timestamp: '2024-01-15 14:28:42',
        confidence: 89
      },
      {
        id: 3,
        type: 'Data Exfiltration Attempt',
        severity: 'critical',
        description: 'Large data transfer detected to external IP',
        timestamp: '2024-01-15 14:15:33',
        confidence: 95
      },
      {
        id: 4,
        type: 'Protocol Anomaly',
        severity: 'low',
        description: 'Unusual protocol usage detected in internal network',
        timestamp: '2024-01-15 14:08:21',
        confidence: 68
      },
    ],
    predictions: [
      { type: 'DDoS Attack', probability: 85, timeWindow: 'Next 2 hours', confidence: 'High' },
      { type: 'SQL Injection', probability: 72, timeWindow: 'Next 6 hours', confidence: 'Medium' },
      { type: 'XSS Attack', probability: 68, timeWindow: 'Next 4 hours', confidence: 'Medium' },
      { type: 'Port Scan', probability: 45, timeWindow: 'Next 8 hours', confidence: 'Low' },
    ],
    performance: [
      { time: '00:00', cpu: 45, memory: 62 },
      { time: '04:00', cpu: 38, memory: 58 },
      { time: '08:00', cpu: 52, memory: 67 },
      { time: '12:00', cpu: 48, memory: 71 },
      { time: '16:00', cpu: 42, memory: 65 },
      { time: '20:00', cpu: 35, memory: 58 },
    ]
  };

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAiData(mockData);
      } catch (err) {
        setError(err.message || 'Failed to fetch AI insights');
        console.error('AI insights fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAIInsights();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      // Simulate real-time AI data updates
      setAiData(prev => ({
        ...prev,
        confidence: Math.min(99.9, prev.confidence + (Math.random() - 0.5) * 0.5),
        anomalies: [
          ...prev.anomalies.slice(1),
          Math.random() > 0.7 ? {
            id: Date.now(),
            type: ['Unusual Traffic Spike', 'Suspicious User Behavior', 'Data Exfiltration Attempt', 'Protocol Anomaly'][Math.floor(Math.random() * 4)],
            severity: ['medium', 'high', 'critical', 'low'][Math.floor(Math.random() * 4)],
            description: 'New anomaly detected by AI system',
            timestamp: new Date().toLocaleString(),
            confidence: Math.floor(Math.random() * 30) + 70
          } : null
        ].filter(Boolean)
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    // Refetch AI insights
    setAiData(mockData);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-neon-green';
    if (confidence >= 75) return 'text-neon-blue';
    if (confidence >= 60) return 'text-neon-yellow';
    return 'text-neon-red';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10';
      case 'high':
        return 'bg-red-400/10';
      case 'medium':
        return 'bg-yellow-500/10';
      case 'low':
        return 'bg-blue-400/10';
      default:
        return 'bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Insights
          </h1>
          <p className="text-gray-400">
            Machine learning analysis and threat predictions
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

      {/* Model Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Brain size={32} className="text-neon-blue neon-text" />
            <div>
              <h3 className="text-xl font-semibold text-white">
                AI Model Status
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
                <span className="text-neon-green font-medium">Active</span>
              </div>
              <div className="text-sm text-gray-400">
                Processing {aiData.anomalies.length} anomalies
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-neon-blue neon-text">
              {aiData.confidence.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">
              Confidence Score
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-safe/10 rounded-lg border border-safe/30">
            <div className="text-2xl font-bold text-neon-green mb-1">
              156
            </div>
            <div className="text-sm text-gray-400">
              Patterns Detected
            </div>
          </div>
          
          <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/30">
            <div className="text-2xl font-bold text-neon-yellow mb-1">
              23
            </div>
            <div className="text-sm text-gray-400">
              Anomalies Found
            </div>
          </div>
          
          <div className="text-center p-4 bg-info/10 rounded-lg border border-info/30">
            <div className="text-2xl font-bold text-neon-blue mb-1">
              4
            </div>
            <div className="text-sm text-gray-400">
              Active Predictions
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI Performance Chart */}
        <PerformanceChart data={mockData.performance} />

        {/* Pattern Recognition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Pattern Recognition
          </h3>
          
          <div className="space-y-3">
            {mockData.patterns.map((pattern, index) => (
              <motion.div
                key={pattern.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {pattern.type}
                  </div>
                  <div className="text-xs text-gray-400">
                    {pattern.frequency} occurrences
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-neon-blue">
                    {pattern.confidence}%
                  </div>
                  <div className="text-xs text-gray-400">
                    confidence
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Anomalies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Recent Anomalies
          </h3>
          
          <div className="space-y-3">
            {aiData.anomalies.slice(0, 5).map((anomaly, index) => (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all duration-300 hover:bg-white/5 ${getSeverityBg(anomaly.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle size={16} className={getSeverityColor(anomaly.severity)} />
                      <span className={`text-sm font-semibold ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {anomaly.timestamp}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    {anomaly.description}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-lg font-bold text-neon-blue">
                      {anomaly.confidence}%
                    </div>
                    <div className="text-xs text-gray-400">
                      confidence
                    </div>
                  </div>
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityBg(anomaly.severity)}`}>
                    <Shield size={16} className="text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Threat Predictions
          </h3>
          
          <div className="space-y-3">
            {mockData.predictions.map((prediction, index) => {
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
                <motion.div
                  key={prediction.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {prediction.type}
                    </div>
                    <div className="text-xs text-gray-400">
                      {prediction.timeWindow}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-neon-blue">
                      {prediction.probability}%
                    </div>
                    <div className="text-xs text-gray-400">
                      probability
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      prediction.confidence === 'High'
                        ? 'bg-green-500/20'
                        : prediction.confidence === 'Medium'
                        ? 'bg-yellow-500/20'
                        : 'bg-red-500/20'
                    }`}>
                      <Zap size={16} className="text-white" />
                    </div>
                    
                    <div className="text-sm font-medium text-gray-400">
                      {prediction.confidence}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Model Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          AI Model Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-sm text-gray-400 mb-1">Model Version</div>
            <div className="text-lg font-medium text-white">v2.4.1</div>
            
            <div className="text-sm text-gray-400 mb-1">Last Updated</div>
            <div className="text-lg font-medium text-white">2 hours ago</div>
            
            <div className="text-sm text-gray-400 mb-1">Training Data</div>
            <div className="text-lg font-medium text-white">1.2M samples</div>
            
            <div className="text-sm text-gray-400 mb-1">Accuracy Rate</div>
            <div className="text-lg font-medium text-neon-green">94.7%</div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-400 mb-1">Processing Speed</div>
            <div className="text-lg font-medium text-white">12.3ms</div>
            
            <div className="text-sm text-gray-400 mb-1">Memory Usage</div>
            <div className="text-lg font-medium text-white">2.1GB</div>
            
            <div className="text-sm text-gray-400 mb-1">API Calls</div>
            <div className="text-lg font-medium text-white">8,423</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIInsights;
