import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import '../styles/pages/profile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    role: user?.role || 'user',
    phone: '+1 (555) 123-4567',
    department: 'Security Operations',
    location: 'New York, NY',
    timezone: 'EST (UTC-5)'
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@example.com',
      role: user?.role || 'user',
      phone: '+1 (555) 123-4567',
      department: 'Security Operations',
      location: 'New York, NY',
      timezone: 'EST (UTC-5)'
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const userActivity = [
    { action: 'Logged in', time: '2 hours ago', ip: '192.168.1.100' },
    { action: 'Viewed Alerts', time: '3 hours ago', ip: '192.168.1.100' },
    { action: 'Generated Report', time: '5 hours ago', ip: '192.168.1.100' },
    { action: 'Updated Settings', time: '1 day ago', ip: '192.168.1.100' }
  ];

  const permissions = user?.role === 'admin' 
    ? ['Read Access', 'Write Access', 'Delete Access', 'Admin Access', 'User Management']
    : ['Read Access', 'Write Access'];

  return (
    <div className="user-profile-page fade-in">
      <div className="page-header">
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">Manage your account settings and preferences</p>
      </div>

      <div className="profile-grid">
        <Card className="profile-info-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <span className="avatar-text">
                {formData.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="profile-details">
              <h2 className="profile-name">{formData.name}</h2>
              <span className="profile-role">{formData.role.toUpperCase()}</span>
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <button className="btn btn-primary" onClick={handleEdit}>
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="btn btn-primary" onClick={handleSave}>
                    Save
                  </button>
                  <button className="btn btn-outline" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="profile-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                    />
                  ) : (
                    <span className="form-value">{formData.name}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                    />
                  ) : (
                    <span className="form-value">{formData.email}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <span className="form-value role-badge" style={{ 
                    backgroundColor: formData.role === 'admin' ? '#ff3366' : '#00f5ff' 
                  }}>
                    {formData.role.toUpperCase()}
                  </span>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                    />
                  ) : (
                    <span className="form-value">{formData.phone}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Work Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="form-input"
                    />
                  ) : (
                    <span className="form-value">{formData.department}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="form-input"
                    />
                  ) : (
                    <span className="form-value">{formData.location}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  {isEditing ? (
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="EST (UTC-5)">EST (UTC-5)</option>
                      <option value="CST (UTC-6)">CST (UTC-6)</option>
                      <option value="MST (UTC-7)">MST (UTC-7)</option>
                      <option value="PST (UTC-8)">PST (UTC-8)</option>
                    </select>
                  ) : (
                    <span className="form-value">{formData.timezone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="profile-sidebar">
          <Card className="permissions-card">
            <h3>Permissions</h3>
            <div className="permissions-list">
              {permissions.map((permission, index) => (
                <div key={index} className="permission-item">
                  <span className="permission-icon">check_circle</span>
                  <span className="permission-text">{permission}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="activity-card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {userActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-info">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <span className="activity-ip">{activity.ip}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="security-card">
            <h3>Security Settings</h3>
            <div className="security-actions">
              <button className="btn btn-outline">Change Password</button>
              <button className="btn btn-outline">Two-Factor Auth</button>
              <button className="btn btn-outline">Login History</button>
              <button className="btn btn-outline">API Keys</button>
            </div>
          </Card>
        </div>
      </div>

      <Card className="preferences-card">
        <h3>Notification Preferences</h3>
        <div className="preferences-grid">
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-name">Email Notifications</span>
              <span className="preference-description">Receive email alerts for security events</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-name">Push Notifications</span>
              <span className="preference-description">Receive push notifications on mobile</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-name">Weekly Reports</span>
              <span className="preference-description">Receive weekly security reports</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-name">Alert Threshold</span>
              <span className="preference-description">Only high-severity alerts</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
