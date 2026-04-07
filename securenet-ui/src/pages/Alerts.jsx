import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiShield, FiActivity, FiX, FiClock, FiMapPin, FiServer, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { getRequest } from '../utils/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequest('/alerts');
      setAlerts(data.alerts || data || []); // Handle different response formats
    } catch (err) {
      setError(err.message || 'Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'LOW':
        return {
          bg: 'bg-neon-green/10',
          border: 'border-neon-green',
          text: 'text-neon-green',
          icon: 'bg-neon-green/20'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-neon-yellow/10',
          border: 'border-neon-yellow',
          text: 'text-neon-yellow',
          icon: 'bg-neon-yellow/20'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500',
          text: 'text-orange-500',
          icon: 'bg-orange-500/20'
        };
      case 'CRITICAL':
        return {
          bg: 'bg-neon-red/10',
          border: 'border-neon-red',
          text: 'text-neon-red',
          icon: 'bg-neon-red/20'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500',
          text: 'text-gray-500',
          icon: 'bg-gray-500/20'
        };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'DDoS Attack':
      case 'Port Scan':
        return <FiServer size={20} />;
      case 'Brute Force':
      case 'Suspicious Login':
        return <FiShield size={20} />;
      case 'Malware Detection':
      case 'Phishing Attempt':
        return <FiAlertTriangle size={20} />;
      default:
        return <FiActivity size={20} />;
    }
  };

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Alerts</h1>
          <p className="text-gray-400">Real-time security threat notifications</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-neon-red neon-text">
              {activeAlerts.filter(a => a.risk === 'CRITICAL').length}
            </div>
            <div className="text-xs text-gray-400">Critical</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-500 neon-text">
              {activeAlerts.filter(a => a.risk === 'HIGH').length}
            </div>
            <div className="text-xs text-gray-400">High</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-neon-yellow neon-text">
              {activeAlerts.filter(a => a.risk === 'MEDIUM').length}
            </div>
            <div className="text-xs text-gray-400">Medium</div>
          </div>
          {/* Refresh Button */}
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="p-3 bg-neon-blue/20 border border-neon-blue/30 rounded-lg 
                       text-neon-blue hover:bg-neon-blue/30 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed hover-glow"
            title="Refresh alerts"
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
              <p className="text-neon-red font-semibold">Error Loading Alerts</p>
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
            <span className="text-gray-400">Loading security alerts...</span>
          </div>
        </div>
      )}

      {/* Alert Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {activeAlerts.map((alert, index) => {
          const riskColors = getRiskColor(alert.risk);
          const isCritical = alert.risk === 'CRITICAL';
          
          return (
            <div
              key={alert.id}
              className={`
                glass-card p-6 relative overflow-hidden transition-all duration-500
                hover:scale-[1.02] hover:shadow-2xl hover-glow
                ${isCritical ? 'animate-pulse border-2' : 'border'}
                ${riskColors.border}
                animate-slide-in
              `}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              {/* Critical Alert Pulsing Border */}
              {isCritical && (
                <>
                  <div className="absolute inset-0 border-2 border-neon-red rounded-lg animate-pulse"></div>
                  <div className="absolute inset-0 border-2 border-neon-red rounded-lg animate-ping opacity-20"></div>
                </>
              )}

              {/* Alert Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`
                    p-3 rounded-lg flex items-center justify-center
                    ${riskColors.icon}
                    ${isCritical ? 'animate-bounce' : ''}
                  `}>
                    <div className={`${riskColors.text}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-white">{alert.type}</h3>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-bold border
                        ${riskColors.bg} ${riskColors.border} ${riskColors.text}
                        ${isCritical ? 'animate-pulse' : ''}
                      `}>
                        {alert.risk}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <FiClock size={14} />
                        <span>{formatTimestamp(alert.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiMapPin size={14} />
                        <span>{alert.source}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiServer size={14} />
                        <span>{alert.target}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className={`
                    p-2 rounded-lg transition-all duration-300 hover:scale-110
                    ${riskColors.bg} ${riskColors.border} ${riskColors.text}
                    hover:bg-white/20 hover-glow
                  `}
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Alert Description */}
              <p className="text-gray-300 mb-4">{alert.description}</p>

              {/* Alert Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(alert.details).map(([key, value]) => (
                  <div key={key} className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-gray-400 capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-white font-semibold">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning Icon for Critical Alerts */}
              {isCritical && (
                <div className="absolute top-6 right-6">
                  <FiAlertTriangle 
                    size={24} 
                    className="text-neon-red animate-pulse neon-text"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && !error && activeAlerts.length === 0 && !dismissedAlerts.size && (
        <div className="glass-card p-12 text-center">
          <FiShield size={64} className="text-neon-green mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">All Clear!</h3>
          <p className="text-gray-400">No active security alerts at this time.</p>
        </div>
      )}

      {/* Dismissed Alerts Summary */}
      {!loading && !error && dismissedAlerts.size > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {dismissedAlerts.size} alert{dismissedAlerts.size > 1 ? 's' : ''} dismissed
            </span>
            <button
              onClick={() => setDismissedAlerts(new Set())}
              className="text-sm text-neon-blue hover:text-neon-blue/80 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
