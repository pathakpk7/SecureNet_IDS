import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import '../../styles/pages/profile.css';

const UserOnlyProfile = () => {
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'user',
    department: 'Engineering',
    joinedDate: '2023-06-20',
    lastLogin: '2024-04-18T08:45:00Z',
    securityScore: 85,
    devicesConnected: 2
  });

  const [userStats, setUserStats] = useState({
    alertsReceived: 12,
    threatsBlocked: 8,
    loginAttempts: 156,
    securityEvents: 3
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'Login successful', timestamp: '2 hours ago', location: '192.168.1.100' },
    { id: 2, action: 'Password updated', timestamp: '1 day ago', location: 'Company Office' },
    { id: 3, action: 'New device connected', timestamp: '3 days ago', location: 'Mobile Phone' },
    { id: 4, action: 'Security settings changed', timestamp: '1 week ago', location: 'Web Portal' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUserStats(prev => ({
        ...prev,
        loginAttempts: prev.loginAttempts + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="user-profile-page fade-in">
      <div className="page-header">
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">Personal account settings and security information</p>
      </div>

      <div className="profile-grid">
        <Card className="profile-card">
          <h3 className="card-title">Personal Information</h3>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{userData.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{userData.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role:</span>
              <span className="info-value user-role">{userData.role}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Department:</span>
              <span className="info-value">{userData.department}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Member Since:</span>
              <span className="info-value">{new Date(userData.joinedDate).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Security Score:</span>
              <span className={`info-value security-score ${userData.securityScore >= 80 ? 'high' : userData.securityScore >= 60 ? 'medium' : 'low'}`}>
                {userData.securityScore}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Security Statistics</h3>
          <div className="security-stats">
            <div className="stat-item">
              <div className="stat-value">{userStats.alertsReceived}</div>
              <div className="stat-label">Alerts Received</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userStats.threatsBlocked}</div>
              <div className="stat-label">Threats Blocked</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userStats.loginAttempts}</div>
              <div className="stat-label">Login Attempts</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userStats.securityEvents}</div>
              <div className="stat-label">Security Events</div>
            </div>
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Connected Devices</h3>
          <div className="devices-list">
            <div className="device-item current">
              <div className="device-info">
                <h4>Windows Laptop</h4>
                <p>Current device - Last active: Now</p>
              </div>
              <div className="device-status online">ONLINE</div>
            </div>
            <div className="device-item">
              <div className="device-info">
                <h4>iPhone 13</h4>
                <p>Last active: 2 hours ago</p>
              </div>
              <div className="device-status offline">OFFLINE</div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm">Manage Devices</button>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Security Settings</h3>
          <div className="security-settings">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra layer of security</p>
              </div>
              <button className="btn btn-sm btn-outline">Enable</button>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Login Notifications</h4>
                <p>Get alerts for new sign-ins</p>
              </div>
              <div className="setting-status enabled">ENABLED</div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Session Management</h4>
                <p>Control active sessions</p>
              </div>
              <button className="btn btn-sm btn-outline">Manage</button>
            </div>
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Privacy Preferences</h3>
          <div className="privacy-settings">
            <div className="privacy-item">
              <label className="privacy-label">
                <input type="checkbox" defaultChecked />
                <span>Share security insights with team</span>
              </label>
            </div>
            <div className="privacy-item">
              <label className="privacy-label">
                <input type="checkbox" defaultChecked />
                <span>Receive security recommendations</span>
              </label>
            </div>
            <div className="privacy-item">
              <label className="privacy-label">
                <input type="checkbox" />
                <span>Anonymous usage statistics</span>
              </label>
            </div>
          </div>
        </Card>

        <Card className="profile-card full-width">
          <h3 className="card-title">Recent Activity</h3>
          <div className="activity-timeline">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-time">{activity.timestamp}</div>
                <div className="activity-content">
                  <span className="activity-action">{activity.action}</span>
                  <span className="activity-location">from {activity.location}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="quick-actions">
            <button className="action-btn primary">
              <span className="action-icon">password</span>
              Change Password
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">download</span>
              Download Data
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">help</span>
              Get Help
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserOnlyProfile;
