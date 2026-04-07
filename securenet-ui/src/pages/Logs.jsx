import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiFilter, FiRefreshCw, FiShield, FiAlertTriangle, FiActivity, FiLoader, FiPlay } from 'react-icons/fi';
import { getRequest, postRequest } from '../utils/api';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequest('/logs');
      setLogs(data.logs || data); // Handle different response formats
    } catch (err) {
      setError(err.message || 'Failed to fetch logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const simulateAttack = async () => {
    try {
      const newLog = {
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        prediction: 'DDoS Attack',
        attackType: 'Distributed Denial of Service',
        riskLevel: ['HIGH', 'CRITICAL'][Math.floor(Math.random() * 2)],
        timestamp: new Date().toISOString(),
        confidence: 0.95,
        blocked: true,
        sourceCountry: 'Unknown',
        targetPort: 80,
        packetCount: Math.floor(Math.random() * 1000) + 100
      };

      await postRequest('/logs', newLog);
      
      // Refresh logs to show the new entry
      await fetchLogs();
    } catch (err) {
      setError(err.message || 'Failed to simulate attack');
      console.error('Error simulating attack:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.ipAddress?.includes(searchTerm) || 
                           log.prediction?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.attackType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = filterRisk === 'ALL' || log.riskLevel === filterRisk;
      return matchesSearch && matchesRisk;
    });
  }, [logs, searchTerm, filterRisk]);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'LOW':
        return {
          bg: 'bg-neon-green/10',
          text: 'text-neon-green',
          border: 'border-neon-green/30',
          rowBg: 'hover:bg-neon-green/5'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-neon-yellow/10',
          text: 'text-neon-yellow',
          border: 'border-neon-yellow/30',
          rowBg: 'hover:bg-neon-yellow/5'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/10',
          text: 'text-orange-500',
          border: 'border-orange-500/30',
          rowBg: 'hover:bg-orange-500/5'
        };
      case 'CRITICAL':
        return {
          bg: 'bg-neon-red/10',
          text: 'text-neon-red',
          border: 'border-neon-red/30',
          rowBg: 'hover:bg-neon-red/5'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-500',
          border: 'border-gray-500/30',
          rowBg: 'hover:bg-gray-500/5'
        };
    }
  };

  const getPredictionIcon = (prediction) => {
    if (prediction.includes('Legitimate')) return <FiDatabase />;
    if (prediction.includes('DDoS') || prediction.includes('Attack')) return <FiAlertTriangle />;
    if (prediction.includes('Malware') || prediction.includes('Ransomware')) return <FiShield />;
    return <FiActivity />;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const riskLevels = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Logs</h1>
          <p className="text-gray-400">Comprehensive network activity and threat detection logs</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-neon-blue neon-text">
              {filteredLogs.length}
            </div>
            <div className="text-xs text-gray-400">Total Entries</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-neon-red neon-text">
              {filteredLogs.filter(log => log.riskLevel === 'CRITICAL').length}
            </div>
            <div className="text-xs text-gray-400">Critical</div>
          </div>
          {/* Simulate Attack Button */}
          <button
            onClick={simulateAttack}
            disabled={loading}
            className="px-4 py-2 bg-neon-red/20 border border-neon-red/30 rounded-lg 
                       text-neon-red hover:bg-neon-red/30 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed hover-glow flex items-center space-x-2"
            title="Simulate Attack"
          >
            <FiPlay size={16} />
            <span>Simulate Attack</span>
          </button>
          {/* Refresh Button */}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-3 bg-neon-blue/20 border border-neon-blue/30 rounded-lg 
                       text-neon-blue hover:bg-neon-blue/30 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed hover-glow"
            title="Refresh logs"
          >
            {loading ? (
              <FiLoader className="animate-spin" size={18} />
            ) : (
              <FiRefreshCw size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-neon-red/10 border border-neon-red/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiAlertTriangle className="text-neon-red" size={20} />
            <div>
              <p className="text-neon-red font-semibold">Error Loading Logs</p>
              <p className="text-gray-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <FiLoader className="animate-spin text-neon-blue" size={24} />
            <span className="text-gray-400">Loading security logs...</span>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className={`
            absolute inset-0 rounded-lg transition-all duration-300
            ${isSearchFocused 
              ? 'shadow-lg shadow-neon-blue/50 ring-2 ring-neon-blue/50' 
              : 'shadow-md'
            }
          `}></div>
          
          <FiSearch 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
            size={18}
          />
          
          <input
            type="text"
            placeholder="Search by IP, prediction, or attack type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`
              w-full pl-10 pr-4 py-3 bg-bg-primary/50 border border-neon-blue/30 
              rounded-lg text-white placeholder-gray-500 outline-none transition-all duration-300
              hover:bg-bg-primary/70 focus:bg-bg-primary/90 focus:border-neon-blue/60
              backdrop-blur-sm relative z-10 font-mono text-sm
            `}
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <FiFilter 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
            size={18}
          />
          
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="
              pl-10 pr-4 py-3 bg-bg-primary/50 border border-neon-blue/30 
              rounded-lg text-white outline-none transition-all duration-300
              hover:bg-bg-primary/70 focus:bg-bg-primary/90 focus:border-neon-blue/60
              backdrop-blur-sm font-mono text-sm appearance-none cursor-pointer
            "
          >
            {riskLevels.map(level => (
              <option key={level} value={level} className="bg-bg-primary">
                {level === 'ALL' ? 'All Risk Levels' : `${level} Risk`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {!loading && !error && (
        <div className="glass-card overflow-hidden">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-bg-secondary/90 backdrop-blur-xl border-b border-neon-blue/30 z-10">
            <div className="grid grid-cols-6 gap-4 px-6 py-4 text-xs font-semibold text-neon-blue uppercase tracking-wider">
              <div>IP Address</div>
              <div>Prediction</div>
              <div>Attack Type</div>
              <div>Risk Level</div>
              <div>Timestamp</div>
              <div>Status</div>
            </div>
          </div>

          {/* Scrollable Table Body */}
          <div className="max-h-[600px] overflow-y-auto">
            {filteredLogs.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filteredLogs.map((log) => {
                const riskColors = getRiskColor(log.riskLevel);
                const Icon = getPredictionIcon(log.prediction);
                
                return (
                  <div
                    key={log.id}
                    className={`
                      grid grid-cols-6 gap-4 px-6 py-4 transition-all duration-200
                      ${riskColors.rowBg} cursor-pointer hover:scale-[1.01]
                      border-l-4 ${riskColors.border}
                    `}
                  >
                    {/* IP Address */}
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-gray-300">
                        {log.ipAddress}
                      </span>
                    </div>

                    {/* Prediction */}
                    <div className="flex items-center space-x-2">
                      <Icon size={14} className={riskColors.text} />
                      <span className="text-sm text-gray-300">
                        {log.prediction}
                      </span>
                    </div>

                    {/* Attack Type */}
                    <div className="text-sm text-gray-400 font-mono">
                      {log.attackType}
                    </div>

                    {/* Risk Level */}
                    <div>
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-bold
                        ${riskColors.bg} ${riskColors.text}
                      `}>
                        {log.riskLevel}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-gray-500 font-mono">
                      {formatTimestamp(log.timestamp)}
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded text-xs font-semibold
                        ${log.blocked 
                          ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' 
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                        }
                      `}>
                        {log.blocked ? 'BLOCKED' : 'MONITORED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiDatabase size={48} className="text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No logs found matching your criteria</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Summary Statistics */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-green neon-text">
              {filteredLogs.filter(log => log.riskLevel === 'LOW').length}
            </div>
            <div className="text-sm text-gray-400">Low Risk</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-yellow neon-text">
              {filteredLogs.filter(log => log.riskLevel === 'MEDIUM').length}
            </div>
            <div className="text-sm text-gray-400">Medium Risk</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-orange-500 neon-text">
              {filteredLogs.filter(log => log.riskLevel === 'HIGH').length}
            </div>
            <div className="text-sm text-gray-400">High Risk</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-red neon-text">
              {filteredLogs.filter(log => log.riskLevel === 'CRITICAL').length}
            </div>
            <div className="text-sm text-gray-400">Critical Risk</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
