import React, { useState, useEffect } from 'react';
import { FiActivity, FiGlobe, FiDatabase, FiShield, FiAlertTriangle, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { getRequest } from '../utils/api';

const LiveTraffic = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packetCount, setPacketCount] = useState(0);

  const fetchTrafficData = async () => {
    try {
      setError(null);
      const data = await getRequest('/traffic');
      setTrafficData(data.traffic || data || []); // Handle different response formats
    } catch (err) {
      setError(err.message || 'Failed to fetch traffic data');
      console.error('Error fetching traffic data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and set up auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchTrafficData();

    // Set up auto-refresh every 5 seconds
    let intervalId = null;
    if (isLive) {
      intervalId = setInterval(() => {
        fetchTrafficData();
        setPacketCount(prev => prev + 1);
      }, 5000);
    }

    // Clear interval on unmount or when isLive changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLive]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'allowed': return 'text-neon-green border-neon-green bg-neon-green/10';
      case 'blocked': return 'text-neon-red border-neon-red bg-neon-red/10';
      case 'monitored': return 'text-neon-yellow border-neon-yellow bg-neon-yellow/10';
      case 'flagged': return 'text-neon-blue border-neon-blue bg-neon-blue/10';
      default: return 'text-gray-400 border-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'allowed': return <FiShield size={14} />;
      case 'blocked': return <FiAlertTriangle size={14} />;
      case 'monitored': return <FiActivity size={14} />;
      case 'flagged': return <FiDatabase size={14} />;
      default: return null;
    }
  };

  const formatPacketSize = (bytes) => {
    if (bytes >= 1000) {
      return `${(bytes / 1000).toFixed(1)} KB`;
    }
    return `${bytes} B`;
  };

  const toggleLiveMode = () => {
    setIsLive(!isLive);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-white">Live Traffic Monitor</h1>
          <div className="flex items-center space-x-2">
            <div className={`relative ${isLive ? '' : 'opacity-50'}`}>
              <div className={`w-3 h-3 ${isLive ? 'bg-neon-green' : 'bg-gray-500'} rounded-full ${isLive ? 'animate-pulse' : ''}`}></div>
              {isLive && (
                <div className="absolute inset-0 w-3 h-3 bg-neon-green rounded-full animate-ping"></div>
              )}
            </div>
            <span className={`text-sm font-semibold ${isLive ? 'text-neon-green' : 'text-gray-500'}`}>
              Network Activity: {isLive ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Packets</div>
            <div className="text-2xl font-bold text-neon-blue neon-text">
              {packetCount.toLocaleString()}
            </div>
          </div>
          <button
            onClick={fetchTrafficData}
            disabled={loading}
            className="p-3 bg-neon-blue/20 border border-neon-blue/30 rounded-lg 
                       text-neon-blue hover:bg-neon-blue/30 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed hover-glow"
            title="Refresh traffic data"
          >
            {loading ? (
              <FiLoader className="animate-spin" size={18} />
            ) : (
              <FiRefreshCw size={18} />
            )}
          </button>
          <button
            onClick={toggleLiveMode}
            className={`px-4 py-2 rounded-lg border transition-all duration-300 hover-glow ${
              isLive 
                ? 'border-neon-red text-neon-red hover:bg-neon-red/10' 
                : 'border-neon-green text-neon-green hover:bg-neon-green/10'
            }`}
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-neon-red/10 border border-neon-red/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <FiAlertTriangle className="text-neon-red" size={20} />
            <div>
              <p className="text-neon-red font-semibold">Error Loading Traffic Data</p>
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
            <span className="text-gray-400">Loading traffic data...</span>
          </div>
        </div>
      )}

      {/* Traffic Table */}
      {!loading && !error && (
        <div className="glass-card p-6 overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Real-time Traffic Flow</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <FiGlobe size={16} />
              <span>Auto-refresh: 5s</span>
            </div>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neon-blue/30">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neon-blue">IP Address</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neon-blue">Protocol</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neon-blue">Packet Size</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neon-blue">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neon-blue">Time</th>
              </tr>
            </thead>
            <tbody>
              {trafficData.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`
                    border-b border-white/5 transition-all duration-300
                    hover:bg-white/10 hover:scale-[1.01] hover:shadow-lg hover:shadow-neon-blue/20
                    ${index === 0 ? 'animate-flicker' : ''}
                  `}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <FiGlobe size={14} className="text-gray-400" />
                      <span className="font-mono text-sm text-gray-300">{entry.ip}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      entry.protocol === 'HTTPS' ? 'text-neon-green bg-neon-green/10' :
                      entry.protocol === 'HTTP' ? 'text-neon-blue bg-neon-blue/10' :
                      entry.protocol === 'SSH' ? 'text-neon-yellow bg-neon-yellow/10' :
                      'text-gray-400 bg-gray-400/10'
                    }`}>
                      {entry.protocol}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300 font-mono">
                      {formatPacketSize(entry.packetSize)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(entry.status)}`}>
                      {getStatusIcon(entry.status)}
                      <span className="uppercase">{entry.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-400 font-mono">{entry.timestamp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && !error && trafficData.length === 0 && (
          <div className="text-center py-12">
            <FiActivity size={48} className="text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No traffic data available</p>
            <p className="text-sm text-gray-500 mt-2">Start monitoring to see live traffic</p>
          </div>
        )}
      </div>
      )}

      {/* Statistics Summary */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-green neon-text">
              {trafficData.filter(d => d.status === 'allowed').length}
            </div>
            <div className="text-sm text-gray-400">Allowed</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-red neon-text">
              {trafficData.filter(d => d.status === 'blocked').length}
            </div>
            <div className="text-sm text-gray-400">Blocked</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-yellow neon-text">
              {trafficData.filter(d => d.status === 'monitored').length}
            </div>
            <div className="text-sm text-gray-400">Monitored</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-neon-blue neon-text">
              {trafficData.filter(d => d.status === 'flagged').length}
            </div>
            <div className="text-sm text-gray-400">Flagged</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTraffic;
