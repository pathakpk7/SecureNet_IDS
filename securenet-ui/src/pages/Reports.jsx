import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Download,
  FileText,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const Reports = () => {
  const [selectedRange, setSelectedRange] = useState('7days');
  const [animatedStats, setAnimatedStats] = useState({
    totalAttacks: 0,
    criticalThreats: 0,
    blockedAttacks: 0,
    systemUptime: 0
  });

  // Mock data for charts
  const attacksOverTime = [
    { date: 'Mon', attacks: 45, blocked: 38 },
    { date: 'Tue', attacks: 52, blocked: 45 },
    { date: 'Wed', attacks: 38, blocked: 35 },
    { date: 'Thu', attacks: 65, blocked: 58 },
    { date: 'Fri', attacks: 48, blocked: 42 },
    { date: 'Sat', attacks: 72, blocked: 65 },
    { date: 'Sun', attacks: 58, blocked: 52 }
  ];

  const attackTypes = [
    { type: 'DDoS', count: 245, color: '#ef4444' },
    { type: 'SQL Injection', count: 189, color: '#f59e0b' },
    { type: 'XSS', count: 156, color: '#10b981' },
    { type: 'Brute Force', count: 134, color: '#3b82f6' },
    { type: 'Malware', count: 98, color: '#8b5cf6' }
  ];

  const severityDistribution = [
    { name: 'Low', value: 35, color: '#10b981' },
    { name: 'Medium', value: 40, color: '#f59e0b' },
    { name: 'High', value: 20, color: '#ef4444' },
    { name: 'Critical', value: 5, color: '#dc2626' }
  ];

  const detailedReports = [
    { 
      attackType: 'DDoS Attack', 
      count: 245, 
      severity: 'High', 
      timeRange: 'Last 7 days',
      trend: '+12%'
    },
    { 
      attackType: 'SQL Injection', 
      count: 189, 
      severity: 'Medium', 
      timeRange: 'Last 7 days',
      trend: '-5%'
    },
    { 
      attackType: 'XSS', 
      count: 156, 
      severity: 'Low', 
      timeRange: 'Last 7 days',
      trend: '+8%'
    },
    { 
      attackType: 'Brute Force', 
      count: 134, 
      severity: 'Medium', 
      timeRange: 'Last 7 days',
      trend: '+15%'
    },
    { 
      attackType: 'Malware', 
      count: 98, 
      severity: 'High', 
      timeRange: 'Last 7 days',
      trend: '-3%'
    }
  ];

  const targetStats = {
    totalAttacks: 1247,
    criticalThreats: 89,
    blockedAttacks: 1156,
    systemUptime: 99.9
  };

  // Animate stats on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        totalAttacks: Math.floor(targetStats.totalAttacks * progress),
        criticalThreats: Math.floor(targetStats.criticalThreats * progress),
        blockedAttacks: Math.floor(targetStats.blockedAttacks * progress),
        systemUptime: parseFloat((targetStats.systemUptime * progress).toFixed(1))
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleGenerateReport = () => {
    console.log('Generating report...');
  };

  const handleExportPDF = () => {
    console.log('Exporting PDF...');
  };

  const handleDownloadCSV = () => {
    console.log('Downloading CSV...');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Security Reports</h1>
        <p className="text-gray-400">Comprehensive analytics and threat intelligence dashboard</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            icon: Shield,
            label: 'Total Attacks',
            value: animatedStats.totalAttacks.toLocaleString(),
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30'
          },
          {
            icon: AlertTriangle,
            label: 'Critical Threats',
            value: animatedStats.criticalThreats.toLocaleString(),
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30'
          },
          {
            icon: TrendingUp,
            label: 'Blocked Attacks',
            value: animatedStats.blockedAttacks.toLocaleString(),
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30'
          },
          {
            icon: Clock,
            label: 'System Uptime',
            value: `${animatedStats.systemUptime}%`,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30'
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className={`glass-card p-6 ${stat.bgColor} ${stat.borderColor} border`}
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div className={`w-2 h-2 ${stat.color} rounded-full animate-pulse`} />
            </div>
            <div className={`text-3xl font-bold text-white mb-2`}>
              {stat.value}
            </div>
            <div className="text-gray-400 text-sm">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Date Range Filter and Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Generate Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart - Attacks Over Time */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Attacks Over Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attacksOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="attacks" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="blocked" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart - Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Severity Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={severityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </RePieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bar Chart - Attack Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="glass-card p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Attack Types</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={attackTypes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="type" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="count" fill="#3b82f6">
              {attackTypes.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Detailed Report Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-yellow-400" />
          <h3 className="text-xl font-semibold text-white">Detailed Reports</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Attack Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Count</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Severity</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Time Range</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {detailedReports.map((report, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-white">{report.attackType}</td>
                  <td className="py-3 px-4 text-white">{report.count}</td>
                  <td className={`py-3 px-4 ${getSeverityColor(report.severity)}`}>
                    {report.severity}
                  </td>
                  <td className="py-3 px-4 text-gray-400">{report.timeRange}</td>
                  <td className={`py-3 px-4 ${report.trend.startsWith('+') ? 'text-red-400' : 'text-green-400'}`}>
                    {report.trend}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;
