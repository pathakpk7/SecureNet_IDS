import React, { useState, useEffect } from 'react';

/**
 * HealthIndicator Component
 * 
 * Displays system health status with real-time metrics.
 */
const HealthIndicator = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/health/');
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
      }
    } catch (error) {
      console.error('Error fetching health status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'All Systems Operational';
      case 'degraded':
        return 'Some Issues Detected';
      case 'unhealthy':
        return 'Critical Issues';
      default:
        return 'Status Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!healthStatus) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-gray-600">Unable to fetch health status</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(healthStatus.status)}`}></div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {getStatusText(healthStatus.status)}
            </p>
            <p className="text-xs text-gray-500">
              Last updated: {new Date(healthStatus.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {healthStatus.services && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {healthStatus.services.healthy_services}/{healthStatus.services.total_services} services
            </span>
          </div>
        )}
      </div>

      {healthStatus.services && healthStatus.services.services && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">Service Status:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(healthStatus.services.services).map(([service, status]) => (
              <div key={service} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${status.healthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600 capitalize">{service.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthIndicator;
