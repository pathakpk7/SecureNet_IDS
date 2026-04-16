import React from 'react';
import { hasPermission } from '../../utils/permissions';

/**
 * Admin Panel Component
 * Only accessible to users with admin permissions
 */
const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <h2>Admin Control Panel</h2>
      {hasPermission({ canManageUsers: true }, (
        <div className="admin-section">
          <h3>User Management</h3>
          <button className="admin-btn">Manage Users</button>
        </div>
      )}
      
      {hasPermission({ canManageOrgSettings: true }, (
        <div className="admin-section">
          <h3>Organization Settings</h3>
          <button className="admin-btn">Manage Organization</button>
        </div>
      ))}
      
      <div className="access-denied">
        <p>Access Denied: Admin permissions required</p>
      </div>
    </div>
  );
};

export default AdminPanel;
