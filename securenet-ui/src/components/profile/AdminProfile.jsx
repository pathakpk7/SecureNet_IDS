import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import '../../styles/pages/profile.css';

const AdminProfile = () => {
  const [adminData, setAdminData] = useState({
    name: 'System Administrator',
    email: 'admin@securenet.com',
    role: 'admin',
    department: 'IT Security',
    joinedDate: '2023-01-15',
    lastLogin: '2024-04-18T09:30:00Z',
    permissions: ['ALL'],
    activeSessions: 3,
    securityLevel: 'MAXIMUM'
  });

  const [systemStats, setSystemStats] = useState({
    totalUsers: 127,
    activeThreats: 8,
    systemUptime: '99.7%',
    lastBackup: '2 hours ago'
  });

  const [adminActions, setAdminActions] = useState([
    { id: 1, action: 'Modified firewall rules', timestamp: '2 hours ago', type: 'security' },
    { id: 2, action: 'Created new user account', timestamp: '5 hours ago', type: 'user-management' },
    { id: 3, action: 'Updated system configuration', timestamp: '1 day ago', type: 'system' },
    { id: 4, action: 'Generated security report', timestamp: '2 days ago', type: 'report' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        activeThreats: Math.max(0, prev.activeThreats + Math.floor(Math.random() * 3) - 1)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-profile-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Administrator Profile</h1>
        <p className="page-subtitle">System administrator account and security settings</p>
      </div>

      <div className="profile-grid">
        <Card className="profile-card">
          <h3 className="card-title">Admin Information</h3>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{adminData.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{adminData.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role:</span>
              <span className="info-value admin-role">{adminData.role.toUpperCase()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Department:</span>
              <span className="info-value">{adminData.department}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Joined:</span>
              <span className="info-value">{new Date(adminData.joinedDate).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Security Level:</span>
              <span className="info-value security-max">{adminData.securityLevel}</span>
            </div>
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">System Overview</h3>
          <div className="system-overview">
            <div className="overview-item">
              <span className="overview-label">Total Users:</span>
              <span className="overview-value">{systemStats.totalUsers}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Active Threats:</span>
              <span className="overview-value threats">{systemStats.activeThreats}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">System Uptime:</span>
              <span className="overview-value">{systemStats.systemUptime}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Last Backup:</span>
              <span className="overview-value">{systemStats.lastBackup}</span>
            </div>
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Security Settings</h3>
          <div className="security-settings">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Two-Factor Authentication</h4>
                <p>Enhanced security for admin access</p>
              </div>
              <div className="setting-status enabled">ENABLED</div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Session Timeout</h4>
                <p>Auto-logout after inactivity</p>
              </div>
              <div className="setting-status">15 minutes</div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>IP Whitelist</h4>
                <p>Restrict admin access by IP</p>
              </div>
              <div className="setting-status enabled">ENABLED</div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Audit Logging</h4>
                <p>Record all admin actions</p>
              </div>
              <div className="setting-status enabled">ENABLED</div>
            </div>
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Admin Privileges</h3>
          <div className="privileges-list">
            <div className="privilege-item full-access">
              <span className="privilege-icon">admin</span>
              <div className="privilege-info">
                <h4>Full System Access</h4>
                <p>Complete control over all system functions</p>
              </div>
            </div>
            <div className="privilege-item">
              <span className="privilege-icon">users</span>
              <div className="privilege-info">
                <h4>User Management</h4>
                <p>Create, modify, and delete user accounts</p>
              </div>
            </div>
            <div className="privilege-item">
              <span className="privilege-icon">security</span>
              <div className="privilege-info">
                <h4>Security Configuration</h4>
                <p>Modify security policies and rules</p>
              </div>
            </div>
            <div className="privilege-item">
              <span className="privilege-icon">reports</span>
              <div className="privilege-info">
                <h4>System Reports</h4>
                <p>Access all system reports and analytics</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="profile-card full-width">
          <h3 className="card-title">Recent Admin Actions</h3>
          <div className="actions-timeline">
            {adminActions.map(action => (
              <div key={action.id} className="action-item">
                <div className="action-time">{action.timestamp}</div>
                <div className="action-content">
                  <span className={`action-type ${action.type}`}>{action.type}</span>
                  <span className="action-text">{action.action}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Quick Admin Actions</h3>
          <div className="quick-actions">
            <button className="action-btn primary">
              <span className="action-icon">users</span>
              Manage Users
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">security</span>
              Security Settings
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">backup</span>
              System Backup
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">reports</span>
              Generate Report
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfile;
