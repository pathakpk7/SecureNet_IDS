import React from 'react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { FiPieChart, FiBarChart2, FiTrendingUp, FiShield, FiActivity, FiAlertTriangle } from 'react-icons/fi';

const Analytics = () => {
  // Attack Distribution Data (Pie Chart)
  const attackDistribution = [
    { name: 'DDoS Attacks', value: 342, color: '#FF3B3B' },
    { name: 'Malware', value: 287, color: '#00F5FF' },
    { name: 'Phishing', value: 198, color: '#FFC857' },
    { name: 'Brute Force', value: 156, color: '#22FF88' },
    { name: 'SQL Injection', value: 89, color: '#FF6B6B' },
    { name: 'XSS Attacks', value: 67, color: '#4ECDC4' },
    { name: 'Port Scans', value: 234, color: '#95E1D3' },
    { name: 'Other', value: 45, color: '#A8E6CF' }
  ];

  // Risk Levels Data (Bar Chart)
  const riskLevels = [
    { level: 'Critical', count: 47, blocked: 42, monitored: 5 },
    { level: 'High', count: 128, blocked: 115, monitored: 13 },
    { level: 'Medium', count: 289, blocked: 234, monitored: 55 },
    { level: 'Low', count: 567, blocked: 89, monitored: 478 }
  ];

  // Traffic Trend Data (Line Chart)
  const trafficTrend = [
    { time: '00:00', legitimate: 8500, malicious: 23, blocked: 18 },
    { time: '04:00', legitimate: 6200, malicious: 15, blocked: 12 },
    { time: '08:00', legitimate: 12400, malicious: 67, blocked: 54 },
    { time: '12:00', legitimate: 18900, malicious: 89, blocked: 76 },
    { time: '16:00', legitimate: 15600, malicious: 45, blocked: 38 },
    { time: '20:00', legitimate: 11200, malicious: 34, blocked: 28 },
    { time: '23:59', legitimate: 9800, malicious: 41, blocked: 35 }
  ];

  // Custom tooltip styles
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-primary/95 backdrop-blur-xl border border-neon-blue/30 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color || entry.fill }}
              ></div>
              <span className="text-gray-300">{entry.name}:</span>
              <span className="text-white font-semibold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const pieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-bg-primary/95 backdrop-blur-xl border border-neon-blue/30 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-neon-blue font-bold text-lg">{data.value} attacks</p>
          <p className="text-gray-400 text-sm">
            {((data.value / attackDistribution.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Analytics</h1>
          <p className="text-gray-400">Comprehensive threat analysis and traffic patterns</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-neon-blue neon-text">1,418</div>
            <div className="text-xs text-gray-400">Total Threats</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-neon-green neon-text">94.2%</div>
            <div className="text-xs text-gray-400">Block Rate</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attack Distribution Pie Chart */}
        <div className="glass-card p-6 hover-glow transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <FiPieChart className="text-neon-blue" size={24} />
            <h2 className="text-xl font-semibold text-white">Attack Distribution</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attackDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {attackDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={pieTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Levels Bar Chart */}
        <div className="glass-card p-6 hover-glow transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <FiBarChart2 className="text-neon-green" size={24} />
            <h2 className="text-xl font-semibold text-white">Risk Level Analysis</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskLevels}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 245, 255, 0.1)" />
                <XAxis dataKey="level" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={customTooltip} />
                <Legend />
                <Bar 
                  dataKey="blocked" 
                  fill="#22FF88" 
                  name="Blocked"
                  radius={[8, 8, 0, 0]}
                  animationBegin={0}
                  animationDuration={1500}
                />
                <Bar 
                  dataKey="monitored" 
                  fill="#FFC857" 
                  name="Monitored"
                  radius={[8, 8, 0, 0]}
                  animationBegin={0}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Traffic Trend Line Chart */}
      <div className="glass-card p-6 hover-glow transition-all duration-300">
        <div className="flex items-center space-x-3 mb-6">
          <FiTrendingUp className="text-neon-yellow" size={24} />
          <h2 className="text-xl font-semibold text-white">24-Hour Traffic Trend</h2>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 245, 255, 0.1)" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="legitimate" 
                stroke="#22FF88" 
                strokeWidth={3}
                dot={{ fill: '#22FF88', r: 5 }}
                activeDot={{ r: 7 }}
                name="Legitimate Traffic"
                animationBegin={0}
                animationDuration={2000}
              />
              <Line 
                type="monotone" 
                dataKey="malicious" 
                stroke="#FF3B3B" 
                strokeWidth={3}
                dot={{ fill: '#FF3B3B', r: 5 }}
                activeDot={{ r: 7 }}
                name="Malicious Traffic"
                animationBegin={0}
                animationDuration={2000}
              />
              <Line 
                type="monotone" 
                dataKey="blocked" 
                stroke="#FFC857" 
                strokeWidth={3}
                dot={{ fill: '#FFC857', r: 5 }}
                activeDot={{ r: 7 }}
                name="Blocked Traffic"
                animationBegin={0}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 hover-glow transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-neon-blue/20 rounded-lg border border-neon-blue/30">
              <FiShield size={24} className="text-neon-blue" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Top Threat</h3>
              <p className="text-neon-blue font-bold">DDoS Attacks</p>
              <p className="text-sm text-gray-400">342 incidents today</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover-glow transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-neon-green/20 rounded-lg border border-neon-green/30">
              <FiActivity size={24} className="text-neon-green" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Peak Activity</h3>
              <p className="text-neon-green font-bold">12:00 - 16:00</p>
              <p className="text-sm text-gray-400">18,900 legitimate requests</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover-glow transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-neon-red/20 rounded-lg border border-neon-red/30">
              <FiAlertTriangle size={24} className="text-neon-red" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Critical Alerts</h3>
              <p className="text-neon-red font-bold">47 active</p>
              <p className="text-sm text-gray-400">89% blocked successfully</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
