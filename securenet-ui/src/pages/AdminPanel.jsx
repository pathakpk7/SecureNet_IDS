import React, { useState } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/admin.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 14:30:00',
      permissions: ['read', 'write', 'delete', 'admin']
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-01-15 13:45:00',
      permissions: ['read', 'write']
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'user',
      status: 'inactive',
      lastLogin: '2024-01-14 16:20:00',
      permissions: ['read']
    },
    {
      id: 4,
      name: 'Alice Wilson',
      email: 'alice.wilson@example.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 12:15:00',
      permissions: ['read', 'write', 'delete', 'admin']
    },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-01-15 11:30:00',
      permissions: ['read', 'write']
    }
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
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
    inactiveUsers: users.filter(u => u.status === 'inactive').length
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const user = {
        id: users.length + 1,
        ...newUser,
        status: 'active',
        lastLogin: 'Never',
        permissions: newUser.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read']
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'user', permissions: ['read'] });
      setShowAddUserModal(false);
    }
  };

  const handleRemoveUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
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
              <div className="table-cell">Permissions</div>
              <div className="table-cell">Actions</div>
            </div>
          </div>
          <div className="table-body">
            {users.map((user) => (
              <div key={user.id} className="table-row">
                <div className="table-cell user-info">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                </div>
                <div className="table-cell">
                  <span 
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <div className="table-cell">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(user.status) }}
                  >
                    {user.status.toUpperCase()}
                  </span>
                </div>
                <div className="table-cell last-login">
                  {user.lastLogin}
                </div>
                <div className="table-cell permissions">
                  <div className="permission-tags">
                    {user.permissions.map((perm, index) => (
                      <span key={index} className="permission-tag">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="table-cell actions">
                  <button className="btn btn-sm btn-outline">Edit</button>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleToggleUserStatus(user.id)}
                  >
                    {user.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    Remove
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
