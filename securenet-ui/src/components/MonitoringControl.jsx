import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

/**
 * MonitoringControl Component
 * 
 * Provides controls to start/stop network monitoring with real-time status.
 */
const MonitoringControl = ({ orgId }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [networkInterface, setNetworkInterface] = useState('Wi-Fi');

  useEffect(() => {
    fetchMonitoringStatus();
    const interval = setInterval(fetchMonitoringStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/monitoring/status');
      if (response.ok) {
        const data = await response.json();
        setMonitoringStatus(data);
        setIsMonitoring(data.is_monitoring);
      }
    } catch (error) {
      console.error('Error fetching monitoring status:', error);
    }
  };

  const startMonitoring = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/monitoring/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ interface: networkInterface, org_id: orgId })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setIsMonitoring(true);
        fetchMonitoringStatus();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to start monitoring');
      }
    } catch (error) {
      toast.error('Error starting monitoring');
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/monitoring/stop', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setIsMonitoring(false);
        fetchMonitoringStatus();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to stop monitoring');
      }
    } catch (error) {
      toast.error('Error stopping monitoring');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Network Monitoring</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
          isMonitoring ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm font-medium">
            {isMonitoring ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {monitoringStatus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Packets Captured</p>
            <p className="text-xl font-bold text-gray-800">
              {monitoringStatus.packets_captured.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Alerts Generated</p>
            <p className="text-xl font-bold text-gray-800">
              {monitoringStatus.alerts_generated.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Uptime</p>
            <p className="text-xl font-bold text-gray-800">
              {formatUptime(monitoringStatus.uptime_seconds)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Interface</p>
            <p className="text-sm font-medium text-gray-800">
              {monitoringStatus.current_interface || 'N/A'}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Network Interface
          </label>
          <select
            value={networkInterface}
            onChange={(e) => setNetworkInterface(e.target.value)}
            disabled={isMonitoring}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="Wi-Fi">Wi-Fi</option>
            <option value="Ethernet">Ethernet</option>
            <option value="Loopback">Loopback</option>
          </select>
        </div>

        {!isMonitoring ? (
          <button
            onClick={startMonitoring}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Start Monitoring</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={stopMonitoring}
            disabled={loading}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span>Stop Monitoring</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MonitoringControl;
