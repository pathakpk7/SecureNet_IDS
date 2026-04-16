import React from 'react';
import { hasPermission } from '../../utils/permissions';

/**
 * User Dashboard Component
 * Shows user-appropriate features based on permissions
 */
const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      <h2>User Dashboard</h2>
      
      {hasPermission({ canViewAnalytics: true }, (
        <div className="dashboard-section">
          <h3>Analytics</h3>
          <div className="analytics-cards">
            <div className="stat-card">
              <h4>Security Overview</h4>
              <div className="stat-value">98% Safe</div>
            </div>
            <div className="stat-card">
              <h4>Threats Blocked</h4>
              <div className="stat-value">24</div>
            </div>
          </div>
        </div>
      )}
      
      {hasPermission({ canViewLogs: true }, (
        <div className="dashboard-section">
          <h3>Security Logs</h3>
          <div className="logs-container">
            <p>Recent security events and alerts</p>
          </div>
        </div>
      )}
      
      <div className="access-denied">
        <p>Access Denied: Admin permissions required for this feature</p>
      </div>
    </div>
  );
};

export default UserDashboard;
