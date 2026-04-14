import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/admin.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
      banned: false,
      lastLogin: '2024-01-15 14:30:00',
      loginCount: 156,
      permissions: ['read', 'write', 'delete', 'admin'],
      activity: [
        { action: 'Login', timestamp: '2024-01-15 14:30:00', ip: '192.168.1.100' },
        { action: 'View Dashboard', timestamp: '2024-01-15 14:32:15', ip: '192.168.1.100' },
        { action: 'Edit User', timestamp: '2024-01-15 14:45:22', ip: '192.168.1.100' }
      ]
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'user',
      status: 'active',
      banned: false,
      lastLogin: '2024-01-15 13:45:00',
      loginCount: 89,
      permissions: ['read', 'write'],
      activity: [
        { action: 'Login', timestamp: '2024-01-15 13:45:00', ip: '192.168.1.101' },
        { action: 'View Reports', timestamp: '2024-01-15 13:50:12', ip: '192.168.1.101' }
      ]
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'user',
      status: 'inactive',
      banned: false,
      lastLogin: '2024-01-14 16:20:00',
      loginCount: 45,
      permissions: ['read'],
      activity: [
        { action: 'Login', timestamp: '2024-01-14 16:20:00', ip: '192.168.1.102' },
        { action: 'Failed Login', timestamp: '2024-01-15 09:15:33', ip: '192.168.1.102' }
      ]
    },
    {
      id: 4,
      name: 'Alice Wilson',
      email: 'alice.wilson@example.com',
      role: 'admin',
      status: 'active',
      banned: false,
      lastLogin: '2024-01-15 12:15:00',
      loginCount: 234,
      permissions: ['read', 'write', 'delete', 'admin'],
      activity: [
        { action: 'Login', timestamp: '2024-01-15 12:15:00', ip: '192.168.1.103' },
        { action: 'Create User', timestamp: '2024-01-15 12:20:45', ip: '192.168.1.103' }
      ]
    },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      role: 'user',
      status: 'active',
      banned: false,
      lastLogin: '2024-01-15 11:30:00',
      loginCount: 67,
      permissions: ['read', 'write'],
      activity: [
        { action: 'Login', timestamp: '2024-01-15 11:30:00', ip: '192.168.1.104' },
        { action: 'View Network', timestamp: '2024-01-15 11:35:18', ip: '192.168.1.104' }
      ]
    }
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserActivityModal, setShowUserActivityModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    permissions: ['read']
  });

  const systemStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    inactiveUsers: users.filter(u => u.status === 'inactive').length,
    bannedUsers: users.filter(u => u.banned === true).length
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const user = {
        id: users.length + 1,
        ...newUser,
        status: 'active',
        banned: false,
        lastLogin: 'Never',
        loginCount: 0,
        permissions: newUser.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read'],
        activity: []
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'user', permissions: ['read'] });
      setShowAddUserModal(false);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleBanUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, banned: !user.banned, status: user.banned ? 'active' : 'banned' }
        : user
    ));
  };

  const handleAssignRole = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            role: newRole,
            permissions: newRole === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read', 'write']
          }
        : user
    ));
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleViewUserActivity = (user) => {
    setSelectedUser(user);
    setShowUserActivityModal(true);
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? '#ff3366' : '#00f5ff';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#00f5ff' : '#ffaa00';
  };

  return (
    <div className="admin-panel-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">User management and system administration</p>
      </div>

      <div className="admin-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{systemStats.totalUsers}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{systemStats.activeUsers}</span>
            <span className="stat-label">Active Users</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{systemStats.adminUsers}</span>
            <span className="stat-label">Admin Users</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{systemStats.inactiveUsers}</span>
            <span className="stat-label">Inactive Users</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{systemStats.bannedUsers}</span>
            <span className="stat-label">Banned Users</span>
          </div>
        </Card>
      </div>

      <div className="admin-actions">
        <Card className="actions-card">
          <div className="actions-header">
            <h3>User Management</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddUserModal(true)}
            >
              Add User
            </button>
          </div>
          <div className="action-buttons">
            <button className="btn btn-outline">Export Users</button>
            <button className="btn btn-outline">Import Users</button>
            <button className="btn btn-outline">Send Notifications</button>
            <button className="btn btn-outline">System Backup</button>
          </div>
        </Card>
      </div>

      <Card className="users-table-card">
        <div className="table-header">
          <h3>User List</h3>
          <div className="table-actions">
            <button className="btn btn-outline">Refresh</button>
            <button className="btn btn-outline">Filter</button>
          </div>
        </div>
        <div className="users-table">
          <div className="table-head">
            <div className="table-row">
              <div className="table-cell">User</div>
              <div className="table-cell">Role</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Last Login</div>
              <div className="table-cell">Login Count</div>
              <div className="table-cell">Actions</div>
            </div>
          </div>
          <div className="table-body">
            {users.map((user) => (
              <div key={user.id} className={`table-row ${user.banned ? 'banned' : ''}`}>
                <div className="table-cell user-info">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                    {user.banned && <span className="banned-badge">BANNED</span>}
                  </div>
                </div>
                <div className="table-cell">
                  <select
                    value={user.role}
                    onChange={(e) => handleAssignRole(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="table-cell">
                  <span 
                    className={`status-badge ${user.status}`}
                    style={{ backgroundColor: getStatusColor(user.status) }}
                  >
                    {user.status.toUpperCase()}
                  </span>
                </div>
                <div className="table-cell last-login">
                  {user.lastLogin}
                </div>
                <div className="table-cell login-count">
                  {user.loginCount}
                </div>
                <div className="table-cell actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleViewUserActivity(user)}
                  >
                    Activity
                  </button>
                  <button 
                    className={`btn btn-sm ${user.banned ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => handleBanUser(user.id)}
                  >
                    {user.banned ? 'Unban' : 'Ban'}
                  </button>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleToggleUserStatus(user.id)}
                    disabled={user.banned}
                  >
                    {user.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    className="btn btn-sm btn-outline danger"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {showAddUserModal && (
        <div className="modal-overlay">
          <Card className="modal-card">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button 
                className="btn btn-outline"
                onClick={() => setShowAddUserModal(false)}
              >
                Cancel
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter user name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email address"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="form-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowAddUserModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddUser}
              >
                Add User
              </button>
            </div>
          </Card>
        </div>
      )}

      {showUserActivityModal && selectedUser && (
        <div className="modal-overlay">
          <Card className="modal-card activity-modal">
            <div className="modal-header">
              <h3>User Activity - {selectedUser.name}</h3>
              <button 
                className="btn btn-outline"
                onClick={() => setShowUserActivityModal(false)}
              >
                Close
              </button>
            </div>
            <div className="modal-content">
              <div className="user-summary">
                <div className="summary-item">
                  <span className="summary-label">Email:</span>
                  <span className="summary-value">{selectedUser.email}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Role:</span>
                  <span className="summary-value">{selectedUser.role.toUpperCase()}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Status:</span>
                  <span className="summary-value">{selectedUser.status.toUpperCase()}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Logins:</span>
                  <span className="summary-value">{selectedUser.loginCount}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Last Login:</span>
                  <span className="summary-value">{selectedUser.lastLogin}</span>
                </div>
              </div>
              <div className="activity-log">
                <h4>Recent Activity</h4>
                <div className="activity-list">
                  {selectedUser.activity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-action">{activity.action}</div>
                      <div className="activity-timestamp">{activity.timestamp}</div>
                      <div className="activity-ip">IP: {activity.ip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowUserActivityModal(false)}
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}

      <div className="system-settings">
        <Card className="settings-card">
          <h3>System Settings</h3>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">User Registration</span>
                <span className="setting-description">Allow new user registration</span>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Email Notifications</span>
                <span className="setting-description">Send email alerts to users</span>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Two-Factor Auth</span>
                <span className="setting-description">Require 2FA for all users</span>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
