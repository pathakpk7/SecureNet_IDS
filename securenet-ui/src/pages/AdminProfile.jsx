import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import '../styles/pages/profile.css';

const AdminProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showOtherUsers, setShowOtherUsers] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@company.com',
    role: user?.role || 'admin',
    phone: '+1 (555) 123-4567',
    department: 'Security Operations',
    location: 'New York, NY',
    timezone: 'EST (UTC-5)'
  });

  const [otherUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user',
      phone: '+1 (555) 234-5678',
      department: 'Security Analysis',
      location: 'Boston, MA',
      timezone: 'EST (UTC-5)',
      lastLogin: '2 hours ago',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'user',
      phone: '+1 (555) 345-6789',
      department: 'Threat Research',
      location: 'San Francisco, CA',
      timezone: 'PST (UTC-8)',
      lastLogin: '1 day ago',
      status: 'active'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'admin',
      phone: '+1 (555) 456-7890',
      department: 'Security Operations',
      location: 'New York, NY',
      timezone: 'EST (UTC-5)',
      lastLogin: '30 minutes ago',
      status: 'active'
    }
  ]);

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
      name: user?.name || 'Admin User',
      email: user?.email || 'admin@company.com',
      role: user?.role || 'admin',
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

  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? '#ff3366' : '#00f5ff';
  };

  const adminActivity = [
    { action: 'Logged in', time: '30 minutes ago', ip: '192.168.1.100' },
    { action: 'Viewed User Profiles', time: '45 minutes ago', ip: '192.168.1.100' },
    { action: 'Modified User Settings', time: '2 hours ago', ip: '192.168.1.100' },
    { action: 'Generated System Report', time: '3 hours ago', ip: '192.168.1.100' },
    { action: 'Updated Security Policies', time: '1 day ago', ip: '192.168.1.100' }
  ];

  const adminPermissions = [
    'Read Access', 'Write Access', 'Delete Access', 'Admin Access', 
    'User Management', 'System Configuration', 'Security Policies', 'Audit Logs'
  ];

  return (
    <div className="admin-profile-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Profile</h1>
        <p className="page-subtitle">Manage your admin account and view user profiles</p>
      </div>

      <div className="profile-grid">
        <Card className="profile-info-card admin-profile">
          <div className="profile-header">
            <div className="profile-avatar admin-avatar">
              <span className="avatar-text">
                {formData.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="profile-details">
              <h2 className="profile-name">{formData.name}</h2>
              <span className="profile-role role-badge" style={{ 
                backgroundColor: getRoleColor(formData.role) 
              }}>
                {formData.role.toUpperCase()}
              </span>
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
                    backgroundColor: getRoleColor(formData.role) 
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
          <Card className="permissions-card admin-permissions">
            <h3>Admin Permissions</h3>
            <div className="permissions-list">
              {adminPermissions.map((permission, index) => (
                <div key={index} className="permission-item">
                  <span className="permission-icon">check_circle</span>
                  <span className="permission-text">{permission}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="activity-card admin-activity">
            <h3>Admin Activity</h3>
            <div className="activity-list">
              {adminActivity.map((activity, index) => (
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

          <Card className="admin-controls-card">
            <h3>Admin Controls</h3>
            <div className="admin-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setShowOtherUsers(!showOtherUsers)}
              >
                {showOtherUsers ? 'Hide Users' : 'View Users'}
              </button>
              <button className="btn btn-outline">System Settings</button>
              <button className="btn btn-outline">Audit Logs</button>
              <button className="btn btn-outline">Security Policies</button>
            </div>
          </Card>
        </div>
      </div>

      {/* Optional: View Other Users Section */}
      {showOtherUsers && (
        <Card className="other-users-card">
          <div className="other-users-header">
            <h3>Other Users Profiles</h3>
            <span className="users-count">{otherUsers.length} users</span>
          </div>
          <div className="users-grid">
            {otherUsers.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <div className="user-avatar">
                    <span className="avatar-text">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="user-info">
                    <h4 className="user-name">{user.name}</h4>
                    <span className="user-role role-badge" style={{ 
                      backgroundColor: getRoleColor(user.role) 
                    }}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="user-details">
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{user.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{user.department}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{user.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Login:</span>
                    <span className="detail-value">{user.lastLogin}</span>
                  </div>
                </div>
                <div className="user-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleViewUser(user)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Selected User Modal */}
      {selectedUser && (
        <div className="modal-overlay">
          <Card className="modal-card user-modal">
            <div className="modal-header">
              <h3>User Profile - {selectedUser.name}</h3>
              <button 
                className="btn btn-outline"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
            <div className="modal-content">
              <div className="user-profile-summary">
                <div className="profile-avatar">
                  <span className="avatar-text">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="profile-summary-info">
                  <h4>{selectedUser.name}</h4>
                  <span className="role-badge" style={{ 
                    backgroundColor: getRoleColor(selectedUser.role) 
                  }}>
                    {selectedUser.role.toUpperCase()}
                  </span>
                  <p>{selectedUser.email}</p>
                </div>
              </div>
              <div className="user-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedUser.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{selectedUser.department}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{selectedUser.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Timezone:</span>
                  <span className="detail-value">{selectedUser.timezone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Login:</span>
                  <span className="detail-value">{selectedUser.lastLogin}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value status-badge active">
                    {selectedUser.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline">Edit User</button>
              <button className="btn btn-outline">View Activity</button>
              <button 
                className="btn btn-outline"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}

      <Card className="preferences-card admin-preferences">
        <h3>Admin Preferences</h3>
        <div className="preferences-grid">
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-name">System Notifications</span>
              <span className="preference-description">Receive system-level notifications</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-name">User Activity Alerts</span>
              <span className="preference-description">Get notified of user activities</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-name">Security Reports</span>
              <span className="preference-description">Daily security summary reports</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-name">Audit Trail</span>
              <span className="preference-description">Log all admin actions</span>
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

export default AdminProfile;
