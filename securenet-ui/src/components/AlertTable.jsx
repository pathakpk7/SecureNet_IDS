import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  Filter,
  Search,
  ChevronDown,
  Eye,
  Download,
  RefreshCw,
  X
} from 'lucide-react';

const AlertTable = ({ 
  alerts = [], 
  loading = false, 
  onRefresh,
  onExport,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    timeRange: '24h'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const severityOptions = [
    { value: 'all', label: 'All Severities', color: 'text-gray-400' },
    { value: 'high', label: 'High', color: 'text-neon-red' },
    { value: 'medium', label: 'Medium', color: 'text-neon-yellow' },
    { value: 'low', label: 'Low', color: 'text-neon-green' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'ddos', label: 'DDoS Attack' },
    { value: 'sql', label: 'SQL Injection' },
    { value: 'xss', label: 'XSS Attack' },
    { value: 'brute', label: 'Brute Force' },
    { value: 'port', label: 'Port Scan' },
  ];

  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ];

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.type.toLowerCase().includes(searchTerm.toLowerCase());

      // Severity filter
      const matchesSeverity = filters.severity === 'all' || 
        alert.severity === filters.severity;

      // Type filter
      const matchesType = filters.type === 'all' || 
        alert.type === filters.type;

      // Time range filter (simplified)
      const matchesTime = true; // Would implement actual time filtering

      return matchesSearch && matchesSeverity && matchesType && matchesTime;
    });
  }, [alerts, searchTerm, filters]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-neon-red bg-neon-red/10 border-neon-red/30';
      case 'medium':
        return 'text-neon-yellow bg-neon-yellow/10 border-neon-yellow/30';
      case 'low':
        return 'text-neon-green bg-neon-green/10 border-neon-green/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ddos':
        return Activity;
      case 'sql':
        return AlertTriangle;
      case 'xss':
        return AlertTriangle;
      case 'brute':
        return Shield;
      case 'port':
        return Activity;
      default:
        return AlertTriangle;
    }
  };

  if (loading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Security Alerts</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neon-red rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Loading alerts...</span>
          </div>
        </div>
        <TableLoader rows={8} columns={5} />
      </div>
    );
  }

  return (
    <div className={`glass-card p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Security Alerts</h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-neon-red rounded-full animate-pulse"></div>
            <span className="text-sm text-neon-red font-medium">
              {filteredAlerts.length} Active
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 pr-4 py-2 w-48 lg:w-64"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                showFilters 
                  ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>

            <button
              onClick={onExport}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              title="Export"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg mb-6">
              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Severity
                </label>
                <div className="relative">
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                    className="input-field appearance-none pr-10 cursor-pointer"
                  >
                    {severityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={16} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Attack Type
                </label>
                <div className="relative">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="input-field appearance-none pr-10 cursor-pointer"
                  >
                    {typeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={16} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Time Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time Range
                </label>
                <div className="relative">
                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                    className="input-field appearance-none pr-10 cursor-pointer"
                  >
                    {timeRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={16} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                Severity
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                Type
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                Source IP
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                Message
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                Time
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredAlerts.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-white/5"
                >
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <Shield 
                        size={48} 
                        className="text-neon-green mx-auto mb-4" 
                      />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No Security Alerts
                      </h3>
                      <p className="text-gray-400">
                        Your network is currently secure. No threats detected.
                      </p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                filteredAlerts.map((alert, index) => {
                  const TypeIcon = getTypeIcon(alert.type);
                  const severityColors = getSeverityColor(alert.severity);
                  
                  return (
                    <motion.tr
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${severityColors}`}>
                          <div className={`w-2 h-2 rounded-full ${
                            alert.severity === 'high' ? 'bg-neon-red' :
                            alert.severity === 'medium' ? 'bg-neon-yellow' : 'bg-neon-green'
                          } animate-pulse`}></div>
                          <span className="uppercase">{alert.severity}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <TypeIcon size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-300">{alert.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-neon-blue font-mono">{alert.source}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-300 max-w-xs truncate" title={alert.message}>
                          {alert.message}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-400">{alert.timestamp}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // View details action
                            }}
                            className="p-1 rounded text-gray-400 hover:text-neon-blue hover:bg-neon-blue/10 transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Dismiss alert action
                            }}
                            className="p-1 rounded text-gray-400 hover:text-neon-red hover:bg-neon-red/10 transition-all"
                            title="Dismiss Alert"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Alert Details Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Alert Details
                  </h3>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedAlert.severity)}`}>
                    <AlertTriangle size={16} />
                    <span className="uppercase">{selectedAlert.severity} Severity</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Attack Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500">Type</span>
                      <p className="text-sm text-white font-medium">{selectedAlert.type}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Source IP</span>
                      <p className="text-sm text-neon-blue font-mono">{selectedAlert.source}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Target</span>
                      <p className="text-sm text-white">{selectedAlert.target || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Timeline</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500">Detected</span>
                      <p className="text-sm text-white">{selectedAlert.timestamp}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Duration</span>
                      <p className="text-sm text-white">{selectedAlert.duration || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Status</span>
                      <p className="text-sm text-neon-yellow">Under Investigation</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Description</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedAlert.message}
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button className="btn-primary">
                  Take Action
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Import TableLoader from Loader component
const TableLoader = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div
        key={rowIndex}
        className="flex items-center space-x-4 p-3 rounded-lg bg-white/5"
      >
        {Array.from({ length: columns }, (_, colIndex) => (
          <div
            key={colIndex}
            className={`h-4 bg-gray-600 rounded animate-pulse ${
              colIndex === 0 ? 'w-16' : colIndex === 1 ? 'w-24' : 'w-20'
            }`}
          ></div>
        ))}
      </div>
    ))}
  </div>
);

export default AlertTable;
